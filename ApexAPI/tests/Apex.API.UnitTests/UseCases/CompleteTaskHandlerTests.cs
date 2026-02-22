using Apex.API.Core.Interfaces;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.Common.Interfaces;
using Apex.API.UseCases.Tasks.Complete;
using WorkTask = Apex.API.Core.Aggregates.TaskAggregate.Task;

namespace Apex.API.UnitTests.UseCases;

public class CompleteTaskHandlerTests
{
    // ─── Fixtures ─────────────────────────────────────────────────────────────

    private readonly IRepository<WorkTask> _repo = Substitute.For<IRepository<WorkTask>>();
    private readonly ITenantContext _tenantContext = Substitute.For<ITenantContext>();
    private readonly ICurrentUserService _currentUser = Substitute.For<ICurrentUserService>();
    private readonly ILogger<CompleteTaskHandler> _logger = Substitute.For<ILogger<CompleteTaskHandler>>();

    private readonly TenantId _tenantId = TenantId.From(Guid.NewGuid());
    private readonly Guid _userId = Guid.NewGuid();

    private CompleteTaskHandler CreateHandler() =>
        new(_repo, _tenantContext, _currentUser, _logger);

    private WorkTask CreateInProgressTask(TenantId? tenantId = null)
    {
        var task = WorkTask.Create(
            tenantId: tenantId ?? _tenantId,
            projectId: ProjectId.CreateUnique(),
            title: "Fix login bug",
            description: "Users cannot log in with SSO",
            priority: RequestPriority.High,
            createdByUserId: _userId);

        task.Start(_userId);
        return task;
    }

    // Use concrete IDs to avoid NSubstitute generic-method arg-spec issues
    private void ArrangeRepoReturns(WorkTask task) =>
        _repo.GetByIdAsync(task.Id, CancellationToken.None).Returns(task);

    public CompleteTaskHandlerTests()
    {
        _tenantContext.CurrentTenantId.Returns(_tenantId);
        _currentUser.UserId.Returns(_userId);
    }

    // ─── Happy path ───────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WithValidInProgressTask_ReturnsSuccess()
    {
        var task = CreateInProgressTask();
        ArrangeRepoReturns(task);

        var result = await CreateHandler().Handle(
            new CompleteTaskCommand(task.Id),
            CancellationToken.None);

        result.IsSuccess.ShouldBeTrue();
    }

    [Fact]
    public async Task Handle_WithValidTask_CallsUpdateAsync()
    {
        var task = CreateInProgressTask();
        ArrangeRepoReturns(task);

        await CreateHandler().Handle(
            new CompleteTaskCommand(task.Id),
            CancellationToken.None);

        await _repo.Received(1).UpdateAsync(Arg.Any<WorkTask>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithResolutionNotes_PassesNotesToTask()
    {
        var task = CreateInProgressTask();
        ArrangeRepoReturns(task);

        await CreateHandler().Handle(
            new CompleteTaskCommand(task.Id, "All tests pass"),
            CancellationToken.None);

        task.ResolutionNotes.ShouldBe("All tests pass");
    }

    // ─── Not found ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenTaskNotFound_ReturnsNotFound()
    {
        // No repo setup → NSubstitute returns default (null) for Task<WorkTask?>
        var result = await CreateHandler().Handle(
            new CompleteTaskCommand(TaskId.CreateUnique()),
            CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.NotFound);
    }

    // ─── Tenant isolation ─────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenTaskBelongsToDifferentTenant_ReturnsForbidden()
    {
        var otherTenantId = TenantId.From(Guid.NewGuid());
        var task = CreateInProgressTask(tenantId: otherTenantId);
        ArrangeRepoReturns(task);

        var result = await CreateHandler().Handle(
            new CompleteTaskCommand(task.Id),
            CancellationToken.None);

        result.Status.ShouldBe(Ardalis.Result.ResultStatus.Forbidden);
    }

    // ─── Invalid state ────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenTaskAlreadyCompleted_ReturnsError()
    {
        var task = CreateInProgressTask();
        task.Complete(_userId);
        ArrangeRepoReturns(task);

        var result = await CreateHandler().Handle(
            new CompleteTaskCommand(task.Id),
            CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
    }

    [Fact]
    public async Task Handle_WhenTaskNotStarted_ReturnsError()
    {
        var task = WorkTask.Create(
            tenantId: _tenantId,
            projectId: ProjectId.CreateUnique(),
            title: "Not started task",
            description: "This task was never started",
            priority: RequestPriority.Low,
            createdByUserId: _userId);

        ArrangeRepoReturns(task);

        var result = await CreateHandler().Handle(
            new CompleteTaskCommand(task.Id),
            CancellationToken.None);

        result.IsSuccess.ShouldBeFalse();
    }
}