using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate.Events;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.Interfaces;

namespace Apex.API.Infrastructure.Notifications.EventHandlers;

/// <summary>
/// Notifies Managers and TenantAdmins when a deployment request is submitted.
/// </summary>
public class NotifyOnDeploymentRequestSubmittedHandler : INotificationHandler<DeploymentRequestSubmittedEvent>
{
    private readonly IReadRepository<DeploymentRequest> _drRepository;
    private readonly UserManager<User> _userManager;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnDeploymentRequestSubmittedHandler> _logger;

    public NotifyOnDeploymentRequestSubmittedHandler(
        IReadRepository<DeploymentRequest> drRepository,
        UserManager<User> userManager,
        INotificationService notificationService,
        ILogger<NotifyOnDeploymentRequestSubmittedHandler> logger)
    {
        _drRepository = drRepository;
        _userManager = userManager;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DeploymentRequestSubmittedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _drRepository.GetByIdAsync(notification.DeploymentRequestId, cancellationToken);
            if (dr == null) return;

            var tenantId = dr.TenantId.Value;
            var managers = await _userManager.GetUsersInRoleAsync("Manager");
            var admins = await _userManager.GetUsersInRoleAsync("TenantAdmin");

            var recipients = managers.Concat(admins)
                .Where(u => u.TenantId.Value == tenantId)
                .Select(u => u.Id)
                .Distinct();

            foreach (var userId in recipients)
            {
                await _notificationService.CreateAndSendAsync(
                    tenantId,
                    userId,
                    "Deployment Request Submitted",
                    $"\"{notification.Title}\" has been submitted for approval.",
                    "Deployment",
                    notification.DeploymentRequestId.Value.ToString(),
                    $"/deployment-requests/{notification.DeploymentRequestId.Value}",
                    cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for DeploymentRequestSubmitted {Id}", notification.DeploymentRequestId);
        }
    }
}

/// <summary>Notifies the deployment request creator that it was approved.</summary>
public class NotifyOnDeploymentRequestApprovedHandler : INotificationHandler<DeploymentRequestApprovedEvent>
{
    private readonly IReadRepository<DeploymentRequest> _drRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnDeploymentRequestApprovedHandler> _logger;

    public NotifyOnDeploymentRequestApprovedHandler(
        IReadRepository<DeploymentRequest> drRepository,
        INotificationService notificationService,
        ILogger<NotifyOnDeploymentRequestApprovedHandler> logger)
    {
        _drRepository = drRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DeploymentRequestApprovedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _drRepository.GetByIdAsync(notification.DeploymentRequestId, cancellationToken);
            if (dr == null) return;

            await _notificationService.CreateAndSendAsync(
                dr.TenantId.Value,
                dr.CreatedByUserId,
                "Deployment Request Approved",
                $"\"{notification.Title}\" has been approved.",
                "Deployment",
                notification.DeploymentRequestId.Value.ToString(),
                $"/deployment-requests/{notification.DeploymentRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for DeploymentRequestApproved {Id}", notification.DeploymentRequestId);
        }
    }
}

/// <summary>Notifies the deployment request creator that it was rejected.</summary>
public class NotifyOnDeploymentRequestRejectedHandler : INotificationHandler<DeploymentRequestRejectedEvent>
{
    private readonly IReadRepository<DeploymentRequest> _drRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnDeploymentRequestRejectedHandler> _logger;

    public NotifyOnDeploymentRequestRejectedHandler(
        IReadRepository<DeploymentRequest> drRepository,
        INotificationService notificationService,
        ILogger<NotifyOnDeploymentRequestRejectedHandler> logger)
    {
        _drRepository = drRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DeploymentRequestRejectedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _drRepository.GetByIdAsync(notification.DeploymentRequestId, cancellationToken);
            if (dr == null) return;

            await _notificationService.CreateAndSendAsync(
                dr.TenantId.Value,
                dr.CreatedByUserId,
                "Deployment Request Rejected",
                $"\"{notification.Title}\" was rejected.",
                "Deployment",
                notification.DeploymentRequestId.Value.ToString(),
                $"/deployment-requests/{notification.DeploymentRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for DeploymentRequestRejected {Id}", notification.DeploymentRequestId);
        }
    }
}

/// <summary>Notifies the deployment request creator that it was deployed successfully.</summary>
public class NotifyOnDeploymentRequestDeployedHandler : INotificationHandler<DeploymentRequestDeployedEvent>
{
    private readonly IReadRepository<DeploymentRequest> _drRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnDeploymentRequestDeployedHandler> _logger;

    public NotifyOnDeploymentRequestDeployedHandler(
        IReadRepository<DeploymentRequest> drRepository,
        INotificationService notificationService,
        ILogger<NotifyOnDeploymentRequestDeployedHandler> logger)
    {
        _drRepository = drRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DeploymentRequestDeployedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _drRepository.GetByIdAsync(notification.DeploymentRequestId, cancellationToken);
            if (dr == null) return;

            await _notificationService.CreateAndSendAsync(
                dr.TenantId.Value,
                dr.CreatedByUserId,
                "Deployment Completed",
                $"\"{notification.Title}\" was deployed successfully.",
                "Deployment",
                notification.DeploymentRequestId.Value.ToString(),
                $"/deployment-requests/{notification.DeploymentRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for DeploymentRequestDeployed {Id}", notification.DeploymentRequestId);
        }
    }
}

/// <summary>Notifies the deployment request creator that the deployment failed.</summary>
public class NotifyOnDeploymentRequestFailedHandler : INotificationHandler<DeploymentRequestFailedEvent>
{
    private readonly IReadRepository<DeploymentRequest> _drRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnDeploymentRequestFailedHandler> _logger;

    public NotifyOnDeploymentRequestFailedHandler(
        IReadRepository<DeploymentRequest> drRepository,
        INotificationService notificationService,
        ILogger<NotifyOnDeploymentRequestFailedHandler> logger)
    {
        _drRepository = drRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(DeploymentRequestFailedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var dr = await _drRepository.GetByIdAsync(notification.DeploymentRequestId, cancellationToken);
            if (dr == null) return;

            await _notificationService.CreateAndSendAsync(
                dr.TenantId.Value,
                dr.CreatedByUserId,
                "Deployment Failed",
                $"\"{notification.Title}\" deployment failed.",
                "Deployment",
                notification.DeploymentRequestId.Value.ToString(),
                $"/deployment-requests/{notification.DeploymentRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for DeploymentRequestFailed {Id}", notification.DeploymentRequestId);
        }
    }
}
