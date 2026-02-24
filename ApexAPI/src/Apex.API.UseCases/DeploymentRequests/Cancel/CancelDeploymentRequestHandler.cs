using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UseCases.DeploymentRequests.Cancel;

public class CancelDeploymentRequestHandler : IRequestHandler<CancelDeploymentRequestCommand, Result>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CancelDeploymentRequestHandler> _logger;

    public CancelDeploymentRequestHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<CancelDeploymentRequestHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(CancelDeploymentRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _repository.GetByIdAsync(command.Id, cancellationToken);

            if (dr == null)
                return Result.NotFound("Deployment request not found.");

            if (dr.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            dr.Cancel();

            await _repository.UpdateAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest cancelled: Id={Id}, UserId={UserId}",
                command.Id,
                _currentUserService.UserId);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot cancel DeploymentRequest: {Message}", ex.Message);
            return Result.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling DeploymentRequest: Id={Id}", command.Id);
            return Result.Error("An error occurred while cancelling the deployment request.");
        }
    }
}