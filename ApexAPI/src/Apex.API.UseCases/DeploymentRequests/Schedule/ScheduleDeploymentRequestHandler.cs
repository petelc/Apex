using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UseCases.DeploymentRequests.Schedule;

/// <summary>
/// Handler for scheduling an approved DeploymentRequest
/// </summary>
public class ScheduleDeploymentRequestHandler : IRequestHandler<ScheduleDeploymentRequestCommand, Result>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ScheduleDeploymentRequestHandler> _logger;

    public ScheduleDeploymentRequestHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<ScheduleDeploymentRequestHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(ScheduleDeploymentRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            if (!_currentUserService.IsInRole("Manager") && !_currentUserService.IsInRole("TenantAdmin"))
            {
                _logger.LogWarning(
                    "Unauthorized schedule attempt: UserId={UserId}, DeploymentRequestId={Id}",
                    _currentUserService.UserId,
                    command.Id);
                return Result.Forbidden();
            }

            var dr = await _repository.GetByIdAsync(command.Id, cancellationToken);

            if (dr == null)
                return Result.NotFound("Deployment request not found.");

            if (dr.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            dr.Schedule(command.ScheduledStartDate, command.ScheduledEndDate, command.DeploymentWindow);

            await _repository.UpdateAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest scheduled: Id={Id}, Start={Start}, End={End}",
                command.Id,
                command.ScheduledStartDate,
                command.ScheduledEndDate);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot schedule DeploymentRequest: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scheduling DeploymentRequest: Id={Id}", command.Id);
            return Result.Error("An error occurred while scheduling the deployment request.");
        }
    }
}
