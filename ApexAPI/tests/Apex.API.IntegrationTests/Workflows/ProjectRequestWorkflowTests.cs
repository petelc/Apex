using Apex.API.Core.Aggregates.ProjectRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.IntegrationTests.Infrastructure;
using Apex.API.UseCases.Common.Interfaces;
using Apex.API.UseCases.ProjectRequests.Approve;
using Apex.API.UseCases.ProjectRequests.Create;
using Apex.API.UseCases.ProjectRequests.Deny;
using Apex.API.UseCases.ProjectRequests.Submit;

namespace Apex.API.IntegrationTests.Workflows;

/// <summary>
/// Integration tests for the ProjectRequest workflow.
/// Verifies handler → repository → database roundtrips using EF Core InMemory.
/// </summary>
public class ProjectRequestWorkflowTests : BaseIntegrationFixture
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

    private ICurrentUserService CurrentUser(bool isAdmin = true)
    {
        var svc = Substitute.For<ICurrentUserService>();
        svc.UserId.Returns(_userId);
        svc.IsInRole("TenantAdmin").Returns(isAdmin);
        return svc;
    }

    private static CreateProjectRequestCommand ValidCreateCommand() => new(
        Title: "Customer Self-Service Portal",
        Description: "Build a self-service portal for customers to track their orders and raise support tickets",
        BusinessJustification: "Reduce inbound support calls by 25% and improve customer satisfaction scores",
        Priority: null,
        DueDate: null,
        EstimatedBudget: null,
        ProposedStartDate: null,
        ProposedEndDate: null);

    // ─── Repository round-trip ────────────────────────────────────────────────

    [Fact]
    public async Task Repository_CanSaveAndRetrieve_ProjectRequest()
    {
        var request = ProjectRequest.Create(
            _tenantId,
            "New DevOps Pipeline",
            "Automate build and deployment pipeline for all services",
            "Current manual process takes 4 hours per deployment",
            _userId);

        await using var writeCtx = CreateContext();
        var writeRepo = CreateRepo<ProjectRequest>(writeCtx);
        await writeRepo.AddAsync(request);
        await writeCtx.SaveChangesAsync();

        await using var readCtx = CreateContext();
        var readRepo = CreateRepo<ProjectRequest>(readCtx);
        var retrieved = await readRepo.GetByIdAsync(request.Id);

        retrieved.ShouldNotBeNull();
        retrieved!.Title.ShouldBe("New DevOps Pipeline");
        retrieved.Status.ShouldBe(ProjectRequestStatus.Draft);
        retrieved.TenantId.ShouldBe(_tenantId);
    }

    [Fact]
    public async Task Repository_StatusChanges_ArePersisted()
    {
        var request = ProjectRequest.Create(
            _tenantId,
            "Mobile App Redesign",
            "Complete visual overhaul of the mobile application for iOS and Android",
            "User retention metrics show 40% drop-off due to outdated UI",
            _userId);

        await using (var ctx = CreateContext())
        {
            await CreateRepo<ProjectRequest>(ctx).AddAsync(request);
            await ctx.SaveChangesAsync();
        }

        // Submit
        await using (var ctx = CreateContext())
        {
            var repo = CreateRepo<ProjectRequest>(ctx);
            var entity = await repo.GetByIdAsync(request.Id);
            entity!.Submit(_userId);
            await repo.UpdateAsync(entity);
            await ctx.SaveChangesAsync();
        }

        await using var readCtx = CreateContext();
        var submitted = await CreateRepo<ProjectRequest>(readCtx).GetByIdAsync(request.Id);

        submitted!.Status.ShouldBe(ProjectRequestStatus.Pending);
        submitted.SubmittedDate.ShouldNotBeNull();
    }

    // ─── Handler workflow ─────────────────────────────────────────────────────

    [Fact]
    public async Task Handler_CreateProjectRequest_PersistsToDatabase()
    {
        ProjectRequestId createdId;

        await using (var ctx = CreateContext())
        {
            var handler = new CreateProjectRequestHandler(
                CreateRepo<ProjectRequest>(ctx),
                TenantCtx(),
                CurrentUser(),
                Substitute.For<ILogger<CreateProjectRequestHandler>>());

            var result = await handler.Handle(ValidCreateCommand(), CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            createdId = result.Value;
            await ctx.SaveChangesAsync();
        }

        await using var readCtx = CreateContext();
        var stored = await CreateRepo<ProjectRequest>(readCtx).GetByIdAsync(createdId);

        stored.ShouldNotBeNull();
        stored!.Title.ShouldBe("Customer Self-Service Portal");
        stored.Status.ShouldBe(ProjectRequestStatus.Draft);
        stored.TenantId.ShouldBe(_tenantId);
    }

    [Fact]
    public async Task Handler_SubmitAndApprove_WorkflowPersists()
    {
        // Create
        ProjectRequestId id;
        await using (var ctx = CreateContext())
        {
            var createHandler = new CreateProjectRequestHandler(
                CreateRepo<ProjectRequest>(ctx),
                TenantCtx(),
                CurrentUser(),
                Substitute.For<ILogger<CreateProjectRequestHandler>>());

            var result = await createHandler.Handle(ValidCreateCommand(), CancellationToken.None);
            id = result.Value;
            await ctx.SaveChangesAsync();
        }

        // Submit
        await using (var ctx = CreateContext())
        {
            var handler = new SubmitProjectRequestHandler(
                CreateRepo<ProjectRequest>(ctx),
                TenantCtx(),
                CurrentUser(),
                Substitute.For<ILogger<SubmitProjectRequestHandler>>());

            var result = await handler.Handle(
                new SubmitProjectRequestCommand(id), CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            await ctx.SaveChangesAsync();
        }

        // Approve
        await using (var ctx = CreateContext())
        {
            var handler = new ApproveProjectRequestHandler(
                CreateRepo<ProjectRequest>(ctx),
                TenantCtx(),
                CurrentUser(isAdmin: true),
                Substitute.For<ILogger<ApproveProjectRequestHandler>>());

            var result = await handler.Handle(
                new ApproveProjectRequestCommand(id, "Strategically aligned with Q3 goals"),
                CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            await ctx.SaveChangesAsync();
        }

        // Verify final state
        await using var readCtx = CreateContext();
        var approved = await CreateRepo<ProjectRequest>(readCtx).GetByIdAsync(id);

        approved!.Status.ShouldBe(ProjectRequestStatus.Approved);
        approved.ApprovalNotes.ShouldBe("Strategically aligned with Q3 goals");
        approved.ApprovedDate.ShouldNotBeNull();
        approved.ApprovedByUserId.ShouldBe(_userId);
    }

    [Fact]
    public async Task Handler_DenyProjectRequest_PersistsDenialReason()
    {
        ProjectRequestId id;
        await using (var ctx = CreateContext())
        {
            var pr = ProjectRequest.Create(
                _tenantId,
                "Risky refactor proposal",
                "Complete rewrite of core billing service with experimental technology",
                "Reduce technical debt and improve scalability for 10x growth",
                _userId);

            pr.Submit(_userId);
            await CreateRepo<ProjectRequest>(ctx).AddAsync(pr);
            await ctx.SaveChangesAsync();
            id = pr.Id;
        }

        await using (var ctx = CreateContext())
        {
            var handler = new DenyProjectRequestHandler(
                CreateRepo<ProjectRequest>(ctx),
                TenantCtx(),
                CurrentUser(isAdmin: true),
                Substitute.For<ILogger<DenyProjectRequestHandler>>());

            var result = await handler.Handle(
                new DenyProjectRequestCommand(id, "Too risky for current quarter"),
                CancellationToken.None);

            result.IsSuccess.ShouldBeTrue();
            await ctx.SaveChangesAsync();
        }

        await using var readCtx = CreateContext();
        var denied = await CreateRepo<ProjectRequest>(readCtx).GetByIdAsync(id);

        denied!.Status.ShouldBe(ProjectRequestStatus.Denied);
        denied.DenialReason.ShouldBe("Too risky for current quarter");
        denied.DeniedDate.ShouldNotBeNull();
    }

    // ─── Authorization ────────────────────────────────────────────────────────

    [Fact]
    public async Task Handler_ApproveProjectRequest_WhenNotAdmin_ReturnsForbidden()
    {
        ProjectRequestId id;
        await using (var ctx = CreateContext())
        {
            var pr = ProjectRequest.Create(
                _tenantId,
                "Data warehouse upgrade",
                "Upgrade data warehouse to support real-time analytics and ML workloads",
                "Current system cannot handle the 5TB daily data volume from new IoT sensors",
                _userId);

            pr.Submit(_userId);
            await CreateRepo<ProjectRequest>(ctx).AddAsync(pr);
            await ctx.SaveChangesAsync();
            id = pr.Id;
        }

        await using var approveCtx = CreateContext();
        var handler = new ApproveProjectRequestHandler(
            CreateRepo<ProjectRequest>(approveCtx),
            TenantCtx(),
            CurrentUser(isAdmin: false),
            Substitute.For<ILogger<ApproveProjectRequestHandler>>());

        var result = await handler.Handle(
            new ApproveProjectRequestCommand(id), CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.Forbidden);
    }

    // ─── Tenant isolation ─────────────────────────────────────────────────────

    [Fact]
    public async Task Handler_WhenTenantMismatch_ReturnsForbidden()
    {
        ProjectRequestId id;
        await using (var ctx = CreateContext())
        {
            var pr = ProjectRequest.Create(
                _tenantId,
                "Tenant A request",
                "This belongs to Tenant A and should not be accessible by Tenant B",
                "Internal business justification for tenant isolation test",
                _userId);

            pr.Submit(_userId);
            await CreateRepo<ProjectRequest>(ctx).AddAsync(pr);
            await ctx.SaveChangesAsync();
            id = pr.Id;
        }

        var otherTenant = Substitute.For<ITenantContext>();
        otherTenant.CurrentTenantId.Returns(TenantId.From(Guid.NewGuid()));

        var otherUser = Substitute.For<ICurrentUserService>();
        otherUser.UserId.Returns(Guid.NewGuid());
        otherUser.IsInRole("TenantAdmin").Returns(true);

        await using var approveCtx = CreateContext();
        var handler = new ApproveProjectRequestHandler(
            CreateRepo<ProjectRequest>(approveCtx),
            otherTenant,
            otherUser,
            Substitute.For<ILogger<ApproveProjectRequestHandler>>());

        var result = await handler.Handle(
            new ApproveProjectRequestCommand(id), CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.Forbidden);
    }
}