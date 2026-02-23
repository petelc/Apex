using Traxs.SharedKernel;
using Apex.API.Core.ValueObjects;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate.Events;

namespace Apex.API.Core.Aggregates.DeploymentRequestAggregate;

/// <summary>
/// DeploymentRequest aggregate root - manages deployment requests through approval and execution lifecycle
/// </summary>
public class DeploymentRequest : EntityBase<DeploymentRequestId>, IAggregateRoot
{
    // Identity
    public TenantId TenantId { get; private set; }

    // Basic Information
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public DeploymentRequestStatus Status { get; private set; } = DeploymentRequestStatus.Draft;
    public RequestPriority Priority { get; private set; } = RequestPriority.Medium;
    public RiskLevel RiskLevel { get; private set; } = RiskLevel.Medium;
    public DeploymentEnvironment Environment { get; private set; } = DeploymentEnvironment.Development;

    // Assessment
    public string AffectedSystems { get; private set; } = string.Empty;
    public string RollbackPlan { get; private set; } = string.Empty;

    // Notes
    public string? DeploymentNotes { get; private set; }
    public string? ApprovalNotes { get; private set; }
    public string? RejectionReason { get; private set; }
    public string? FailureReason { get; private set; }
    public string? RollbackReason { get; private set; }

    // Scheduling
    public string? DeploymentWindow { get; private set; }
    public DateTime? ScheduledStartDate { get; private set; }
    public DateTime? ScheduledEndDate { get; private set; }
    public DateTime? ActualStartDate { get; private set; }
    public DateTime? ActualEndDate { get; private set; }

    // User tracking
    public Guid CreatedByUserId { get; private set; }
    public Guid? ApprovedByUserId { get; private set; }

    // Cross-references
    public Guid? ProjectId { get; private set; }
    public Guid? ChangeRequestId { get; private set; }

    // Timestamps
    public DateTime CreatedDate { get; private set; }
    public DateTime? SubmittedDate { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public DateTime? RejectedDate { get; private set; }
    public DateTime? ScheduledDate { get; private set; }
    public DateTime? StartedDate { get; private set; }
    public DateTime? DeployedDate { get; private set; }
    public DateTime? FailedDate { get; private set; }
    public DateTime? RolledBackDate { get; private set; }

    // EF Core constructor
    private DeploymentRequest() { }

    // Factory method
    public static DeploymentRequest Create(
        TenantId tenantId,
        string title,
        string description,
        Guid createdByUserId,
        RequestPriority priority,
        RiskLevel riskLevel,
        DeploymentEnvironment environment,
        string affectedSystems,
        string rollbackPlan,
        Guid? projectId = null,
        Guid? changeRequestId = null,
        DateTime? scheduledStartDate = null,
        DateTime? scheduledEndDate = null,
        string? deploymentWindow = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required", nameof(title));
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required", nameof(description));
        if (string.IsNullOrWhiteSpace(affectedSystems))
            throw new ArgumentException("Affected systems must be specified", nameof(affectedSystems));
        if (string.IsNullOrWhiteSpace(rollbackPlan))
            throw new ArgumentException("Rollback plan is required", nameof(rollbackPlan));

        var dr = new DeploymentRequest
        {
            Id = DeploymentRequestId.From(Guid.NewGuid()),
            TenantId = tenantId,
            Title = title,
            Description = description,
            CreatedByUserId = createdByUserId,
            Priority = priority,
            RiskLevel = riskLevel,
            Environment = environment,
            AffectedSystems = affectedSystems,
            RollbackPlan = rollbackPlan,
            ProjectId = projectId,
            ChangeRequestId = changeRequestId,
            ScheduledStartDate = scheduledStartDate,
            ScheduledEndDate = scheduledEndDate,
            DeploymentWindow = deploymentWindow,
            Status = DeploymentRequestStatus.Draft,
            CreatedDate = DateTime.UtcNow
        };

        dr.RegisterDomainEvent(new DeploymentRequestCreatedEvent(dr.Id, dr.Title));
        return dr;
    }

    // Workflow methods
    public void Submit()
    {
        if (Status != DeploymentRequestStatus.Draft)
            throw new InvalidOperationException("Can only submit deployment requests in Draft status");

        Status = DeploymentRequestStatus.PendingApproval;
        SubmittedDate = DateTime.UtcNow;
        RegisterDomainEvent(new DeploymentRequestSubmittedEvent(Id, Title));
    }

    public void Approve(Guid approvedByUserId, string? notes = null)
    {
        if (Status != DeploymentRequestStatus.PendingApproval)
            throw new InvalidOperationException("Can only approve deployment requests pending approval");

        Status = DeploymentRequestStatus.Approved;
        ApprovedByUserId = approvedByUserId;
        ApprovalNotes = notes;
        ApprovedDate = DateTime.UtcNow;
        RegisterDomainEvent(new DeploymentRequestApprovedEvent(Id, Title, approvedByUserId));
    }

    public void Reject(Guid rejectedByUserId, string reason)
    {
        if (Status != DeploymentRequestStatus.PendingApproval)
            throw new InvalidOperationException("Can only reject deployment requests pending approval");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required", nameof(reason));

        Status = DeploymentRequestStatus.Rejected;
        ApprovedByUserId = rejectedByUserId;
        RejectionReason = reason;
        RejectedDate = DateTime.UtcNow;
        RegisterDomainEvent(new DeploymentRequestRejectedEvent(Id, Title, reason));
    }

    public void Schedule(DateTime scheduledStartDate, DateTime scheduledEndDate, string? deploymentWindow = null)
    {
        if (Status != DeploymentRequestStatus.Approved)
            throw new InvalidOperationException("Can only schedule approved deployment requests");
        if (scheduledStartDate >= scheduledEndDate)
            throw new ArgumentException("Start date must be before end date");

        ScheduledStartDate = scheduledStartDate;
        ScheduledEndDate = scheduledEndDate;
        DeploymentWindow = deploymentWindow;
        Status = DeploymentRequestStatus.Scheduled;
        ScheduledDate = DateTime.UtcNow;
        RegisterDomainEvent(new DeploymentRequestScheduledEvent(Id, Title, scheduledStartDate, scheduledEndDate));
    }

    public void StartExecution()
    {
        if (Status != DeploymentRequestStatus.Scheduled)
            throw new InvalidOperationException("Can only start execution on scheduled deployment requests");

        Status = DeploymentRequestStatus.InProgress;
        ActualStartDate = DateTime.UtcNow;
        StartedDate = DateTime.UtcNow;
        RegisterDomainEvent(new DeploymentRequestStartedEvent(Id, Title));
    }

    public void Complete(string? deploymentNotes = null)
    {
        if (Status != DeploymentRequestStatus.InProgress)
            throw new InvalidOperationException("Can only complete deployment requests that are in progress");

        Status = DeploymentRequestStatus.Deployed;
        ActualEndDate = DateTime.UtcNow;
        DeployedDate = DateTime.UtcNow;
        DeploymentNotes = deploymentNotes;
        RegisterDomainEvent(new DeploymentRequestDeployedEvent(Id, Title));
    }

    public void MarkFailed(string? reason = null)
    {
        if (Status != DeploymentRequestStatus.InProgress)
            throw new InvalidOperationException("Can only mark in-progress deployment requests as failed");

        Status = DeploymentRequestStatus.Failed;
        ActualEndDate = DateTime.UtcNow;
        FailureReason = reason;
        FailedDate = DateTime.UtcNow;
        RegisterDomainEvent(new DeploymentRequestFailedEvent(Id, Title));
    }

    public void Rollback(string reason)
    {
        if (Status != DeploymentRequestStatus.Failed)
            throw new InvalidOperationException("Can only rollback failed deployment requests");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rollback reason is required", nameof(reason));

        Status = DeploymentRequestStatus.RolledBack;
        RollbackReason = reason;
        RolledBackDate = DateTime.UtcNow;
        RegisterDomainEvent(new DeploymentRequestRolledBackEvent(Id, Title, reason));
    }

    public void Cancel()
    {
        if (Status.IsTerminal)
            throw new InvalidOperationException("Cannot cancel a deployment request that is already in a terminal state");
        if (Status == DeploymentRequestStatus.InProgress)
            throw new InvalidOperationException("Cannot cancel an in-progress deployment");

        Status = DeploymentRequestStatus.Cancelled;
        RegisterDomainEvent(new DeploymentRequestCancelledEvent(Id, Title));
    }

    // Helper methods
    public bool IsOverdue()
    {
        if (!ScheduledEndDate.HasValue || Status == DeploymentRequestStatus.Deployed)
            return false;
        return DateTime.UtcNow > ScheduledEndDate.Value;
    }
}
