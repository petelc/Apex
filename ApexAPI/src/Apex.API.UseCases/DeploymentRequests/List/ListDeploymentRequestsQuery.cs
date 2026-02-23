using MediatR;
using Ardalis.Result;
using Apex.API.UseCases.DeploymentRequests.DTOs;

namespace Apex.API.UseCases.DeploymentRequests.List;

public record ListDeploymentRequestsQuery(
    string? Status = null,
    string? Environment = null,
    string? Priority = null,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<Result<List<DeploymentRequestListItemDto>>>;
