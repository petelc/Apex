using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Dashboard.DTOs;
using Apex.API.UseCases.Common.Interfaces;
using Apex.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Apex.API.Infrastructure.Services;

/// <summary>
/// Dashboard service implementation with distributed Redis caching.
/// All queries are scoped to the current tenant via ITenantContext.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly ApexDbContext _context;
    private readonly ICacheService _cache;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<DashboardService> _logger;

    // Per-tenant-user composite stats cache (2 min + jitter)
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(2);

    private string DashKey(Guid userId) =>
        $"v1:dash:{_tenantContext.CurrentTenantId.Value}:{userId}";

    public DashboardService(
        ApexDbContext context,
        ICacheService cache,
        ITenantContext tenantContext,
        ILogger<DashboardService> logger)
    {
        _context = context;
        _cache = cache;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    public Task<DashboardStatsDto> GetDashboardStatsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
        => _cache.GetOrSetAsync<DashboardStatsDto>(
            DashKey(userId),
            ct => BuildStatsAsync(userId, ct),
            CacheDuration,
            cancellationToken);

    // Individual sub-methods are not cached separately — only the composite is.
    public Task<ChangeManagementStatsDto> GetChangeManagementStatsAsync(
        CancellationToken cancellationToken = default)
        => FetchChangeStatsAsync(cancellationToken);

    public Task<ProjectManagementStatsDto> GetProjectManagementStatsAsync(
        CancellationToken cancellationToken = default)
        => FetchProjectStatsAsync(cancellationToken);

    public Task<TaskManagementStatsDto> GetTaskManagementStatsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
        => FetchTaskStatsAsync(userId, cancellationToken);

    // -------------------------------------------------------------------------
    // Private builders
    // -------------------------------------------------------------------------

    private async Task<DashboardStatsDto> BuildStatsAsync(Guid userId, CancellationToken ct)
    {
        // Sequential queries — DbContext is not thread-safe
        var changeStats  = await FetchChangeStatsAsync(ct);
        var projectStats = await FetchProjectStatsAsync(ct);
        var taskStats    = await FetchTaskStatsAsync(userId, ct);
        var activity     = await FetchRecentActivityAsync(ct);

        return new DashboardStatsDto
        {
            ChangeManagement  = changeStats,
            ProjectManagement = projectStats,
            TaskManagement    = taskStats,
            RecentActivity    = activity
        };
    }

    private async Task<ChangeManagementStatsDto> FetchChangeStatsAsync(CancellationToken ct)
    {
        var tenantId = _tenantContext.CurrentTenantId;
        var today    = DateTime.UtcNow.Date;

        var changes = await _context.ChangeRequests
            .AsNoTracking()
            .Where(c => c.TenantId == tenantId)
            .Select(c => new { c.Status, c.ScheduledStartDate })
            .ToListAsync(ct);

        var total          = changes.Count;
        var draft          = changes.Count(c => c.Status.Value == 0);
        var pendingApproval = changes.Count(c => c.Status.Value == 1);
        var approved       = changes.Count(c => c.Status.Value == 2);
        var inProgress     = changes.Count(c => c.Status.Value == 4);
        var completed      = changes.Count(c => c.Status.Value == 5);
        var failed         = changes.Count(c => c.Status.Value == 6);
        var scheduledToday = changes.Count(c =>
            c.ScheduledStartDate.HasValue && c.ScheduledStartDate.Value.Date == today);

        var totalFinished = completed + failed;
        var successRate   = totalFinished > 0 ? (decimal)completed / totalFinished * 100 : 0;

        return new ChangeManagementStatsDto
        {
            TotalChanges    = total,
            DraftChanges    = draft,
            PendingApproval = pendingApproval,
            Approved        = approved,
            InProgress      = inProgress,
            Completed       = completed,
            Failed          = failed,
            SuccessRate     = Math.Round(successRate, 1),
            ScheduledToday  = scheduledToday
        };
    }

    private async Task<ProjectManagementStatsDto> FetchProjectStatsAsync(CancellationToken ct)
    {
        var tenantId = _tenantContext.CurrentTenantId;
        var now      = DateTime.UtcNow;

        var projectRequests = await _context.ProjectRequests
            .AsNoTracking()
            .Where(pr => pr.TenantId == tenantId)
            .Select(pr => new { pr.Status })
            .ToListAsync(ct);

        var pendingRequests = projectRequests.Count(pr => pr.Status.Value == 0 || pr.Status.Value == 1);

        var projects = await _context.Projects
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId)
            .Select(p => new { p.Status, p.EndDate })
            .ToListAsync(ct);

        var total          = projects.Count;
        var active         = projects.Count(p => p.Status.Value == 1);
        var onHold         = projects.Count(p => p.Status.Value == 2);
        var completed      = projects.Count(p => p.Status.Value == 3);
        var overdue        = projects.Count(p => p.Status.Value == 1 && p.EndDate.HasValue && p.EndDate.Value < now);
        var completionRate = total > 0 ? (decimal)completed / total * 100 : 0;

        return new ProjectManagementStatsDto
        {
            TotalProjects    = total,
            PendingRequests  = pendingRequests,
            ActiveProjects   = active,
            OnHoldProjects   = onHold,
            CompletedProjects = completed,
            OverdueProjects  = overdue,
            CompletionRate   = Math.Round(completionRate, 1)
        };
    }

    private async Task<TaskManagementStatsDto> FetchTaskStatsAsync(Guid userId, CancellationToken ct)
    {
        var tenantId = _tenantContext.CurrentTenantId;
        var today    = DateTime.UtcNow.Date;

        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId)
            .Select(t => new { t.Status, t.DueDate, t.AssignedToUserId })
            .ToListAsync(ct);

        var total          = tasks.Count;
        var open           = tasks.Count(t => t.Status.Value == 0);
        var inProgress     = tasks.Count(t => t.Status.Value == 1);
        var completed      = tasks.Count(t => t.Status.Value == 2);
        var overdue        = tasks.Count(t =>
            (t.Status.Value == 0 || t.Status.Value == 1) &&
            t.DueDate.HasValue && t.DueDate.Value.Date < today);
        var myTasks        = tasks.Count(t => t.AssignedToUserId == userId);
        var dueToday       = tasks.Count(t =>
            (t.Status.Value == 0 || t.Status.Value == 1) &&
            t.DueDate.HasValue && t.DueDate.Value.Date == today);
        var completionRate = total > 0 ? (decimal)completed / total * 100 : 0;

        return new TaskManagementStatsDto
        {
            TotalTasks      = total,
            OpenTasks       = open,
            InProgressTasks = inProgress,
            CompletedTasks  = completed,
            OverdueTasks    = overdue,
            MyTasks         = myTasks,
            DueToday        = dueToday,
            CompletionRate  = Math.Round(completionRate, 1)
        };
    }

    private async Task<RecentActivityDto> FetchRecentActivityAsync(CancellationToken ct)
    {
        var tenantId = _tenantContext.CurrentTenantId;

        var recentChanges = await _context.ChangeRequests
            .AsNoTracking()
            .Where(c => c.TenantId == tenantId)
            .OrderByDescending(c => c.CreatedDate)
            .Take(5)
            .Select(c => new RecentChangeDto
            {
                Id          = c.Id.Value,
                Title       = c.Title,
                Status      = c.Status.Name,
                CreatedDate = c.CreatedDate
            })
            .ToListAsync(ct);

        var recentProjects = await _context.Projects
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId)
            .OrderByDescending(p => p.CreatedDate)
            .Take(5)
            .Select(p => new RecentProjectDto
            {
                Id          = p.Id.Value,
                Name        = p.Name,
                Status      = p.Status.Name,
                CreatedDate = p.CreatedDate
            })
            .ToListAsync(ct);

        var recentTasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId)
            .OrderByDescending(t => t.CreatedDate)
            .Take(5)
            .Select(t => new RecentTaskDto
            {
                Id     = t.Id.Value,
                Title  = t.Title,
                Status = t.Status.Name,
                DueDate = t.DueDate
            })
            .ToListAsync(ct);

        return new RecentActivityDto
        {
            RecentChanges  = recentChanges,
            RecentProjects = recentProjects,
            RecentTasks    = recentTasks
        };
    }
}
