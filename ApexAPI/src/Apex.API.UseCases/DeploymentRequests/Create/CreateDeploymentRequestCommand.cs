using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Create;

public record CreateDeploymentRequestCommand(
    string Title,
    string Description,
    string Priority,
    string RiskLevel,
    string Environment,
    string AffectedSystems,
    string RollbackPlan,
    Guid? ProjectId = null,
    Guid? ChangeRequestId = null,
    DateTime? ScheduledStartDate = null,
    DateTime? ScheduledEndDate = null,
    string? DeploymentWindow = null
) : IRequest<Result<DeploymentRequestId>>;
