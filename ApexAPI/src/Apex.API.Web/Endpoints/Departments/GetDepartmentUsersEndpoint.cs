using FastEndpoints;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.Interfaces;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Web.Endpoints.Departments;

public class DepartmentUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class GetDepartmentUsersEndpoint : EndpointWithoutRequest
{
    private readonly UserManager<User> _userManager;
    private readonly ITenantContext _tenantContext;

    public GetDepartmentUsersEndpoint(
        UserManager<User> userManager,
        ITenantContext tenantContext)
    {
        _userManager = userManager;
        _tenantContext = tenantContext;
    }

    public override void Configure()
    {
        Get("/departments/{id}/users");
        Roles("TenantAdmin", "Administrator", "Manager");
        Summary(s =>
        {
            s.Summary = "Get users in a department";
            s.Description = "Returns all users assigned to the specified department";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var departmentId = Route<Guid>("id");

        var users = await _userManager.Users
            .Where(u => u.DepartmentId == DepartmentId.From(departmentId) &&
                        u.TenantId == _tenantContext.CurrentTenantId)
            .Select(u => new DepartmentUserDto
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                FullName = u.FullName,
                IsActive = u.IsActive
            })
            .ToListAsync(ct);

        await HttpContext.Response.WriteAsJsonAsync(users, ct);
    }
}