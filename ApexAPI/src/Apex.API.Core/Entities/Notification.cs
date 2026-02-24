namespace Apex.API.Core.Entities;

/// <summary>
/// In-app notification for a specific tenant user.
/// Plain entity — not an aggregate root; no domain events.
/// </summary>
public class Notification
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; private set; }
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;

    /// <summary>Discriminator for the source aggregate, e.g. "ChangeRequest", "Deployment".</summary>
    public string Type { get; private set; } = string.Empty;

    /// <summary>String ID of the related entity (e.g. the ChangeRequestId Guid as string).</summary>
    public string? EntityId { get; private set; }

    /// <summary>Frontend route to navigate to on click, e.g. "/change-requests/abc".</summary>
    public string? ActionUrl { get; private set; }

    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    // EF Core constructor
    private Notification() { }

    public static Notification Create(
        Guid tenantId,
        Guid userId,
        string title,
        string message,
        string type,
        string? entityId = null,
        string? actionUrl = null)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            EntityId = entityId,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkAsRead() => IsRead = true;
}
