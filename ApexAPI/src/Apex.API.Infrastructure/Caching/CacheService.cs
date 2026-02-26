using System.Collections.Concurrent;
using System.Text.Json;
using Apex.API.Core.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace Apex.API.Infrastructure.Caching;

/// <summary>
/// Redis-backed cache service with:
///   - Stampede protection (per-key SemaphoreSlim, double-check locking)
///   - TTL jitter (±10%) to spread cache expiry across the fleet
///   - Fail-fast budget (200 ms per Redis call)
///   - Graceful degradation — Redis failures never fail the request
/// </summary>
public sealed class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheService> _logger;

    // Per-key semaphores — keyed by cache key, bounded by the number of distinct keys
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

    // Maximum time we will wait for any single Redis call before degrading
    private static readonly TimeSpan RedisBudget = TimeSpan.FromMilliseconds(200);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    public async Task<T> GetOrSetAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        TimeSpan ttl,
        CancellationToken ct = default)
    {
        // 1. Fast path — check cache before acquiring the lock
        var hit = await TryGetFromCacheAsync<T>(key, ct);
        if (hit.Found) return hit.Value!;

        // 2. Acquire per-key lock to prevent concurrent factory calls (stampede protection)
        var semaphore = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await semaphore.WaitAsync(ct);
        try
        {
            // 3. Double-check after acquiring the lock — another thread may have populated it
            hit = await TryGetFromCacheAsync<T>(key, ct);
            if (hit.Found) return hit.Value!;

            // 4. Cache miss — call factory
            var value = await factory(ct);

            // 5. Write to cache — fire-and-forget style (don't fail the request on write error)
            await TrySetInCacheAsync(key, value, ttl, ct);

            return value;
        }
        finally
        {
            semaphore.Release();
        }
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        var result = await TryGetFromCacheAsync<T>(key, ct);
        return result.Value;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct = default)
        => await TrySetInCacheAsync(key, value, ttl, ct);

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        try
        {
            using var cts = BuildBudgetCts(ct);
            await _cache.RemoveAsync(key, cts.Token);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache remove failed for key {CacheKey}", key);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private async Task<(bool Found, T? Value)> TryGetFromCacheAsync<T>(string key, CancellationToken ct)
    {
        try
        {
            using var cts = BuildBudgetCts(ct);
            var raw = await _cache.GetStringAsync(key, cts.Token);
            if (raw is not null)
                return (true, JsonSerializer.Deserialize<T>(raw, JsonOptions));
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache read failed for key {CacheKey}, degrading to source", key);
        }

        return (false, default);
    }

    private async Task TrySetInCacheAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct)
    {
        try
        {
            var jitteredTtl = ApplyJitter(ttl);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = jitteredTtl
            };
            var serialized = JsonSerializer.Serialize(value, JsonOptions);

            using var cts = BuildBudgetCts(ct);
            await _cache.SetStringAsync(key, serialized, options, cts.Token);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache write failed for key {CacheKey}", key);
        }
    }

    private static CancellationTokenSource BuildBudgetCts(CancellationToken ct)
    {
        var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(RedisBudget);
        return cts;
    }

    /// <summary>Applies ±10% random jitter to <paramref name="ttl"/>.</summary>
    private static TimeSpan ApplyJitter(TimeSpan ttl)
    {
        var factor = 0.9 + Random.Shared.NextDouble() * 0.2; // [0.9, 1.1)
        return TimeSpan.FromTicks((long)(ttl.Ticks * factor));
    }
}
