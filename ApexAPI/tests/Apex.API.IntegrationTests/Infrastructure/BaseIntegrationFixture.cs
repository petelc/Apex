using Microsoft.EntityFrameworkCore;

namespace Apex.API.IntegrationTests.Infrastructure;

/// <summary>
/// Base for integration tests that need a real EF Core database.
/// Uses InMemory provider — each test class gets an isolated database.
/// Dispatcher is intentionally null so domain events are not published
/// during tests (events are covered by unit tests).
/// </summary>
public abstract class BaseIntegrationFixture : IDisposable
{
    private readonly string _databaseName = Guid.NewGuid().ToString();
    private bool _disposed;

    /// <summary>
    /// Creates a fresh <see cref="ApexDbContext"/> backed by an InMemory database.
    /// Call this inside each test to get a context pointing at the same
    /// isolated database without sharing EF change-tracker state.
    /// </summary>
    protected ApexDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApexDbContext>()
            .UseInMemoryDatabase(_databaseName)
            .Options;

        return new ApexDbContext(options, dispatcher: null);
    }

    /// <summary>
    /// Creates a repository backed by the given context.
    /// </summary>
    protected static EfRepository<T> CreateRepo<T>(ApexDbContext ctx)
        where T : class, IAggregateRoot =>
        new(ctx);

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        // InMemory databases are automatically released when GC collects
        // the options/service-provider; nothing extra needed.
    }
}