using FastEndpoints;
using Microsoft.AspNetCore.Identity;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.Interfaces;

namespace Apex.API.Web.Endpoints.Admin;

/// <summary>
/// Create a new role in the system.
/// </summary>
public class CreateRoleEndpoint : Endpoint<CreateRoleRequest>
{
    private readonly RoleManager<Role> _roleManager;
    private readonly ITenantContext _tenantContext;

    public CreateRoleEndpoint(RoleManager<Role> roleManager, ITenantContext tenantContext)
    {
        _roleManager = roleManager;
        _tenantContext = tenantContext;
    }

    public override void Configure()
    {
        Post("/admin/roles");
        Roles("TenantAdmin");

        Description(b => b
            .WithTags("Admin")
            .WithSummary("Create a new role")
            .WithDescription("Creates a new role available for assignment to users."));
    }

    public override async Task HandleAsync(CreateRoleRequest req, CancellationToken ct)
    {
        var name = req.Name?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await HttpContext.Response.WriteAsJsonAsync(new { error = "Role name is required." }, ct);
            return;
        }

        if (await _roleManager.RoleExistsAsync(name))
        {
            HttpContext.Response.StatusCode = StatusCodes.Status409Conflict;
            await HttpContext.Response.WriteAsJsonAsync(new { error = $"Role '{name}' already exists." }, ct);
            return;
        }

        var role = Role.Create(_tenantContext.CurrentTenantId, name, description: string.Empty);
        var result = await _roleManager.CreateAsync(role);

        if (result.Succeeded)
        {
            HttpContext.Response.StatusCode = StatusCodes.Status201Created;
            await HttpContext.Response.WriteAsJsonAsync(new { name }, ct);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await HttpContext.Response.WriteAsJsonAsync(new
            {
                errors = result.Errors.Select(e => e.Description)
            }, ct);
        }
    }
}

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
}
