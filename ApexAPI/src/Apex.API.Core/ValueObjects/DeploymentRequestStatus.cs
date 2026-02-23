using Ardalis.SmartEnum;

namespace Apex.API.Core.ValueObjects;

/// <summary>
/// Deployment request lifecycle status
/// </summary>
public sealed class DeploymentRequestStatus : SmartEnum<DeploymentRequestStatus>
{
    public static readonly DeploymentRequestStatus Draft = new(nameof(Draft), 0);
    public static readonly DeploymentRequestStatus PendingApproval = new(nameof(PendingApproval), 1);
    public static readonly DeploymentRequestStatus Approved = new(nameof(Approved), 2);
    public static readonly DeploymentRequestStatus Rejected = new(nameof(Rejected), 3);
    public static readonly DeploymentRequestStatus Scheduled = new(nameof(Scheduled), 4);
    public static readonly DeploymentRequestStatus InProgress = new(nameof(InProgress), 5);
    public static readonly DeploymentRequestStatus Deployed = new(nameof(Deployed), 6);
    public static readonly DeploymentRequestStatus Failed = new(nameof(Failed), 7);
    public static readonly DeploymentRequestStatus RolledBack = new(nameof(RolledBack), 8);
    public static readonly DeploymentRequestStatus Cancelled = new(nameof(Cancelled), 9);

    public bool CanSubmit => this == Draft;
    public bool CanApprove => this == PendingApproval;
    public bool CanReject => this == PendingApproval;
    public bool CanSchedule => this == Approved;
    public bool CanStart => this == Scheduled;
    public bool IsTerminal => this == Deployed || this == Rejected || this == RolledBack || this == Cancelled;
    public bool IsActive => this == PendingApproval || this == Approved || this == Scheduled || this == InProgress;

    private DeploymentRequestStatus(string name, int value) : base(name, value) { }
}
