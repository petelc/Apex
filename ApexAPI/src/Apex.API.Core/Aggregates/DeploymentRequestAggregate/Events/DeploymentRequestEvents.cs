using Traxs.SharedKernel;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Core.Aggregates.DeploymentRequestAggregate.Events;

/// <summary>
/// Fired when a deployment request is created
/// </summary>
public class DeploymentRequestCreatedEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public DeploymentRequestCreatedEvent(DeploymentRequestId id, string title)
    {
        DeploymentRequestId = id;
        Title = title;
    }
}

/// <summary>
/// Fired when a deployment request is submitted for approval
/// </summary>
public class DeploymentRequestSubmittedEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public DeploymentRequestSubmittedEvent(DeploymentRequestId id, string title)
    {
        DeploymentRequestId = id;
        Title = title;
    }
}

/// <summary>
/// Fired when a deployment request is approved
/// </summary>
public class DeploymentRequestApprovedEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public Guid ApprovedByUserId { get; }
    public DeploymentRequestApprovedEvent(DeploymentRequestId id, string title, Guid approvedBy)
    {
        DeploymentRequestId = id;
        Title = title;
        ApprovedByUserId = approvedBy;
    }
}

/// <summary>
/// Fired when a deployment request is rejected
/// </summary>
public class DeploymentRequestRejectedEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public string Reason { get; }
    public DeploymentRequestRejectedEvent(DeploymentRequestId id, string title, string reason)
    {
        DeploymentRequestId = id;
        Title = title;
        Reason = reason;
    }
}

/// <summary>
/// Fired when a deployment request is scheduled
/// </summary>
public class DeploymentRequestScheduledEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public DateTime ScheduledStartDate { get; }
    public DateTime ScheduledEndDate { get; }
    public DeploymentRequestScheduledEvent(DeploymentRequestId id, string title, DateTime start, DateTime end)
    {
        DeploymentRequestId = id;
        Title = title;
        ScheduledStartDate = start;
        ScheduledEndDate = end;
    }
}

/// <summary>
/// Fired when deployment execution starts
/// </summary>
public class DeploymentRequestStartedEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public DeploymentRequestStartedEvent(DeploymentRequestId id, string title)
    {
        DeploymentRequestId = id;
        Title = title;
    }
}

/// <summary>
/// Fired when a deployment completes successfully
/// </summary>
public class DeploymentRequestDeployedEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public DeploymentRequestDeployedEvent(DeploymentRequestId id, string title)
    {
        DeploymentRequestId = id;
        Title = title;
    }
}

/// <summary>
/// Fired when a deployment fails
/// </summary>
public class DeploymentRequestFailedEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public DeploymentRequestFailedEvent(DeploymentRequestId id, string title)
    {
        DeploymentRequestId = id;
        Title = title;
    }
}

/// <summary>
/// Fired when a deployment is rolled back
/// </summary>
public class DeploymentRequestRolledBackEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public string Reason { get; }
    public DeploymentRequestRolledBackEvent(DeploymentRequestId id, string title, string reason)
    {
        DeploymentRequestId = id;
        Title = title;
        Reason = reason;
    }
}

/// <summary>
/// Fired when a deployment request is cancelled
/// </summary>
public class DeploymentRequestCancelledEvent : DomainEventBase
{
    public DeploymentRequestId DeploymentRequestId { get; }
    public string Title { get; }
    public DeploymentRequestCancelledEvent(DeploymentRequestId id, string title)
    {
        DeploymentRequestId = id;
        Title = title;
    }
}
