using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using Apex.API.Core.Interfaces;
using Apex.API.Core.ValueObjects;
using Apex.API.Infrastructure.Data;

namespace Apex.API.Web.Endpoints.Admin;

/// <summary>
/// Get all users in current tenant with roles, phone, and department.
/// 3 queries total (users → roles → departments) — no N+1.
/// </summary>
public class ListUsersWithRolesEndpoint : EndpointWithoutRequest
{
    private readonly ApexDbContext _context;
    private readonly ITenantContext _tenantContext;

    public ListUsersWithRolesEndpoint(
        ApexDbContext context,
        ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public override void Configure()
    {
        Get("/admin/users");
        Roles("TenantAdmin");

        Description(b => b
            .WithTags("Admin")
            .WithSummary("List all users with their roles")
            .WithDescription("Returns all users in current tenant with roles, phone, and department."));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var tenantId = _tenantContext.CurrentTenantId;

        // Query 1: all users in this tenant
        var users = await _context.Users
            .AsNoTracking()
            .Where(u => u.TenantId == tenantId)
            .OrderBy(u => u.FirstName).ThenBy(u => u.LastName)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.PhoneNumber,
                u.TimeZone,
                u.IsActive,
                u.CreatedDate,
                u.LastLoginDate,
                u.ProfileImageUrl,
                u.DepartmentId
            })
            .ToListAsync(ct);

        if (users.Count == 0)
        {
            await HttpContext.Response.WriteAsJsonAsync(new List<UserWithRolesDto>(), ct);
            return;
        }

        var userIds = users.Select(u => u.Id).ToList();

        // Query 2: roles for all users in one JOIN
        var roleMap = await _context.UserRoles
            .AsNoTracking()
            .Where(ur => userIds.Contains(ur.UserId))
            .Join(_context.Roles,
                ur => ur.RoleId,
                r  => r.Id,
                (ur, r) => new { ur.UserId, RoleName = r.Name ?? string.Empty })
            .GroupBy(x => x.UserId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Select(x => x.RoleName).ToList(),
                ct);

        // Query 3: department names — fetch in one query, map in memory
        var departmentIds = users
            .Where(u => u.DepartmentId.HasValue)
            .Select(u => u.DepartmentId!.Value)   // DepartmentId struct
            .Distinct()
            .ToList();

        Dictionary<Guid, string> deptMap;
        if (departmentIds.Count > 0)
        {
            var depts = await _context.Departments
                .AsNoTracking()
                .Where(d => departmentIds.Contains(d.Id))
                .ToListAsync(ct);
            deptMap = depts.ToDictionary(d => d.Id.Value, d => d.Name);
        }
        else
        {
            deptMap = new Dictionary<Guid, string>();
        }

        var result = users.Select(u => new UserWithRolesDto
        {
            UserId          = u.Id,
            Email           = u.Email ?? string.Empty,
            FirstName       = u.FirstName,
            LastName        = u.LastName,
            FullName        = $"{u.FirstName} {u.LastName}".Trim(),
            PhoneNumber     = u.PhoneNumber,
            TimeZone        = u.TimeZone,
            IsActive        = u.IsActive,
            CreatedDate     = u.CreatedDate,
            LastLoginDate   = u.LastLoginDate,
            ProfileImageUrl = u.ProfileImageUrl,
            DepartmentId    = u.DepartmentId.HasValue ? (Guid?)u.DepartmentId.Value.Value : null,
            DepartmentName  = u.DepartmentId.HasValue && deptMap.TryGetValue(u.DepartmentId.Value.Value, out var dname)
                              ? dname : null,
            Roles           = roleMap.TryGetValue(u.Id, out var roles) ? roles : new List<string>()
        }).ToList();

        await HttpContext.Response.WriteAsJsonAsync(result, ct);
    }
}

public class UserWithRolesDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? TimeZone { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public string? ProfileImageUrl { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public List<string> Roles { get; set; } = new();
}
