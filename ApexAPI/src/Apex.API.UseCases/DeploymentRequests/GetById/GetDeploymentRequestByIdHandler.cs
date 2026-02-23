using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.DeploymentRequests.DTOs;

namespace Apex.API.UseCases.DeploymentRequests.GetById;

/// <summary>
/// Handler for getting a DeploymentRequest by ID
/// </summary>
public class GetDeploymentRequestByIdHandler : IRequestHandler<GetDeploymentRequestByIdQuery, Result<DeploymentRequestDto>>
{
    private readonly IReadRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<GetDeploymentRequestByIdHandler> _logger;

    public GetDeploymentRequestByIdHandler(
        IReadRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ILogger<GetDeploymentRequestByIdHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    public async Task<Result<DeploymentRequestDto>> Handle(GetDeploymentRequestByIdQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _repository.GetByIdAsync(query.Id, cancellationToken);

            if (dr == null)
            {
                _logger.LogWarning("DeploymentRequest not found: Id={Id}", query.Id);
                return Result<DeploymentRequestDto>.NotFound("Deployment request not found.");
            }

            // Verify tenant ownership (multi-tenant security)
            if (dr.TenantId != _tenantContext.CurrentTenantId)
            {
                _logger.LogWarning(
                    "Unauthorized access attempt: DeploymentRequestId={Id}, TenantId={TenantId}",
                    query.Id,
                    _tenantContext.CurrentTenantId);
                return Result<DeploymentRequestDto>.Forbidden();
            }

            var dto = new DeploymentRequestDto(
                dr.Id.Value,
                dr.Title,
                dr.Description,
                dr.Status.Name,
                dr.Priority.Name,
                dr.RiskLevel.Name,
                dr.Environment.Name,
                dr.AffectedSystems,
                dr.RollbackPlan,
                dr.DeploymentNotes,
                dr.DeploymentWindow,
                dr.ScheduledStartDate,
                dr.ScheduledEndDate,
                dr.ActualStartDate,
                dr.ActualEndDate,
                dr.CreatedByUserId,
                null, // CreatedByUserName - enriched at web layer
                dr.ApprovedByUserId,
                null, // ApprovedByUserName - enriched at web layer
                dr.ApprovalNotes,
                dr.RejectionReason,
                dr.FailureReason,
                dr.RollbackReason,
                dr.ProjectId,
                dr.ChangeRequestId,
                dr.CreatedDate,
                dr.SubmittedDate,
                dr.ApprovedDate,
                dr.RejectedDate,
                dr.ScheduledDate,
                dr.StartedDate,
                dr.DeployedDate,
                dr.FailedDate,
                dr.RolledBackDate,
                dr.IsOverdue());

            return Result<DeploymentRequestDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving DeploymentRequest: Id={Id}", query.Id);
            return Result<DeploymentRequestDto>.Error("An error occurred while retrieving the deployment request.");
        }
    }
}
