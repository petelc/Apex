using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Apex.API.Infrastructure.Data;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.Web.Endpoints.Notifications;

public class MarkNotificationReadEndpoint : EndpointWithoutRequest
{
    private readonly ApexDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkNotificationReadEndpoint(ApexDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public override void Configure()
    {
        Post("/notifications/{id}/read");
        Roles("User", "Manager", "TenantAdmin", "ReadOnly");
        Summary(s =>
        {
            s.Summary = "Mark a notification as read";
            s.Response(200, "Marked as read");
            s.Response(404, "Not found");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var userId = _currentUser.UserId;

        var notification = await _db.Notifications.FindAsync([id], ct);

        if (notification == null || notification.UserId != userId)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        notification.MarkAsRead();
        await _db.SaveChangesAsync(ct);

        await HttpContext.Response.WriteAsJsonAsync(new { message = "Marked as read." }, ct);
    }
}
