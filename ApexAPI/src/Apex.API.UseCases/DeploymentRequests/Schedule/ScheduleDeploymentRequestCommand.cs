using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Schedule;

public record ScheduleDeploymentRequestCommand(
    DeploymentRequestId Id,
    DateTime ScheduledStartDate,
    DateTime ScheduledEndDate,
    string? DeploymentWindow
) : IRequest<Result>;
