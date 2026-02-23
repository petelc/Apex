using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Approve;

public record ApproveDeploymentRequestCommand(DeploymentRequestId Id, string? Notes) : IRequest<Result>;
