using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.StartExecution;

public record StartExecutionCommand(DeploymentRequestId Id) : IRequest<Result>;
