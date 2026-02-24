using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UseCases.DeploymentRequests.Rollback;

public class RollbackDeploymentRequestHandler : IRequestHandler<RollbackDeploymentRequestCommand, Result>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RollbackDeploymentRequestHandler> _logger;

    public RollbackDeploymentRequestHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<RollbackDeploymentRequestHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(RollbackDeploymentRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _repository.GetByIdAsync(command.Id, cancellationToken);

            if (dr == null)
                return Result.NotFound("Deployment request not found.");

            if (dr.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            dr.Rollback(command.Reason);

            await _repository.UpdateAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest rolled back: Id={Id}, UserId={UserId}",
                command.Id,
                _currentUserService.UserId);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot rollback DeploymentRequest: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error rolling back DeploymentRequest: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rolling back DeploymentRequest: Id={Id}", command.Id);
            return Result.Error("An error occurred while rolling back the deployment request.");
        }
    }
}