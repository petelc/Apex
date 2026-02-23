using MediatR;
using Microsoft.Extensions.Logging;
using Ardalis.Result;
using Traxs.SharedKernel;
using Apex.API.Core.Interfaces;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.ValueObjects;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.UseCases.DeploymentRequests.Create;

/// <summary>
/// Handler for creating a new DeploymentRequest
/// </summary>
public class CreateDeploymentRequestHandler : IRequestHandler<CreateDeploymentRequestCommand, Result<DeploymentRequestId>>
{
    private readonly IRepository<DeploymentRequest> _repository;
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateDeploymentRequestHandler> _logger;

    public CreateDeploymentRequestHandler(
        IRepository<DeploymentRequest> repository,
        ITenantContext tenantContext,
        ICurrentUserService currentUserService,
        ILogger<CreateDeploymentRequestHandler> logger)
    {
        _repository = repository;
        _tenantContext = tenantContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<DeploymentRequestId>> Handle(CreateDeploymentRequestCommand command, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation(
                "Creating DeploymentRequest: Title={Title}, User={UserId}, Tenant={TenantId}",
                command.Title,
                _currentUserService.UserId,
                _tenantContext.CurrentTenantId);

            if (!RequestPriority.TryFromName(command.Priority, out var priority))
                return Result<DeploymentRequestId>.Error($"Invalid priority: {command.Priority}. Valid values: Low, Medium, High, Urgent");

            if (!RiskLevel.TryFromName(command.RiskLevel, out var riskLevel))
                return Result<DeploymentRequestId>.Error($"Invalid risk level: {command.RiskLevel}. Valid values: Low, Medium, High, Critical");

            if (!DeploymentEnvironment.TryFromName(command.Environment, out var environment))
                return Result<DeploymentRequestId>.Error($"Invalid environment: {command.Environment}. Valid values: Development, Staging, UAT, Production");

            var dr = DeploymentRequest.Create(
                _tenantContext.CurrentTenantId,
                command.Title,
                command.Description,
                _currentUserService.UserId,
                priority,
                riskLevel,
                environment,
                command.AffectedSystems,
                command.RollbackPlan,
                command.ProjectId,
                command.ChangeRequestId,
                command.ScheduledStartDate,
                command.ScheduledEndDate,
                command.DeploymentWindow);

            await _repository.AddAsync(dr, cancellationToken);

            _logger.LogInformation(
                "DeploymentRequest created successfully: Id={Id}, Title={Title}",
                dr.Id,
                dr.Title);

            return Result<DeploymentRequestId>.Success(dr.Id);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error creating DeploymentRequest: {Message}", ex.Message);
            return Result<DeploymentRequestId>.Error(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating DeploymentRequest: Title={Title}", command.Title);
            return Result<DeploymentRequestId>.Error("An unexpected error occurred while creating the deployment request.");
        }
    }
}
