using Microsoft.AspNetCore.SignalR;
using Apex.API.Core.Interfaces;
using Apex.API.Web.Hubs;

namespace Apex.API.Web.Infrastructure;

/// <summary>
/// Pushes real-time notifications to clients via SignalR.
/// Implements the Core interface so Infrastructure can call it without a circular dependency.
/// </summary>
public class NotificationHubService : INotificationHubService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationHubService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public Task SendToUserAsync(string userId, object payload, CancellationToken ct = default)
        => _hub.Clients.Group($"user-{userId}").SendAsync("notification", payload, ct);
}
