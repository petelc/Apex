using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Apex.API.Core.Entities;
using Apex.API.Core.Interfaces;
using Apex.API.Infrastructure.Data;

namespace Apex.API.Infrastructure.Notifications;

/// <summary>
/// Persists a notification to the database and sends it via SignalR.
/// Uses IServiceScopeFactory to get a fresh DbContext so it doesn't interfere with the
/// ambient Unit of Work (domain events fire before base.SaveChangesAsync).
/// </summary>
public class SignalRNotificationService : INotificationService
{
    private readonly INotificationHubService _hubService;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        INotificationHubService hubService,
        IServiceScopeFactory scopeFactory,
        ILogger<SignalRNotificationService> logger)
    {
        _hubService = hubService;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task CreateAndSendAsync(
        Guid tenantId,
        Guid recipientUserId,
        string title,
        string message,
        string type,
        string? entityId = null,
        string? actionUrl = null,
        CancellationToken ct = default)
    {
        try
        {
            var notification = Notification.Create(tenantId, recipientUserId, title, message, type, entityId, actionUrl);

            // Use a fresh scope so we don't interfere with the ambient UoW transaction.
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<ApexDbContext>();
            db.Notifications.Add(notification);
            await db.SaveChangesAsync(ct);

            var payload = new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.EntityId,
                notification.ActionUrl,
                notification.IsRead,
                notification.CreatedAt
            };

            await _hubService.SendToUserAsync(recipientUserId.ToString(), payload, ct);

            _logger.LogDebug(
                "Notification sent to user {UserId}: [{Type}] {Title}",
                recipientUserId, type, title);
        }
        catch (Exception ex)
        {
            // Notification failures must not break the main workflow.
            _logger.LogError(ex, "Failed to send notification to user {UserId}: {Title}", recipientUserId, title);
        }
    }
}
