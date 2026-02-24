using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.ProjectRequestAggregate;
using Apex.API.Core.Aggregates.ProjectRequestAggregate.Events;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.Interfaces;

namespace Apex.API.Infrastructure.Notifications.EventHandlers;

/// <summary>
/// Notifies Managers and TenantAdmins when a project request is submitted.
/// </summary>
public class NotifyOnProjectRequestSubmittedHandler : INotificationHandler<ProjectRequestSubmittedEvent>
{
    private readonly IReadRepository<ProjectRequest> _prRepository;
    private readonly UserManager<User> _userManager;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnProjectRequestSubmittedHandler> _logger;

    public NotifyOnProjectRequestSubmittedHandler(
        IReadRepository<ProjectRequest> prRepository,
        UserManager<User> userManager,
        INotificationService notificationService,
        ILogger<NotifyOnProjectRequestSubmittedHandler> logger)
    {
        _prRepository = prRepository;
        _userManager = userManager;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ProjectRequestSubmittedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var pr = await _prRepository.GetByIdAsync(notification.ProjectRequestId, cancellationToken);
            if (pr == null) return;

            var tenantId = pr.TenantId.Value;
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
                    "Project Request Submitted",
                    $"\"{pr.Title}\" has been submitted for approval.",
                    "ProjectRequest",
                    notification.ProjectRequestId.Value.ToString(),
                    $"/project-requests/{notification.ProjectRequestId.Value}",
                    cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ProjectRequestSubmitted {Id}", notification.ProjectRequestId);
        }
    }
}

/// <summary>Notifies the project request creator that it was approved.</summary>
public class NotifyOnProjectRequestApprovedHandler : INotificationHandler<ProjectRequestApprovedEvent>
{
    private readonly IReadRepository<ProjectRequest> _prRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnProjectRequestApprovedHandler> _logger;

    public NotifyOnProjectRequestApprovedHandler(
        IReadRepository<ProjectRequest> prRepository,
        INotificationService notificationService,
        ILogger<NotifyOnProjectRequestApprovedHandler> logger)
    {
        _prRepository = prRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ProjectRequestApprovedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var pr = await _prRepository.GetByIdAsync(notification.ProjectRequestId, cancellationToken);
            if (pr == null) return;

            await _notificationService.CreateAndSendAsync(
                pr.TenantId.Value,
                pr.CreatedByUserId,
                "Project Request Approved",
                $"\"{pr.Title}\" has been approved.",
                "ProjectRequest",
                notification.ProjectRequestId.Value.ToString(),
                $"/project-requests/{notification.ProjectRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ProjectRequestApproved {Id}", notification.ProjectRequestId);
        }
    }
}

/// <summary>Notifies the project request creator that it was rejected.</summary>
public class NotifyOnProjectRequestRejectedHandler : INotificationHandler<ProjectRequestRejectedEvent>
{
    private readonly IReadRepository<ProjectRequest> _prRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotifyOnProjectRequestRejectedHandler> _logger;

    public NotifyOnProjectRequestRejectedHandler(
        IReadRepository<ProjectRequest> prRepository,
        INotificationService notificationService,
        ILogger<NotifyOnProjectRequestRejectedHandler> logger)
    {
        _prRepository = prRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ProjectRequestRejectedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var pr = await _prRepository.GetByIdAsync(notification.ProjectRequestId, cancellationToken);
            if (pr == null) return;

            await _notificationService.CreateAndSendAsync(
                pr.TenantId.Value,
                pr.CreatedByUserId,
                "Project Request Rejected",
                $"\"{pr.Title}\" was rejected.",
                "ProjectRequest",
                notification.ProjectRequestId.Value.ToString(),
                $"/project-requests/{notification.ProjectRequestId.Value}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification for ProjectRequestRejected {Id}", notification.ProjectRequestId);
        }
    }
}
