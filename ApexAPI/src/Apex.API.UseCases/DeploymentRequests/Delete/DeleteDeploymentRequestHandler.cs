using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Common.Interfaces;
using Apex.API.Core.ValueObjects;

namespace Apex.API.UseCases.DeploymentRequests.Delete;

public class DeleteDeploymentRequestHandler : IRequestHandler<DeleteDeploymentRequestCommand, Result>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeleteDeploymentRequestHandler> _logger;

    public DeleteDeploymentRequestHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<DeleteDeploymentRequestHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteDeploymentRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _repository.GetByIdAsync(command.Id, cancellationToken);

            if (dr == null)
                return Result.NotFound("Deployment request not found.");

            if (dr.TenantId != _tenantContext.CurrentTenantId)
                return Result.Forbidden();

            if (dr.Status != DeploymentRequestStatus.Draft && dr.Status != DeploymentRequestStatus.Cancelled)
                return Result.Error("Only Draft or Cancelled deployment requests can be deleted.");

            await _repository.DeleteAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest deleted: Id={Id}, UserId={UserId}",
                command.Id,
                _currentUserService.UserId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting DeploymentRequest: Id={Id}", command.Id);
            return Result.Error("An error occurred while deleting the deployment request.");
        }
    }
}