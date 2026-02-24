using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Cancel;

public record CancelDeploymentRequestCommand(DeploymentRequestId Id) : IRequest<Result>;