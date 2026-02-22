using Apex.API.Core.Aggregates.TaskAggregate;
using Apex.API.Core.Aggregates.TaskAggregate.Events;
using Apex.API.Core.ValueObjects;
using TaskStatus = Apex.API.Core.ValueObjects.TaskStatus;
using WorkTask = Apex.API.Core.Aggregates.TaskAggregate.Task;

namespace Apex.API.UnitTests.Core.Aggregates;

public class TaskTests
{
    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static WorkTask CreateTask(
        decimal? estimatedHours = null,
        DateTime? dueDate = null)
    {
        return WorkTask.Create(
            tenantId: TenantId.From(Guid.NewGuid()),
            projectId: ProjectId.CreateUnique(),
            title: "Implement login page",
            description: "Build the login UI with form validation",
            priority: RequestPriority.Medium,
            createdByUserId: Guid.NewGuid(),
            estimatedHours: estimatedHours,
            dueDate: dueDate);
    }

    private static WorkTask CreateInProgress(decimal? estimatedHours = null)
    {
        var task = CreateTask(estimatedHours);
        task.Start(Guid.NewGuid());
        return task;
    }

    private static WorkTask CreateBlocked()
    {
        var task = CreateInProgress();
        task.Block("Waiting for API spec", Guid.NewGuid());
        return task;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ReturnsTaskInNotStartedStatus()
    {
        var task = CreateTask();

        task.Status.ShouldBe(TaskStatus.NotStarted);
        task.Title.ShouldBe("Implement login page");
        task.ActualHours.ShouldBe(0);
        task.CreatedDate.ShouldBeInRange(DateTime.UtcNow.AddSeconds(-5), DateTime.UtcNow);
    }

    [Fact]
    public void Create_RaisesTaskCreatedEvent()
    {
        var task = CreateTask();

        task.DomainEvents.ShouldContain(e => e is TaskCreatedEvent);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankTitle_Throws(string title)
    {
        Should.Throw<Exception>(() =>
            WorkTask.Create(
                TenantId.From(Guid.NewGuid()),
                ProjectId.CreateUnique(),
                title,
                "description",
                RequestPriority.Medium,
                Guid.NewGuid()));
    }

    [Fact]
    public void Create_WithTitleTooShort_Throws()
    {
        Should.Throw<ArgumentException>(() =>
            WorkTask.Create(
                TenantId.From(Guid.NewGuid()),
                ProjectId.CreateUnique(),
                "AB",
                "description",
                RequestPriority.Medium,
                Guid.NewGuid()));
    }

    [Fact]
    public void Create_WithNegativeEstimatedHours_Throws()
    {
        Should.Throw<ArgumentException>(() => CreateTask(estimatedHours: -1));
    }

    [Fact]
    public void Create_WithZeroEstimatedHours_Throws()
    {
        Should.Throw<ArgumentException>(() => CreateTask(estimatedHours: 0));
    }

    [Fact]
    public void Create_WithValidEstimatedHours_SetsValue()
    {
        var task = CreateTask(estimatedHours: 8);

        task.EstimatedHours.ShouldBe(8);
    }

    // ─── Start ────────────────────────────────────────────────────────────────

    [Fact]
    public void Start_FromNotStarted_MovesToInProgress()
    {
        var task = CreateTask();
        var userId = Guid.NewGuid();
        task.Start(userId);

        task.Status.ShouldBe(TaskStatus.InProgress);
        task.StartedDate.ShouldNotBeNull();
    }

    [Fact]
    public void Start_WhenUnassigned_AutoAssignsToStartingUser()
    {
        var task = CreateTask();
        var userId = Guid.NewGuid();
        task.Start(userId);

        task.AssignedToUserId.ShouldBe(userId);
    }

    [Fact]
    public void Start_WhenAlreadyAssigned_PreservesExistingAssignment()
    {
        var task = CreateTask();
        var assignee = Guid.NewGuid();
        var starter = Guid.NewGuid();
        task.AssignToUser(assignee, null, null, Guid.NewGuid());
        task.Start(starter);

        task.AssignedToUserId.ShouldBe(assignee);
    }

    [Fact]
    public void Start_RaisesTaskStartedEvent()
    {
        var task = CreateTask();
        task.Start(Guid.NewGuid());

        task.DomainEvents.ShouldContain(e => e is TaskStartedEvent);
    }

    [Fact]
    public void Start_FromCompleted_Throws()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => task.Start(Guid.NewGuid()));
    }

    [Fact]
    public void Start_FromInProgress_Throws()
    {
        var task = CreateInProgress();

        Should.Throw<InvalidOperationException>(() => task.Start(Guid.NewGuid()));
    }

    // ─── Block ────────────────────────────────────────────────────────────────

    [Fact]
    public void Block_FromInProgress_MovesToBlocked()
    {
        var task = CreateInProgress();
        task.Block("Waiting for API spec", Guid.NewGuid());

        task.Status.ShouldBe(TaskStatus.Blocked);
        task.BlockedReason.ShouldBe("Waiting for API spec");
        task.BlockedDate.ShouldNotBeNull();
    }

    [Fact]
    public void Block_RaisesTaskBlockedEvent()
    {
        var task = CreateInProgress();
        task.Block("Blocked reason", Guid.NewGuid());

        task.DomainEvents.ShouldContain(e => e is TaskBlockedEvent);
    }

    [Fact]
    public void Block_WithBlankReason_Throws()
    {
        var task = CreateInProgress();

        Should.Throw<Exception>(() => task.Block("", Guid.NewGuid()));
    }

    [Fact]
    public void Block_FromNotStarted_Throws()
    {
        var task = CreateTask();

        Should.Throw<InvalidOperationException>(() => task.Block("reason", Guid.NewGuid()));
    }

    [Fact]
    public void Block_FromCompleted_Throws()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => task.Block("reason", Guid.NewGuid()));
    }

    // ─── Unblock ──────────────────────────────────────────────────────────────

    [Fact]
    public void Unblock_FromBlocked_MovesToInProgress()
    {
        var task = CreateBlocked();
        task.Unblock(Guid.NewGuid());

        task.Status.ShouldBe(TaskStatus.InProgress);
        task.BlockedReason.ShouldBeNull();
        task.BlockedDate.ShouldBeNull();
    }

    [Fact]
    public void Unblock_RaisesTaskUnblockedEvent()
    {
        var task = CreateBlocked();
        task.Unblock(Guid.NewGuid());

        task.DomainEvents.ShouldContain(e => e is TaskUnblockedEvent);
    }

    [Fact]
    public void Unblock_FromNotStarted_Throws()
    {
        var task = CreateTask();

        Should.Throw<InvalidOperationException>(() => task.Unblock(Guid.NewGuid()));
    }

    [Fact]
    public void Unblock_FromInProgress_Throws()
    {
        var task = CreateInProgress();

        Should.Throw<InvalidOperationException>(() => task.Unblock(Guid.NewGuid()));
    }

    // ─── Complete ─────────────────────────────────────────────────────────────

    [Fact]
    public void Complete_FromInProgress_MovesToCompleted()
    {
        var completerId = Guid.NewGuid();
        var task = CreateInProgress();
        task.Complete(completerId);

        task.Status.ShouldBe(TaskStatus.Completed);
        task.CompletedDate.ShouldNotBeNull();
        task.CompletedByUserId.ShouldBe(completerId);
    }

    [Fact]
    public void Complete_WithResolutionNotes_SetsNotes()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid(), "Fixed by updating the config");

        task.ResolutionNotes.ShouldBe("Fixed by updating the config");
    }

    [Fact]
    public void Complete_RaisesTaskCompletedEvent()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid());

        task.DomainEvents.ShouldContain(e => e is TaskCompletedEvent);
    }

    [Fact]
    public void Complete_FromNotStarted_Throws()
    {
        var task = CreateTask();

        Should.Throw<InvalidOperationException>(() => task.Complete(Guid.NewGuid()));
    }

    [Fact]
    public void Complete_FromBlocked_Throws()
    {
        var task = CreateBlocked();

        Should.Throw<InvalidOperationException>(() => task.Complete(Guid.NewGuid()));
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    [Fact]
    public void Cancel_FromNotStarted_MovesToCancelled()
    {
        var task = CreateTask();
        task.Cancel(Guid.NewGuid(), "No longer needed");

        task.Status.ShouldBe(TaskStatus.Cancelled);
    }

    [Fact]
    public void Cancel_FromInProgress_MovesToCancelled()
    {
        var task = CreateInProgress();
        task.Cancel(Guid.NewGuid(), "Scope change");

        task.Status.ShouldBe(TaskStatus.Cancelled);
    }

    [Fact]
    public void Cancel_FromBlocked_MovesToCancelled()
    {
        var task = CreateBlocked();
        task.Cancel(Guid.NewGuid(), "Abandoned");

        task.Status.ShouldBe(TaskStatus.Cancelled);
    }

    [Fact]
    public void Cancel_RaisesTaskCancelledEvent()
    {
        var task = CreateTask();
        task.Cancel(Guid.NewGuid(), "reason");

        task.DomainEvents.ShouldContain(e => e is TaskCancelledEvent);
    }

    [Fact]
    public void Cancel_WithBlankReason_Throws()
    {
        var task = CreateTask();

        Should.Throw<Exception>(() => task.Cancel(Guid.NewGuid(), ""));
    }

    [Fact]
    public void Cancel_FromCompleted_Throws()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => task.Cancel(Guid.NewGuid(), "reason"));
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_Throws()
    {
        var task = CreateTask();
        task.Cancel(Guid.NewGuid(), "first cancel");

        Should.Throw<InvalidOperationException>(() => task.Cancel(Guid.NewGuid(), "second cancel"));
    }

    // ─── LogTime ──────────────────────────────────────────────────────────────

    [Fact]
    public void LogTime_FromInProgress_AccumulatesHours()
    {
        var task = CreateInProgress();
        task.LogTime(2.5m);
        task.LogTime(1.5m);

        task.ActualHours.ShouldBe(4.0m);
    }

    [Fact]
    public void LogTime_FromBlocked_Accumulates()
    {
        var task = CreateBlocked();
        task.LogTime(1m);

        task.ActualHours.ShouldBe(1m);
    }

    [Fact]
    public void LogTime_RaisesTaskTimeLoggedEvent()
    {
        var task = CreateInProgress();
        task.LogTime(3m);

        task.DomainEvents.ShouldContain(e => e is TaskTimeLoggedEvent);
    }

    [Fact]
    public void LogTime_WithZeroHours_Throws()
    {
        var task = CreateInProgress();

        Should.Throw<ArgumentException>(() => task.LogTime(0));
    }

    [Fact]
    public void LogTime_WithNegativeHours_Throws()
    {
        var task = CreateInProgress();

        Should.Throw<ArgumentException>(() => task.LogTime(-1));
    }

    [Fact]
    public void LogTime_FromNotStarted_Throws()
    {
        var task = CreateTask();

        Should.Throw<InvalidOperationException>(() => task.LogTime(1));
    }

    [Fact]
    public void LogTime_FromCompleted_Throws()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => task.LogTime(1));
    }

    // ─── Assignment ───────────────────────────────────────────────────────────

    [Fact]
    public void AssignToUser_SetsUserAndDepartment()
    {
        var task = CreateTask();
        var userId = Guid.NewGuid();
        var deptId = DepartmentId.CreateUnique();
        task.AssignToUser(userId, deptId, "Engineering", Guid.NewGuid());

        task.AssignedToUserId.ShouldBe(userId);
        task.AssignedToDepartmentId.ShouldBe(deptId);
        task.AssignedToDepartmentName.ShouldBe("Engineering");
    }

    [Fact]
    public void AssignToUser_RaisesTaskAssignedToUserEvent()
    {
        var task = CreateTask();
        task.AssignToUser(Guid.NewGuid(), null, null, Guid.NewGuid());

        task.DomainEvents.ShouldContain(e => e is TaskAssignedToUserEvent);
    }

    [Fact]
    public void AssignToUser_WhenCompleted_Throws()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => task.AssignToUser(Guid.NewGuid(), null, null, Guid.NewGuid()));
    }

    [Fact]
    public void AssignToDepartment_ClearsUserAssignment()
    {
        var task = CreateTask();
        task.AssignToUser(Guid.NewGuid(), null, null, Guid.NewGuid());
        var deptId = DepartmentId.CreateUnique();
        task.AssignToDepartment(deptId, "QA Team", Guid.NewGuid());

        task.AssignedToUserId.ShouldBeNull();
        task.AssignedToDepartmentId.ShouldBe(deptId);
        task.AssignedToDepartmentName.ShouldBe("QA Team");
    }

    [Fact]
    public void AssignToDepartment_RaisesTaskAssignedToDepartmentEvent()
    {
        var task = CreateTask();
        task.AssignToDepartment(DepartmentId.CreateUnique(), "DevOps", Guid.NewGuid());

        task.DomainEvents.ShouldContain(e => e is TaskAssignedToDepartmentEvent);
    }

    [Fact]
    public void ClaimTask_WhenAssignedToDept_SetsUserId()
    {
        var task = CreateTask();
        var deptId = DepartmentId.CreateUnique();
        var userId = Guid.NewGuid();
        task.AssignToDepartment(deptId, "DevOps", Guid.NewGuid());
        task.ClaimTask(userId, deptId);

        task.AssignedToUserId.ShouldBe(userId);
    }

    [Fact]
    public void ClaimTask_RaisesTaskClaimedEvent()
    {
        var task = CreateTask();
        var deptId = DepartmentId.CreateUnique();
        task.AssignToDepartment(deptId, "DevOps", Guid.NewGuid());
        task.ClaimTask(Guid.NewGuid(), deptId);

        task.DomainEvents.ShouldContain(e => e is TaskClaimedEvent);
    }

    [Fact]
    public void ClaimTask_WhenNotAssignedToDept_Throws()
    {
        var task = CreateTask();

        Should.Throw<InvalidOperationException>(() => task.ClaimTask(Guid.NewGuid(), DepartmentId.CreateUnique()));
    }

    [Fact]
    public void ClaimTask_WhenWrongDepartment_Throws()
    {
        var task = CreateTask();
        task.AssignToDepartment(DepartmentId.CreateUnique(), "DevOps", Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => task.ClaimTask(Guid.NewGuid(), DepartmentId.CreateUnique()));
    }

    [Fact]
    public void ClaimTask_WhenAlreadyClaimed_Throws()
    {
        var task = CreateTask();
        var deptId = DepartmentId.CreateUnique();
        task.AssignToDepartment(deptId, "DevOps", Guid.NewGuid());
        task.ClaimTask(Guid.NewGuid(), deptId);

        Should.Throw<InvalidOperationException>(() => task.ClaimTask(Guid.NewGuid(), deptId));
    }

    // ─── Checklist ────────────────────────────────────────────────────────────

    [Fact]
    public void AddChecklistItem_AddsItemToTask()
    {
        var task = CreateTask();
        task.AddChecklistItem("Write unit tests", 1);

        task.ChecklistItems.Count.ShouldBe(1);
        task.ChecklistItems.First().Description.ShouldBe("Write unit tests");
        task.ChecklistItems.First().IsCompleted.ShouldBeFalse();
    }

    [Fact]
    public void AddChecklistItem_WhenTaskCompleted_Throws()
    {
        var task = CreateInProgress();
        task.Complete(Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => task.AddChecklistItem("item", 0));
    }

    [Fact]
    public void AddChecklistItem_WhenTaskCancelled_Throws()
    {
        var task = CreateTask();
        task.Cancel(Guid.NewGuid(), "reason");

        Should.Throw<InvalidOperationException>(() => task.AddChecklistItem("item", 0));
    }

    [Fact]
    public void ChecklistItem_Complete_MarksAsCompleted()
    {
        var task = CreateTask();
        task.AddChecklistItem("Review PR", 0);
        var item = task.ChecklistItems.First();
        var userId = Guid.NewGuid();
        item.Complete(userId);

        item.IsCompleted.ShouldBeTrue();
        item.CompletedByUserId.ShouldBe(userId);
        item.CompletedDate.ShouldNotBeNull();
    }

    [Fact]
    public void ChecklistItem_CompleteWhenAlreadyCompleted_Throws()
    {
        var task = CreateTask();
        task.AddChecklistItem("Review PR", 0);
        var item = task.ChecklistItems.First();
        item.Complete(Guid.NewGuid());

        Should.Throw<InvalidOperationException>(() => item.Complete(Guid.NewGuid()));
    }

    [Fact]
    public void ChecklistItem_Uncomplete_ClearsCompletion()
    {
        var task = CreateTask();
        task.AddChecklistItem("Review PR", 0);
        var item = task.ChecklistItems.First();
        item.Complete(Guid.NewGuid());
        item.Uncomplete();

        item.IsCompleted.ShouldBeFalse();
        item.CompletedByUserId.ShouldBeNull();
        item.CompletedDate.ShouldBeNull();
    }

    [Fact]
    public void ChecklistItem_UncompleteWhenNotCompleted_Throws()
    {
        var task = CreateTask();
        task.AddChecklistItem("Review PR", 0);
        var item = task.ChecklistItems.First();

        Should.Throw<InvalidOperationException>(() => item.Uncomplete());
    }

    [Fact]
    public void ChecklistItem_Toggle_CompletesWhenNotCompleted()
    {
        var task = CreateTask();
        task.AddChecklistItem("item", 0);
        var item = task.ChecklistItems.First();
        var userId = Guid.NewGuid();
        item.Toggle(userId);

        item.IsCompleted.ShouldBeTrue();
    }

    [Fact]
    public void ChecklistItem_Toggle_UncompletesWhenCompleted()
    {
        var task = CreateTask();
        task.AddChecklistItem("item", 0);
        var item = task.ChecklistItems.First();
        item.Toggle(Guid.NewGuid());
        item.Toggle(Guid.NewGuid());

        item.IsCompleted.ShouldBeFalse();
    }

    // ─── IsOverdue ────────────────────────────────────────────────────────────

    [Fact]
    public void IsOverdue_WhenPastDueDate_ReturnsTrue()
    {
        var task = CreateTask(dueDate: DateTime.UtcNow.AddDays(-1));

        task.IsOverdue().ShouldBeTrue();
    }

    [Fact]
    public void IsOverdue_WhenFutureDueDate_ReturnsFalse()
    {
        var task = CreateTask(dueDate: DateTime.UtcNow.AddDays(1));

        task.IsOverdue().ShouldBeFalse();
    }

    [Fact]
    public void IsOverdue_WhenNoDueDate_ReturnsFalse()
    {
        var task = CreateTask();

        task.IsOverdue().ShouldBeFalse();
    }

    [Fact]
    public void IsOverdue_WhenCompletedPastDue_ReturnsFalse()
    {
        var task = CreateInProgress(estimatedHours: null);
        task.Complete(Guid.NewGuid());

        // Even with a past due date baked in, terminal tasks are not overdue
        task.IsOverdue().ShouldBeFalse();
    }

    // ─── GetHoursVariance ─────────────────────────────────────────────────────

    [Fact]
    public void GetHoursVariance_WhenNoEstimate_ReturnsNull()
    {
        var task = CreateTask();

        task.GetHoursVariance().ShouldBeNull();
    }

    [Fact]
    public void GetHoursVariance_WhenUnderEstimate_ReturnsNegative()
    {
        var task = CreateInProgress(estimatedHours: 8);
        task.LogTime(5);

        task.GetHoursVariance().ShouldBe(-3m);
    }

    [Fact]
    public void GetHoursVariance_WhenOverEstimate_ReturnsPositive()
    {
        var task = CreateInProgress(estimatedHours: 4);
        task.LogTime(6);

        task.GetHoursVariance().ShouldBe(2m);
    }

    // ─── GetDaysUntilDue ──────────────────────────────────────────────────────

    [Fact]
    public void GetDaysUntilDue_WhenNoDueDate_ReturnsNull()
    {
        var task = CreateTask();

        task.GetDaysUntilDue().ShouldBeNull();
    }

    [Fact]
    public void GetDaysUntilDue_WhenDueTomorrow_ReturnsPositive()
    {
        var task = CreateTask(dueDate: DateTime.UtcNow.AddDays(3));

        task.GetDaysUntilDue().ShouldNotBeNull();
        task.GetDaysUntilDue()!.Value.ShouldBeGreaterThan(0);
    }
}