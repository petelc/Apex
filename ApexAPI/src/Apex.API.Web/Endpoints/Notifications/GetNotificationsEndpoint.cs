using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Apex.API.Infrastructure.Data;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.Web.Endpoints.Notifications;

public class GetNotificationsRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class GetNotificationsEndpoint : Endpoint<GetNotificationsRequest>
{
    private readonly ApexDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsEndpoint(ApexDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public override void Configure()
    {
        Get("/notifications");
        Roles("User", "Manager", "TenantAdmin", "ReadOnly");
        Summary(s =>
        {
            s.Summary = "Get notifications for the current user";
            s.Response(200, "Paginated list of notifications");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(GetNotificationsRequest req, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var tenantId = _currentUser.TenantId;

        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId && n.TenantId == tenantId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((req.Page - 1) * req.PageSize)
            .Take(req.PageSize)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                n.Type,
                n.EntityId,
                n.ActionUrl,
                n.IsRead,
                n.CreatedAt
            })
            .ToListAsync(ct);

        await HttpContext.Response.WriteAsJsonAsync(notifications, ct);
    }
}
