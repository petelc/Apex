using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UseCases.DeploymentRequests.Reject;

/// <summary>
/// Handler for rejecting a DeploymentRequest
/// </summary>
public class RejectDeploymentRequestHandler : IRequestHandler<RejectDeploymentRequestCommand, Result>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RejectDeploymentRequestHandler> _logger;

    public RejectDeploymentRequestHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<RejectDeploymentRequestHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(RejectDeploymentRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            if (!_currentUserService.IsInRole("Manager") && !_currentUserService.IsInRole("TenantAdmin"))
            {
                _logger.LogWarning(
                    "Unauthorized reject attempt: UserId={UserId}, DeploymentRequestId={Id}",
                    _currentUserService.UserId,
                    command.Id);
                return Result.Forbidden();
            }

            var dr = await _repository.GetByIdAsync(command.Id, cancellationToken);

            if (dr == null)
                return Result.NotFound("Deployment request not found.");

            if (dr.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            dr.Reject(_currentUserService.UserId, command.Reason);

            await _repository.UpdateAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest rejected: Id={Id}, RejectedBy={UserId}",
                command.Id,
                _currentUserService.UserId);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot reject DeploymentRequest: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting DeploymentRequest: Id={Id}", command.Id);
            return Result.Error("An error occurred while rejecting the deployment request.");
        }
    }
}
