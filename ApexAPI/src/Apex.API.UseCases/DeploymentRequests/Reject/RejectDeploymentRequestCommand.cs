using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Reject;

public record RejectDeploymentRequestCommand(DeploymentRequestId Id, string Reason) : IRequest<Result>;
