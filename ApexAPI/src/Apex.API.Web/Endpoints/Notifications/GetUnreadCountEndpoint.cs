using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Apex.API.Infrastructure.Data;
using Apex.API.UseCases.Common.Interfaces;

namespace Apex.API.Web.Endpoints.Notifications;

public class GetUnreadCountEndpoint : EndpointWithoutRequest
{
    private readonly ApexDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetUnreadCountEndpoint(ApexDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public override void Configure()
    {
        Get("/notifications/unread-count");
        Roles("User", "Manager", "TenantAdmin", "ReadOnly");
        Summary(s =>
        {
            s.Summary = "Get unread notification count for the current user";
            s.Response(200, "Unread count");
            s.Response(401, "Unauthorized");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var tenantId = _currentUser.TenantId;

        var count = await _db.Notifications
            .CountAsync(n => n.UserId == userId && n.TenantId == tenantId && !n.IsRead, ct);

        await HttpContext.Response.WriteAsJsonAsync(new { count }, ct);
    }
}
