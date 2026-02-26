using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Users.DTOs;
using Apex.API.UseCases.Users.Interfaces;
using Apex.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Apex.API.Infrastructure.Services;

/// <summary>
/// Looks up user information with distributed Redis caching.
/// Batch methods do a single DB query for all uncached IDs and cache each result individually.
/// </summary>
public class UserLookupService : IUserLookupService
{
    private readonly ApexDbContext _context;
    private readonly ICacheService _cache;
    private readonly ILogger<UserLookupService> _logger;

    private static readonly TimeSpan UserTtl = TimeSpan.FromMinutes(5);

    // Key format: v1:user:{id}  |  v1:user_summary:{id}
    private static string UserKey(Guid id) => $"v1:user:{id}";
    private static string UserSummaryKey(Guid id) => $"v1:user_summary:{id}";

    public UserLookupService(
        ApexDbContext context,
        ICacheService cache,
        ILogger<UserLookupService> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => _cache.GetOrSetAsync<UserDto?>(
            UserKey(userId),
            ct => FetchUserAsync(userId, ct),
            UserTtl,
            cancellationToken);

    public Task<UserSummaryDto?> GetUserSummaryByIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => _cache.GetOrSetAsync<UserSummaryDto?>(
            UserSummaryKey(userId),
            ct => FetchUserSummaryAsync(userId, ct),
            UserTtl,
            cancellationToken);

    public async Task<Dictionary<Guid, UserDto>> GetUsersByIdsAsync(
        IEnumerable<Guid> userIds,
        CancellationToken cancellationToken = default)
    {
        var distinctIds = userIds.Distinct().ToList();
        if (distinctIds.Count == 0) return new Dictionary<Guid, UserDto>();

        var result = new Dictionary<Guid, UserDto>(distinctIds.Count);
        var uncachedIds = new List<Guid>();

        // Check cache for each ID individually
        foreach (var id in distinctIds)
        {
            var cached = await _cache.GetAsync<UserDto>(UserKey(id), cancellationToken);
            if (cached is not null)
                result[id] = cached;
            else
                uncachedIds.Add(id);
        }

        // Single batch query for all uncached IDs
        if (uncachedIds.Count > 0)
        {
            var users = await _context.Users
                .AsNoTracking()
                .Where(u => uncachedIds.Contains(u.Id))
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email ?? string.Empty,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    IsActive = u.IsActive
                })
                .ToListAsync(cancellationToken);

            foreach (var user in users)
            {
                result[user.Id] = user;
                await _cache.SetAsync(UserKey(user.Id), user, UserTtl, cancellationToken);
            }
        }

        return result;
    }

    public async Task<Dictionary<Guid, UserSummaryDto>> GetUserSummariesByIdsAsync(
        IEnumerable<Guid> userIds,
        CancellationToken cancellationToken = default)
    {
        var distinctIds = userIds.Distinct().ToList();
        if (distinctIds.Count == 0) return new Dictionary<Guid, UserSummaryDto>();

        var result = new Dictionary<Guid, UserSummaryDto>(distinctIds.Count);
        var uncachedIds = new List<Guid>();

        foreach (var id in distinctIds)
        {
            var cached = await _cache.GetAsync<UserSummaryDto>(UserSummaryKey(id), cancellationToken);
            if (cached is not null)
                result[id] = cached;
            else
                uncachedIds.Add(id);
        }

        if (uncachedIds.Count > 0)
        {
            var summaries = await _context.Users
                .AsNoTracking()
                .Where(u => uncachedIds.Contains(u.Id))
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    FullName = $"{u.FirstName} {u.LastName}".Trim(),
                    Email = u.Email ?? string.Empty
                })
                .ToListAsync(cancellationToken);

            foreach (var summary in summaries)
            {
                result[summary.Id] = summary;
                await _cache.SetAsync(UserSummaryKey(summary.Id), summary, UserTtl, cancellationToken);
            }
        }

        return result;
    }

    // -------------------------------------------------------------------------
    // Private DB fetchers (used as factories by GetOrSetAsync)
    // -------------------------------------------------------------------------

    private async Task<UserDto?> FetchUserAsync(Guid userId, CancellationToken ct)
        => await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                FirstName = u.FirstName,
                LastName = u.LastName,
                IsActive = u.IsActive
            })
            .FirstOrDefaultAsync(ct);

    private async Task<UserSummaryDto?> FetchUserSummaryAsync(Guid userId, CancellationToken ct)
        => await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserSummaryDto
            {
                Id = u.Id,
                FullName = $"{u.FirstName} {u.LastName}".Trim(),
                Email = u.Email ?? string.Empty
            })
            .FirstOrDefaultAsync(ct);
}
