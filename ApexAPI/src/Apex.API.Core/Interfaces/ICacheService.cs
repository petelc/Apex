namespace Apex.API.Core.Interfaces;

/// <summary>
/// Distributed cache abstraction with stampede protection, TTL jitter, and fail-fast semantics.
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Returns the cached value for <paramref name="key"/>, or calls <paramref name="factory"/>,
    /// caches the result, and returns it. Only one concurrent factory call per key is allowed
    /// (stampede protection). Redis failures degrade gracefully to calling the factory directly.
    /// </summary>
    Task<T> GetOrSetAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        TimeSpan ttl,
        CancellationToken ct = default);

    /// <summary>
    /// Returns the cached value, or <c>default</c> on miss or Redis failure.
    /// </summary>
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);

    /// <summary>
    /// Writes a value to the cache with TTL jitter applied.
    /// Swallows Redis failures (non-critical write path).
    /// </summary>
    Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct = default);

    /// <summary>
    /// Removes a key from the cache. Swallows Redis failures.
    /// </summary>
    Task RemoveAsync(string key, CancellationToken ct = default);
}