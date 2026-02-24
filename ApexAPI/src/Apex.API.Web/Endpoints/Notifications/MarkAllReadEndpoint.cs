using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Apex.API.Infrastructure.Data;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.Web.Endpoints.Notifications;

public class MarkAllReadEndpoint : EndpointWithoutRequest
{
    private readonly ApexDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkAllReadEndpoint(ApexDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public override void Configure()
    {
        Post("/notifications/read-all");
        Roles("User", "Manager", "TenantAdmin", "ReadOnly");
        Summary(s =>
        {
            s.Summary = "Mark all notifications as read for the current user";
            s.Response(200, "All marked as read");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var tenantId = _currentUser.TenantId;

        await _db.Notifications
            .Where(n => n.UserId == userId && n.TenantId == tenantId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);

        await HttpContext.Response.WriteAsJsonAsync(new { message = "All notifications marked as read." }, ct);
    }
}
