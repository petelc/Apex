using MediatR;
using Ardalis.Result;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.DeploymentRequests.DTOs;

namespace Apex.API.UseCases.DeploymentRequests.GetById;

public record GetDeploymentRequestByIdQuery(DeploymentRequestId Id) : IRequest<Result<DeploymentRequestDto>>;
