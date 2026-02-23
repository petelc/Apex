using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UseCases.DeploymentRequests.StartExecution;

/// <summary>
/// Handler for starting execution of a scheduled DeploymentRequest
/// </summary>
public class StartExecutionHandler : IRequestHandler<StartExecutionCommand, Result>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<StartExecutionHandler> _logger;

    public StartExecutionHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<StartExecutionHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(StartExecutionCommand command, CancellationToken cancellationToken)
    {
        try
        {
            if (!_currentUserService.IsInRole("Manager") && !_currentUserService.IsInRole("TenantAdmin"))
            {
                _logger.LogWarning(
                    "Unauthorized start execution attempt: UserId={UserId}, DeploymentRequestId={Id}",
                    _currentUserService.UserId,
                    command.Id);
                return Result.Forbidden();
            }

            var dr = await _repository.GetByIdAsync(command.Id, cancellationToken);

            if (dr == null)
                return Result.NotFound("Deployment request not found.");

            if (dr.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            dr.StartExecution();

            await _repository.UpdateAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest execution started: Id={Id}, UserId={UserId}",
                command.Id,
                _currentUserService.UserId);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot start execution of DeploymentRequest: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting execution of DeploymentRequest: Id={Id}", command.Id);
            return Result.Error("An error occurred while starting the deployment request execution.");
        }
    }
}
