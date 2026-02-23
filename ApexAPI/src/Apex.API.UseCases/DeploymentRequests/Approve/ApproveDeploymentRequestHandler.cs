using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UseCases.DeploymentRequests.Approve;

/// <summary>
/// Handler for approving a DeploymentRequest
/// </summary>
public class ApproveDeploymentRequestHandler : IRequestHandler<ApproveDeploymentRequestCommand, Result>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ApproveDeploymentRequestHandler> _logger;

    public ApproveDeploymentRequestHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<ApproveDeploymentRequestHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(ApproveDeploymentRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            if (!_currentUserService.IsInRole("Manager") && !_currentUserService.IsInRole("TenantAdmin"))
            {
                _logger.LogWarning(
                    "Unauthorized approve attempt: UserId={UserId}, DeploymentRequestId={Id}",
                    _currentUserService.UserId,
                    command.Id);
                return Result.Forbidden();
            }

            var dr = await _repository.GetByIdAsync(command.Id, cancellationToken);

            if (dr == null)
                return Result.NotFound("Deployment request not found.");

            if (dr.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            dr.Approve(_currentUserService.UserId, command.Notes);

            await _repository.UpdateAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest approved: Id={Id}, ApprovedBy={UserId}",
                command.Id,
                _currentUserService.UserId);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot approve DeploymentRequest: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving DeploymentRequest: Id={Id}", command.Id);
            return Result.Error("An error occurred while approving the deployment request.");
        }
    }
}
