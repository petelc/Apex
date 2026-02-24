using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Delete;

public record DeleteDeploymentRequestCommand(DeploymentRequestId Id) : IRequest<Result>;