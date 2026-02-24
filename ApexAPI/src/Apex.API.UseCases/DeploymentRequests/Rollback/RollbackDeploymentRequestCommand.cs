using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Rollback;

public record RollbackDeploymentRequestCommand(DeploymentRequestId Id, string Reason) : IRequest<Result>;