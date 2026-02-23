using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.DeploymentRequests.DTOs;

namespace Apex.API.UseCases.DeploymentRequests.List;

/// <summary>
/// Handler for listing deployment requests with optional filtering
/// </summary>
public class ListDeploymentRequestsHandler : IRequestHandler<ListDeploymentRequestsQuery, Result<List<DeploymentRequestListItemDto>>>
{
    private readonly IReadRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<ListDeploymentRequestsHandler> _logger;

    public ListDeploymentRequestsHandler(
        IReadRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ILogger<ListDeploymentRequestsHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    public async Task<Result<List<DeploymentRequestListItemDto>>> Handle(ListDeploymentRequestsQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var all = await _repository.ListAsync(cancellationToken);
            var filtered = all.Where(dr => dr.TenantId == _tenantContext.CurrentTenantId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Status) && DeploymentRequestStatus.TryFromName(query.Status, out var status))
                filtered = filtered.Where(dr => dr.Status == status);

            if (!string.IsNullOrWhiteSpace(query.Environment) && DeploymentEnvironment.TryFromName(query.Environment, out var env))
                filtered = filtered.Where(dr => dr.Environment == env);

            if (!string.IsNullOrWhiteSpace(query.Priority) && RequestPriority.TryFromName(query.Priority, out var priority))
                filtered = filtered.Where(dr => dr.Priority == priority);

            var result = filtered
                .OrderByDescending(dr => dr.CreatedDate)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(dr => new DeploymentRequestListItemDto(
                    dr.Id.Value,
                    dr.Title,
                    dr.Status.Name,
                    dr.Priority.Name,
                    dr.RiskLevel.Name,
                    dr.Environment.Name,
                    dr.CreatedByUserId,
                    null, // CreatedByUserName - enriched at web layer
                    dr.ProjectId,
                    dr.ChangeRequestId,
                    dr.CreatedDate,
                    dr.SubmittedDate,
                    dr.ScheduledStartDate,
                    dr.DeployedDate,
                    dr.IsOverdue()))
                .ToList();

            return Result<List<DeploymentRequestListItemDto>>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing deployment requests");
            return Result<List<DeploymentRequestListItemDto>>.Error("An error occurred while listing deployment requests.");
        }
    }
}
