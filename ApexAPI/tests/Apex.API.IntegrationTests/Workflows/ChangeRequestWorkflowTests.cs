using Apex.API.Core.Aggregates.ChangeRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.IntegrationTests.Infrastructure;
using Apex.API.UseCases.ChangeRequests.Approve;
using Apex.API.UseCases.ChangeRequests.Cancel;
using Apex.API.UseCases.ChangeRequests.Create;
using Apex.API.UseCases.ChangeRequests.StartReview;
using Apex.API.UseCases.ChangeRequests.Submit;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.IntegrationTests.Workflows;

/// <summary>
/// Integration tests for the ChangeRequest workflow.
/// Each test uses a real EF Core InMemory database to verify
/// that handler → repository → database roundtrips work correctly.
/// </summary>
public class ChangeRequestWorkflowTests : BaseIntegrationFixture
{
    // ─── Shared mocks ────────────────────────────────────────────────────────

    private readonly TenantId _tenantId = TenantId.From(Guid.NewGuid());
    private readonly Guid _userId = Guid.NewGuid();

    private ITenantContext TenantCtx()
    {
        var ctx = Substitute.For<ITenantContext>();
        ctx.CurrentTenantId.Returns(_tenantId);
        return ctx;
    }

    private ICurrentUserService CurrentUser(bool isAdmin = false)
    {
        var svc = Substitute.For<ICurrentUserService>();
        svc.UserId.Returns(_userId);
        svc.IsInRole(Arg.Any<string>()).Returns(isAdmin);
        return svc;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static CreateChangeRequestCommand ValidCreateCommand() => new(
        Title: "Deploy auth service v2.1",
        Description: "Update auth service to v2.1 with MFA support",
        ChangeType: "Normal",
        Priority: "Medium",
        RiskLevel: "Medium",
        ImpactAssessment: "Users will need to re-authenticate",
        RollbackPlan: "Revert to v2.0 artifact",
        AffectedSystems: "AuthService, APIGateway");

    // ─── Repository round-trip ────────────────────────────────────────────────

    [Fact]
    public async Task Repository_CanSaveAndRetrieve_ChangeRequest()
    {
        var changeRequest = ChangeRequest.Create(
            _tenantId, "Deploy auth", "Description of the change",
            _userId, ChangeType.Normal, RequestPriority.Medium,
            RiskLevel.Medium, "Impact here", "Rollback here", "AuthService");

        // Save via repository
        await using var writeCtx = CreateContext();
        var writeRepo = CreateRepo<ChangeRequest>(writeCtx);
        await writeRepo.AddAsync(changeRequest);
        await writeCtx.SaveChangesAsync();

        // Retrieve via a fresh context (different change-tracker)
        await using var readCtx = CreateContext();
        var readRepo = CreateRepo<ChangeRequest>(readCtx);
        var retrieved = await readRepo.GetByIdAsync(changeRequest.Id);

        retrieved.ShouldNotBeNull();
        retrieved!.Title.ShouldBe("Deploy auth");
        retrieved.Status.ShouldBe(ChangeRequestStatus.Draft);
        retrieved.TenantId.ShouldBe(_tenantId);
    }

    [Fact]
    public async Task Repository_StatusChanges_ArePersisted()
    {
        // Save a draft change request
        var cr = ChangeRequest.Create(
            _tenantId, "Network config update", "Reconfigure firewall rules",
            _userId, ChangeType.Standard, RequestPriority.Low,
            RiskLevel.Low, "Brief outage", "Revert config", "Firewall");

        await using (var ctx = CreateContext())
        {
            var repo = CreateRepo<ChangeRequest>(ctx);
            await repo.AddAsync(cr);
            await ctx.SaveChangesAsync();
        }

        // Submit it
        await using (var ctx = CreateContext())
        {
            var repo = CreateRepo<ChangeRequest>(ctx);
            var entity = await repo.GetByIdAsync(cr.Id);
            entity!.Submit();
            await repo.UpdateAsync(entity);
            await ctx.SaveChangesAsync();
        }

        // Verify submitted status survives round-trip
        await using var readCtx = CreateContext();
        var readRepo = CreateRepo<ChangeRequest>(readCtx);
        var submitted = await readRepo.GetByIdAsync(cr.Id);

        submitted!.Status.ShouldBe(ChangeRequestStatus.Submitted);
        submitted.SubmittedDate.ShouldNotBeNull();
    }

    // ─── Handler workflow ─────────────────────────────────────────────────────

    [Fact]
    public async Task Handler_CreateChangeRequest_PersistsToDatabase()
    {
        ChangeRequestId createdId;

        await using (var ctx = CreateContext())
        {
            var handler = new CreateChangeRequestHandler(
                CreateRepo<ChangeRequest>(ctx),
                TenantCtx(),
                CurrentUser(),
                Substitute.For<ILogger<CreateChangeRequestHandler>>());

            var result = await handler.Handle(ValidCreateCommand(), CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            createdId = result.Value;
            await ctx.SaveChangesAsync();
        }

        // Verify it's in the database
        await using var readCtx = CreateContext();
        var stored = await CreateRepo<ChangeRequest>(readCtx).GetByIdAsync(createdId);

        stored.ShouldNotBeNull();
        stored!.Title.ShouldBe("Deploy auth service v2.1");
        stored.Status.ShouldBe(ChangeRequestStatus.Draft);
        stored.TenantId.ShouldBe(_tenantId);
    }

    [Fact]
    public async Task Handler_SubmitChangeRequest_TransitionsStatus()
    {
        // Create
        ChangeRequestId id;
        await using (var ctx = CreateContext())
        {
            var createHandler = new CreateChangeRequestHandler(
                CreateRepo<ChangeRequest>(ctx),
                TenantCtx(),
                CurrentUser(),
                Substitute.For<ILogger<CreateChangeRequestHandler>>());

            var createResult = await createHandler.Handle(ValidCreateCommand(), CancellationToken.None);
            id = createResult.Value;
            await ctx.SaveChangesAsync();
        }

        // Submit
        await using (var ctx = CreateContext())
        {
            var submitHandler = new SubmitChangeRequestHandler(
                CreateRepo<ChangeRequest>(ctx),
                TenantCtx(),
                CurrentUser(),
                Substitute.For<ILogger<SubmitChangeRequestHandler>>());

            var result = await submitHandler.Handle(
                new SubmitChangeRequestCommand(id), CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            await ctx.SaveChangesAsync();
        }

        // Verify
        await using var readCtx = CreateContext();
        var stored = await CreateRepo<ChangeRequest>(readCtx).GetByIdAsync(id);

        stored!.Status.ShouldBe(ChangeRequestStatus.Submitted);
        stored.SubmittedDate.ShouldNotBeNull();
    }

    [Fact]
    public async Task Handler_FullApprovalWorkflow_StatusIsDraftThenApproved()
    {
        // Create → Submit → StartReview → Approve
        ChangeRequestId id;

        await using (var ctx = CreateContext())
        {
            var cr = ChangeRequest.Create(
                _tenantId, "SSL cert renewal", "Renew expiring SSL certificates",
                _userId, ChangeType.Normal, RequestPriority.High,
                RiskLevel.Low, "Brief HTTPS downtime", "Keep old cert active", "WebServer");

            await CreateRepo<ChangeRequest>(ctx).AddAsync(cr);
            await ctx.SaveChangesAsync();
            id = cr.Id;
        }

        // Submit
        await using (var ctx = CreateContext())
        {
            var cr = await CreateRepo<ChangeRequest>(ctx).GetByIdAsync(id);
            cr!.Submit();
            await CreateRepo<ChangeRequest>(ctx).UpdateAsync(cr);
            await ctx.SaveChangesAsync();
        }

        // StartReview
        await using (var ctx = CreateContext())
        {
            var handler = new StartReviewChangeRequestHandler(
                CreateRepo<ChangeRequest>(ctx),
                TenantCtx(),
                CurrentUser(isAdmin: true),
                Substitute.For<ILogger<StartReviewChangeRequestHandler>>());

            var result = await handler.Handle(
                new StartReviewChangeRequestCommand(id), CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            await ctx.SaveChangesAsync();
        }

        // Approve
        await using (var ctx = CreateContext())
        {
            var handler = new ApproveChangeRequestHandler(
                CreateRepo<ChangeRequest>(ctx),
                TenantCtx(),
                CurrentUser(isAdmin: true),
                Substitute.For<ILogger<ApproveChangeRequestHandler>>());

            var result = await handler.Handle(
                new ApproveChangeRequestCommand(id, "LGTM"), CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            await ctx.SaveChangesAsync();
        }

        // Verify final state
        await using var readCtx = CreateContext();
        var approved = await CreateRepo<ChangeRequest>(readCtx).GetByIdAsync(id);

        approved!.Status.ShouldBe(ChangeRequestStatus.Approved);
        approved.ApprovedDate.ShouldNotBeNull();
        approved.ApprovalNotes.ShouldBe("LGTM");
    }

    [Fact]
    public async Task Handler_CancelChangeRequest_MarksAsCancelled()
    {
        ChangeRequestId id;
        await using (var ctx = CreateContext())
        {
            var cr = ChangeRequest.Create(
                _tenantId, "Abandon this change", "No longer needed",
                _userId, ChangeType.Standard, RequestPriority.Low,
                RiskLevel.Low, "None", "N/A", "None");

            await CreateRepo<ChangeRequest>(ctx).AddAsync(cr);
            await ctx.SaveChangesAsync();
            id = cr.Id;
        }

        await using (var ctx = CreateContext())
        {
            var handler = new CancelChangeRequestHandler(
                CreateRepo<ChangeRequest>(ctx),
                TenantCtx(),
                Substitute.For<ILogger<CancelChangeRequestHandler>>());

            var result = await handler.Handle(
                new CancelChangeRequestCommand(id), CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            await ctx.SaveChangesAsync();
        }

        await using var readCtx = CreateContext();
        var cancelled = await CreateRepo<ChangeRequest>(readCtx).GetByIdAsync(id);

        cancelled!.Status.ShouldBe(ChangeRequestStatus.Cancelled);
    }

    // ─── Tenant isolation ─────────────────────────────────────────────────────

    [Fact]
    public async Task Handler_WhenTenantMismatch_ReturnsForbidden()
    {
        ChangeRequestId id;
        await using (var ctx = CreateContext())
        {
            var cr = ChangeRequest.Create(
                _tenantId, "Tenant A change", "Belongs to tenant A",
                _userId, ChangeType.Normal, RequestPriority.Medium,
                RiskLevel.Medium, "Impact", "Rollback", "Systems");

            await CreateRepo<ChangeRequest>(ctx).AddAsync(cr);
            await ctx.SaveChangesAsync();
            id = cr.Id;
        }

        // Attempt to submit from a different tenant
        var differentTenant = Substitute.For<ITenantContext>();
        differentTenant.CurrentTenantId.Returns(TenantId.From(Guid.NewGuid()));

        await using var ctx2 = CreateContext();
        var handler = new SubmitChangeRequestHandler(
            CreateRepo<ChangeRequest>(ctx2),
            differentTenant,
            CurrentUser(),
            Substitute.For<ILogger<SubmitChangeRequestHandler>>());

        var result = await handler.Handle(
            new SubmitChangeRequestCommand(id), CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.Forbidden);
    }
}