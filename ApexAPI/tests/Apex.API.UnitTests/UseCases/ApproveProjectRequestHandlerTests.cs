using Apex.API.Core.Aggregates.ProjectRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.Common.Interfaces;
using Apex.API.UseCases.ProjectRequests.Approve;

namespace Apex.API.UnitTests.UseCases;

public class ApproveProjectRequestHandlerTests
{
    // ─── Fixtures ─────────────────────────────────────────────────────────────

    private readonly IRepository<ProjectRequest> _repo = Substitute.For<IRepository<ProjectRequest>>();
    private readonly ITenantContext _tenantContext = Substitute.For<ITenantContext>();
    private readonly ICurrentUserService _currentUser = Substitute.For<ICurrentUserService>();
    private readonly ILogger<ApproveProjectRequestHandler> _logger = Substitute.For<ILogger<ApproveProjectRequestHandler>>();

    private readonly TenantId _tenantId = TenantId.From(Guid.NewGuid());
    private readonly Guid _adminUserId = Guid.NewGuid();

    private ApproveProjectRequestHandler CreateHandler() =>
        new(_repo, _tenantContext, _currentUser, _logger);

    private ProjectRequest CreatePendingRequest(TenantId? tenantId = null)
    {
        var request = ProjectRequest.Create(
            tenantId: tenantId ?? _tenantId,
            title: "New customer portal",
            description: "Build a self-service customer portal for support tickets",
            businessJustification: "Reduce support call volume by 30% within 6 months",
            createdByUserId: Guid.NewGuid());

        request.Submit(Guid.NewGuid());
        return request;
    }

    // Use concrete IDs to avoid NSubstitute generic-method arg-spec issues
    private void ArrangeRepoReturns(ProjectRequest? request, ProjectRequestId? id = null) =>
        _repo.GetByIdAsync(id ?? request!.Id, CancellationToken.None).Returns(request);

    public ApproveProjectRequestHandlerTests()
    {
        _tenantContext.CurrentTenantId.Returns(_tenantId);
        _currentUser.UserId.Returns(_adminUserId);
        _currentUser.IsInRole("TenantAdmin").Returns(true);
    }

    // ─── Happy path ───────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_AsAdmin_WithPendingRequest_ReturnsSuccess()
    {
        var request = CreatePendingRequest();
        ArrangeRepoReturns(request);

        var result = await CreateHandler().Handle(
            new ApproveProjectRequestCommand(request.Id),
            CancellationToken.None);

        result.IsSuccess.ShouldBeTrue();
    }

    [Fact]
    public async Task Handle_AsAdmin_WithPendingRequest_CallsUpdateAsync()
    {
        var request = CreatePendingRequest();
        ArrangeRepoReturns(request);

        await CreateHandler().Handle(
            new ApproveProjectRequestCommand(request.Id),
            CancellationToken.None);

        await _repo.Received(1).UpdateAsync(Arg.Any<ProjectRequest>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsAdmin_ApprovesWithNotes_Succeeds()
    {
        var request = CreatePendingRequest();
        ArrangeRepoReturns(request);

        var result = await CreateHandler().Handle(
            new ApproveProjectRequestCommand(request.Id, "Approved by CTO"),
            CancellationToken.None);

        result.IsSuccess.ShouldBeTrue();
        request.ApprovalNotes.ShouldBe("Approved by CTO");
    }

    // ─── Authorization ────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenNotAdmin_ReturnsForbidden()
    {
        _currentUser.IsInRole("TenantAdmin").Returns(false);

        var result = await CreateHandler().Handle(
            new ApproveProjectRequestCommand(ProjectRequestId.CreateUnique()),
            CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.Forbidden);
    }

    // ─── Not found ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenRequestNotFound_ReturnsNotFound()
    {
        // No repo setup → NSubstitute returns default (null) for Task<ProjectRequest?>
        var result = await CreateHandler().Handle(
            new ApproveProjectRequestCommand(ProjectRequestId.CreateUnique()),
            CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.NotFound);
    }

    // ─── Tenant isolation ─────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenRequestBelongsToDifferentTenant_ReturnsForbidden()
    {
        var otherTenant = TenantId.From(Guid.NewGuid());
        var request = CreatePendingRequest(tenantId: otherTenant);
        ArrangeRepoReturns(request);

        var result = await CreateHandler().Handle(
            new ApproveProjectRequestCommand(request.Id),
            CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.Forbidden);
    }

    // ─── Invalid state ────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenRequestAlreadyApproved_ReturnsError()
    {
        var request = CreatePendingRequest();
        request.Approve(_adminUserId);
        ArrangeRepoReturns(request);

        var result = await CreateHandler().Handle(
            new ApproveProjectRequestCommand(request.Id),
            CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
    }

    [Fact]
    public async Task Handle_WhenRequestIsDraft_ReturnsError()
    {
        var request = ProjectRequest.Create(
            tenantId: _tenantId,
            title: "New customer portal",
            description: "Build a self-service customer portal for support tickets",
            businessJustification: "Reduce support call volume by 30% within 6 months",
            createdByUserId: Guid.NewGuid());

        ArrangeRepoReturns(request);

        var result = await CreateHandler().Handle(
            new ApproveProjectRequestCommand(request.Id),
            CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
    }
}