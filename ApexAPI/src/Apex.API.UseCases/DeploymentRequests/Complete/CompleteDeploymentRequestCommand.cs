using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Complete;

public record CompleteDeploymentRequestCommand(DeploymentRequestId Id, string? Notes) : IRequest<Result>;
