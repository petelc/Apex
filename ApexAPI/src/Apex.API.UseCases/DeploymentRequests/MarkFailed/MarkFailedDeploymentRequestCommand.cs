using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.MarkFailed;

public record MarkFailedDeploymentRequestCommand(DeploymentRequestId Id, string? Reason = null) : IRequest<Result>;