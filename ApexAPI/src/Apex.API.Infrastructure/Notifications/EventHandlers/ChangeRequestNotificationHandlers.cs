using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.ChangeRequestAggregate;
using Apex.API.Core.Aggregates.ChangeRequestAggregate.Events;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.Interfaces;

namespace Apex.API.Infrastructure.Notifications.EventHandlers;

/// <summary>
/// Sends in-app notifications when a change request is submitted.
/// Notifies all Managers and TenantAdmins in the tenant.
/// </summary>
public class NotifyOnChangeRequestSubmittedHandler : INotificationHandler<ChangeRequestSubmittedEvent>
{
    private readonly IReadRepository<ChangeRequest> _crRepository;
    private readonly UserManager<User> _userManager;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnChangeRequestSubmittedHandler> _logger;

    public NotifyOnChangeRequestSubmittedHandler(
        IReadRepository<ChangeRequest> crRepository,
        UserManager<User> userManager,
        INotificationService notificationService,
        ILogger<NotifyOnChangeRequestSubmittedHandler> logger)
    {
        _crRepository = crRepository;
        _userManager = userManager;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ChangeRequestSubmittedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var cr = await _crRepository.GetByIdAsync(notification.ChangeRequestId, cancellationToken);
            if (cr == null) return;

            var tenantId = cr.TenantId.Value;
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
                    "Change Request Submitted",
                    $"\"{notification.Title}\" has been submitted for review.",
                    "ChangeRequest",
                    notification.ChangeRequestId.Value.ToString(),
                    $"/change-requests/{notification.ChangeRequestId.Value}",
                    cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ChangeRequestSubmitted {Id}", notification.ChangeRequestId);
        }
    }
}

/// <summary>Notifies the CR creator that it was approved.</summary>
public class NotifyOnChangeRequestApprovedHandler : INotificationHandler<ChangeRequestApprovedEvent>
{
    private readonly IReadRepository<ChangeRequest> _crRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnChangeRequestApprovedHandler> _logger;

    public NotifyOnChangeRequestApprovedHandler(
        IReadRepository<ChangeRequest> crRepository,
        INotificationService notificationService,
        ILogger<NotifyOnChangeRequestApprovedHandler> logger)
    {
        _crRepository = crRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ChangeRequestApprovedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var cr = await _crRepository.GetByIdAsync(notification.ChangeRequestId, cancellationToken);
            if (cr == null) return;

            await _notificationService.CreateAndSendAsync(
                cr.TenantId.Value,
                cr.CreatedByUserId,
                "Change Request Approved",
                $"\"{notification.Title}\" has been approved.",
                "ChangeRequest",
                notification.ChangeRequestId.Value.ToString(),
                $"/change-requests/{notification.ChangeRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ChangeRequestApproved {Id}", notification.ChangeRequestId);
        }
    }
}

/// <summary>Notifies the CR creator that it was denied.</summary>
public class NotifyOnChangeRequestDeniedHandler : INotificationHandler<ChangeRequestDeniedEvent>
{
    private readonly IReadRepository<ChangeRequest> _crRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnChangeRequestDeniedHandler> _logger;

    public NotifyOnChangeRequestDeniedHandler(
        IReadRepository<ChangeRequest> crRepository,
        INotificationService notificationService,
        ILogger<NotifyOnChangeRequestDeniedHandler> logger)
    {
        _crRepository = crRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ChangeRequestDeniedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var cr = await _crRepository.GetByIdAsync(notification.ChangeRequestId, cancellationToken);
            if (cr == null) return;

            await _notificationService.CreateAndSendAsync(
                cr.TenantId.Value,
                cr.CreatedByUserId,
                "Change Request Denied",
                $"\"{notification.Title}\" was denied.",
                "ChangeRequest",
                notification.ChangeRequestId.Value.ToString(),
                $"/change-requests/{notification.ChangeRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ChangeRequestDenied {Id}", notification.ChangeRequestId);
        }
    }
}

/// <summary>Notifies the CR creator that it was completed.</summary>
public class NotifyOnChangeRequestCompletedHandler : INotificationHandler<ChangeRequestCompletedEvent>
{
    private readonly IReadRepository<ChangeRequest> _crRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnChangeRequestCompletedHandler> _logger;

    public NotifyOnChangeRequestCompletedHandler(
        IReadRepository<ChangeRequest> crRepository,
        INotificationService notificationService,
        ILogger<NotifyOnChangeRequestCompletedHandler> logger)
    {
        _crRepository = crRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ChangeRequestCompletedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var cr = await _crRepository.GetByIdAsync(notification.ChangeRequestId, cancellationToken);
            if (cr == null) return;

            await _notificationService.CreateAndSendAsync(
                cr.TenantId.Value,
                cr.CreatedByUserId,
                "Change Request Completed",
                $"\"{notification.Title}\" has been completed successfully.",
                "ChangeRequest",
                notification.ChangeRequestId.Value.ToString(),
                $"/change-requests/{notification.ChangeRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ChangeRequestCompleted {Id}", notification.ChangeRequestId);
        }
    }
}

/// <summary>Notifies the CR creator that it was rolled back.</summary>
public class NotifyOnChangeRequestRolledBackHandler : INotificationHandler<ChangeRequestRolledBackEvent>
{
    private readonly IReadRepository<ChangeRequest> _crRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnChangeRequestRolledBackHandler> _logger;

    public NotifyOnChangeRequestRolledBackHandler(
        IReadRepository<ChangeRequest> crRepository,
        INotificationService notificationService,
        ILogger<NotifyOnChangeRequestRolledBackHandler> logger)
    {
        _crRepository = crRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ChangeRequestRolledBackEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var cr = await _crRepository.GetByIdAsync(notification.ChangeRequestId, cancellationToken);
            if (cr == null) return;

            await _notificationService.CreateAndSendAsync(
                cr.TenantId.Value,
                cr.CreatedByUserId,
                "Change Request Rolled Back",
                $"\"{notification.Title}\" was rolled back.",
                "ChangeRequest",
                notification.ChangeRequestId.Value.ToString(),
                $"/change-requests/{notification.ChangeRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ChangeRequestRolledBack {Id}", notification.ChangeRequestId);
        }
    }
}
