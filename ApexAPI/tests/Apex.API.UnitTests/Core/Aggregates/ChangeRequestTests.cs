using Apex.API.Core.Aggregates.ChangeRequestAggregate;
using Apex.API.Core.Aggregates.ChangeRequestAggregate.Events;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UnitTests.Core.Aggregates;

public class ChangeRequestTests
{
    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static ChangeRequest CreateDraft(
        ChangeType? changeType = null,
        RiskLevel? riskLevel = null)
    {
        changeType ??= ChangeType.Normal;
        riskLevel ??= RiskLevel.Medium;

        return ChangeRequest.Create(
            tenantId: TenantId.From(Guid.NewGuid()),
            title: "Deploy authentication service update",
            description: "Update auth service to v2.1 with MFA support",
            createdByUserId: Guid.NewGuid(),
            changeType: changeType,
            priority: RequestPriority.Medium,
            riskLevel: riskLevel,
            impactAssessment: "Users will need to re-authenticate",
            rollbackPlan: "Revert to v2.0 deployment artifact",
            affectedSystems: "AuthService, APIGateway");
    }

    private static ChangeRequest CreateSubmitted()
    {
        var cr = CreateDraft();
        cr.Submit();
        return cr;
    }

    private static ChangeRequest CreateUnderReview()
    {
        var cr = CreateSubmitted();
        cr.StartReview(Guid.NewGuid());
        return cr;
    }

    private static ChangeRequest CreateApproved()
    {
        var cr = CreateUnderReview();
        cr.Approve(Guid.NewGuid());
        return cr;
    }

    private static ChangeRequest CreateScheduled()
    {
        var cr = CreateApproved();
        var start = DateTime.UtcNow.AddDays(1);
        cr.Schedule(start, start.AddHours(2), "Saturday 2AM-4AM");
        return cr;
    }

    private static ChangeRequest CreateInProgress()
    {
        var cr = CreateScheduled();
        cr.StartExecution();
        return cr;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ReturnsChangeRequestInDraftStatus()
    {
        var cr = CreateDraft();

        cr.Status.ShouldBe(ChangeRequestStatus.Draft);
        cr.Title.ShouldBe("Deploy authentication service update");
        cr.CreatedDate.ShouldBeInRange(DateTime.UtcNow.AddSeconds(-5), DateTime.UtcNow);
    }

    [Fact]
    public void Create_RaisesChangeRequestCreatedEvent()
    {
        var cr = CreateDraft();

        cr.DomainEvents.ShouldContain(e => e is ChangeRequestCreatedEvent);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankTitle_Throws(string title)
    {
        Should.Throw<ArgumentException>(() =>
            ChangeRequest.Create(
                TenantId.From(Guid.NewGuid()), title, "description",
                Guid.NewGuid(), ChangeType.Normal, RequestPriority.Medium,
                RiskLevel.Medium, "impact", "rollback", "systems"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankImpactAssessment_Throws(string impact)
    {
        Should.Throw<ArgumentException>(() =>
            ChangeRequest.Create(
                TenantId.From(Guid.NewGuid()), "title", "description",
                Guid.NewGuid(), ChangeType.Normal, RequestPriority.Medium,
                RiskLevel.Medium, impact, "rollback", "systems"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankRollbackPlan_Throws(string rollback)
    {
        Should.Throw<ArgumentException>(() =>
            ChangeRequest.Create(
                TenantId.From(Guid.NewGuid()), "title", "description",
                Guid.NewGuid(), ChangeType.Normal, RequestPriority.Medium,
                RiskLevel.Medium, "impact", rollback, "systems"));
    }

    // ─── CAB Approval Logic ───────────────────────────────────────────────────

    [Fact]
    public void Create_StandardChange_DoesNotRequireCABApproval()
    {
        var cr = CreateDraft(changeType: ChangeType.Standard);
        cr.RequiresCABApproval.ShouldBeFalse();
    }

    [Fact]
    public void Create_EmergencyChangeWithLowRisk_DoesNotRequireCABApproval()
    {
        var cr = CreateDraft(changeType: ChangeType.Emergency, riskLevel: RiskLevel.Low);
        cr.RequiresCABApproval.ShouldBeFalse();
    }

    [Fact]
    public void Create_NormalChange_RequiresCABApproval()
    {
        var cr = CreateDraft(changeType: ChangeType.Normal);
        cr.RequiresCABApproval.ShouldBeTrue();
    }

    [Fact]
    public void Create_EmergencyChangeWithHighRisk_RequiresCABApproval()
    {
        var cr = CreateDraft(changeType: ChangeType.Emergency, riskLevel: RiskLevel.High);
        cr.RequiresCABApproval.ShouldBeTrue();
    }

    // ─── Submit ───────────────────────────────────────────────────────────────

    [Fact]
    public void Submit_FromDraft_MovesToSubmittedStatus()
    {
        var cr = CreateDraft();
        cr.Submit();

        cr.Status.ShouldBe(ChangeRequestStatus.Submitted);
        cr.SubmittedDate.ShouldNotBeNull();
    }

    [Fact]
    public void Submit_RaisesChangeRequestSubmittedEvent()
    {
        var cr = CreateDraft();
        cr.Submit();

        cr.DomainEvents.ShouldContain(e => e is ChangeRequestSubmittedEvent);
    }

    [Fact]
    public void Submit_WhenAlreadySubmitted_Throws()
    {
        var cr = CreateSubmitted();

        Should.Throw<InvalidOperationException>(() => cr.Submit());
    }

    [Fact]
    public void Submit_WhenApproved_Throws()
    {
        var cr = CreateApproved();

        Should.Throw<InvalidOperationException>(() => cr.Submit());
    }

    // ─── StartReview ──────────────────────────────────────────────────────────

    [Fact]
    public void StartReview_FromSubmitted_MovesToUnderReview()
    {
        var reviewerId = Guid.NewGuid();
        var cr = CreateSubmitted();
        cr.StartReview(reviewerId);

        cr.Status.ShouldBe(ChangeRequestStatus.UnderReview);
        cr.ReviewedByUserId.ShouldBe(reviewerId);
        cr.ReviewStartedDate.ShouldNotBeNull();
    }

    [Fact]
    public void StartReview_FromDraft_Throws()
    {
        var cr = CreateDraft();

        Should.Throw<InvalidOperationException>(() => cr.StartReview(Guid.NewGuid()));
    }

    // ─── Approve ──────────────────────────────────────────────────────────────

    [Fact]
    public void Approve_FromUnderReview_MovesToApproved()
    {
        var approverId = Guid.NewGuid();
        var cr = CreateUnderReview();
        cr.Approve(approverId, "Looks good");

        cr.Status.ShouldBe(ChangeRequestStatus.Approved);
        cr.ApprovedByUserId.ShouldBe(approverId);
        cr.ApprovalNotes.ShouldBe("Looks good");
        cr.ApprovedDate.ShouldNotBeNull();
    }

    [Fact]
    public void Approve_FromSubmitted_MovesToApproved()
    {
        var cr = CreateSubmitted();
        cr.Approve(Guid.NewGuid());

        cr.Status.ShouldBe(ChangeRequestStatus.Approved);
    }

    [Fact]
    public void Approve_RaisesChangeRequestApprovedEvent()
    {
        var cr = CreateUnderReview();
        cr.Approve(Guid.NewGuid());

        cr.DomainEvents.ShouldContain(e => e is ChangeRequestApprovedEvent);
    }

    [Fact]
    public void Approve_FromDraft_Throws()
    {
        var cr = CreateDraft();

        Should.Throw<InvalidOperationException>(() => cr.Approve(Guid.NewGuid()));
    }

    // ─── Deny ─────────────────────────────────────────────────────────────────

    [Fact]
    public void Deny_FromUnderReview_MovesToDenied()
    {
        var cr = CreateUnderReview();
        cr.Deny(Guid.NewGuid(), "Insufficient rollback plan");

        cr.Status.ShouldBe(ChangeRequestStatus.Denied);
        cr.DenialReason.ShouldBe("Insufficient rollback plan");
        cr.DeniedDate.ShouldNotBeNull();
    }

    [Fact]
    public void Deny_WithBlankReason_Throws()
    {
        var cr = CreateUnderReview();

        Should.Throw<ArgumentException>(() => cr.Deny(Guid.NewGuid(), ""));
    }

    [Fact]
    public void Deny_FromDraft_Throws()
    {
        var cr = CreateDraft();

        Should.Throw<InvalidOperationException>(() => cr.Deny(Guid.NewGuid(), "reason"));
    }

    // ─── Schedule ─────────────────────────────────────────────────────────────

    [Fact]
    public void Schedule_FromApproved_MovesToScheduled()
    {
        var start = DateTime.UtcNow.AddDays(1);
        var end = start.AddHours(2);
        var cr = CreateApproved();
        cr.Schedule(start, end, "Saturday 2AM-4AM");

        cr.Status.ShouldBe(ChangeRequestStatus.Scheduled);
        cr.ScheduledStartDate.ShouldBe(start);
        cr.ScheduledEndDate.ShouldBe(end);
        cr.ChangeWindow.ShouldBe("Saturday 2AM-4AM");
    }

    [Fact]
    public void Schedule_WhenStartAfterEnd_Throws()
    {
        var cr = CreateApproved();
        var start = DateTime.UtcNow.AddDays(2);
        var end = DateTime.UtcNow.AddDays(1);

        Should.Throw<ArgumentException>(() => cr.Schedule(start, end, "window"));
    }

    [Fact]
    public void Schedule_FromDraft_Throws()
    {
        var cr = CreateDraft();
        var start = DateTime.UtcNow.AddDays(1);

        Should.Throw<InvalidOperationException>(() => cr.Schedule(start, start.AddHours(1), "window"));
    }

    // ─── StartExecution ───────────────────────────────────────────────────────

    [Fact]
    public void StartExecution_FromScheduled_MovesToInProgress()
    {
        var cr = CreateScheduled();
        cr.StartExecution();

        cr.Status.ShouldBe(ChangeRequestStatus.InProgress);
        cr.ActualStartDate.ShouldNotBeNull();
    }

    [Fact]
    public void StartExecution_FromApproved_Throws()
    {
        var cr = CreateApproved();

        Should.Throw<InvalidOperationException>(() => cr.StartExecution());
    }

    // ─── Complete ─────────────────────────────────────────────────────────────

    [Fact]
    public void Complete_FromInProgress_MovesToCompleted()
    {
        var cr = CreateInProgress();
        cr.Complete("Deployment successful, all health checks passed");

        cr.Status.ShouldBe(ChangeRequestStatus.Completed);
        cr.CompletedDate.ShouldNotBeNull();
        cr.ActualEndDate.ShouldNotBeNull();
        cr.ImplementationNotes.ShouldBe("Deployment successful, all health checks passed");
    }

    [Fact]
    public void Complete_RaisesChangeRequestCompletedEvent()
    {
        var cr = CreateInProgress();
        cr.Complete();

        cr.DomainEvents.ShouldContain(e => e is ChangeRequestCompletedEvent);
    }

    [Fact]
    public void Complete_FromScheduled_Throws()
    {
        var cr = CreateScheduled();

        Should.Throw<InvalidOperationException>(() => cr.Complete());
    }

    // ─── MarkAsFailed ─────────────────────────────────────────────────────────

    [Fact]
    public void MarkAsFailed_FromInProgress_MovesToFailed()
    {
        var cr = CreateInProgress();
        cr.MarkAsFailed("Database connection timeout during migration");

        cr.Status.ShouldBe(ChangeRequestStatus.Failed);
        cr.FailedDate.ShouldNotBeNull();
    }

    [Fact]
    public void MarkAsFailed_WithBlankReason_Throws()
    {
        var cr = CreateInProgress();

        Should.Throw<ArgumentException>(() => cr.MarkAsFailed(""));
    }

    [Fact]
    public void MarkAsFailed_FromCompleted_Throws()
    {
        var cr = CreateInProgress();
        cr.Complete();

        Should.Throw<InvalidOperationException>(() => cr.MarkAsFailed("reason"));
    }

    // ─── Rollback ─────────────────────────────────────────────────────────────

    [Fact]
    public void Rollback_FromFailed_MovesToRolledBack()
    {
        var cr = CreateInProgress();
        cr.MarkAsFailed("Migration error");
        cr.Rollback("Restored previous artifact");

        cr.Status.ShouldBe(ChangeRequestStatus.RolledBack);
        cr.RollbackReason.ShouldBe("Restored previous artifact");
        cr.RolledBackDate.ShouldNotBeNull();
    }

    [Fact]
    public void Rollback_FromInProgress_MovesToRolledBack()
    {
        var cr = CreateInProgress();
        cr.Rollback("Emergency rollback triggered");

        cr.Status.ShouldBe(ChangeRequestStatus.RolledBack);
    }

    [Fact]
    public void Rollback_WithBlankReason_Throws()
    {
        var cr = CreateInProgress();
        cr.MarkAsFailed("failed");

        Should.Throw<ArgumentException>(() => cr.Rollback(""));
    }

    [Fact]
    public void Rollback_FromCompleted_Throws()
    {
        var cr = CreateInProgress();
        cr.Complete();

        Should.Throw<InvalidOperationException>(() => cr.Rollback("reason"));
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    [Fact]
    public void Cancel_FromDraft_MovesToCancelled()
    {
        var cr = CreateDraft();
        cr.Cancel();

        cr.Status.ShouldBe(ChangeRequestStatus.Cancelled);
    }

    [Fact]
    public void Cancel_FromSubmitted_MovesToCancelled()
    {
        var cr = CreateSubmitted();
        cr.Cancel();

        cr.Status.ShouldBe(ChangeRequestStatus.Cancelled);
    }

    [Fact]
    public void Cancel_WhenInProgress_Throws()
    {
        var cr = CreateInProgress();

        Should.Throw<InvalidOperationException>(() => cr.Cancel());
    }

    [Fact]
    public void Cancel_WhenCompleted_Throws()
    {
        var cr = CreateInProgress();
        cr.Complete();

        Should.Throw<InvalidOperationException>(() => cr.Cancel());
    }

    [Fact]
    public void Cancel_WhenRolledBack_Throws()
    {
        var cr = CreateInProgress();
        cr.Rollback("rolled back");

        Should.Throw<InvalidOperationException>(() => cr.Cancel());
    }

    // ─── UpdateDetails ────────────────────────────────────────────────────────

    [Fact]
    public void UpdateDetails_WhileInDraft_UpdatesTitle()
    {
        var cr = CreateDraft();
        cr.UpdateDetails("New title", "New description", null);

        cr.Title.ShouldBe("New title");
        cr.Description.ShouldBe("New description");
    }

    [Fact]
    public void UpdateDetails_WhenSubmitted_Throws()
    {
        var cr = CreateSubmitted();

        Should.Throw<InvalidOperationException>(() =>
            cr.UpdateDetails("title", "description", null));
    }

    // ─── IsOverdue ────────────────────────────────────────────────────────────

    [Fact]
    public void IsOverdue_WhenPastScheduledEndDate_ReturnsTrue()
    {
        var cr = CreateApproved();
        var pastStart = DateTime.UtcNow.AddDays(-2);
        var pastEnd = DateTime.UtcNow.AddDays(-1);
        cr.Schedule(pastStart, pastEnd, "window");
        cr.StartExecution();

        cr.IsOverdue().ShouldBeTrue();
    }

    [Fact]
    public void IsOverdue_WhenCompleted_ReturnsFalse()
    {
        var cr = CreateInProgress();
        cr.Complete();

        cr.IsOverdue().ShouldBeFalse();
    }

    [Fact]
    public void IsOverdue_WhenNoScheduledEndDate_ReturnsFalse()
    {
        var cr = CreateDraft();

        cr.IsOverdue().ShouldBeFalse();
    }
}