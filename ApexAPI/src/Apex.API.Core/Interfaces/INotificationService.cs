namespace Apex.API.Core.Interfaces;

/// <summary>
/// Persists a notification to the database and pushes it in real-time via SignalR.
/// </summary>
public interface INotificationService
{
    Task CreateAndSendAsync(
        Guid tenantId,
        Guid recipientUserId,
        string title,
        string message,
        string type,
        string? entityId = null,
        string? actionUrl = null,
        CancellationToken ct = default);
}
