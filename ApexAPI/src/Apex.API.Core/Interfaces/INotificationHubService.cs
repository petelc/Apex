namespace Apex.API.Core.Interfaces;

/// <summary>
/// Abstraction over the SignalR hub so Infrastructure can push messages without
/// a direct dependency on the Web layer (which would create a circular reference).
/// Implemented in Apex.API.Web.
/// </summary>
public interface INotificationHubService
{
    Task SendToUserAsync(string userId, object payload, CancellationToken ct = default);
}
