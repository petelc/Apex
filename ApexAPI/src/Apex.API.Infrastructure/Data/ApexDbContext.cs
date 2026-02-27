using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Traxs.SharedKernel;
using Apex.API.Core.Aggregates.TenantAggregate;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.Aggregates.ProjectRequestAggregate;
using Apex.API.Core.Aggregates.ProjectAggregate;
using Apex.API.Core.Aggregates.DepartmentAggregate;
using Apex.API.Core.Aggregates.ChangeRequestAggregate;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.Entities;
using Apex.API.Core.Interfaces;
using Apex.API.Core.ValueObjects;


namespace Apex.API.Infrastructure.Data;

/// <summary>
/// Main database context with multi-tenant support and Identity
/// </summary>
public class ApexDbContext : IdentityDbContext<User, Role, Guid>
{
    private readonly IDomainEventDispatcher? _dispatcher;
    private readonly ITenantContext? _tenantContext;

    public ApexDbContext(
        DbContextOptions<ApexDbContext> options,
        ITenantContext? tenantContext = null,
        IDomainEventDispatcher? dispatcher = null)
        : base(options)
    {
        _tenantContext = tenantContext;
        _dispatcher = dispatcher;
    }

    // Used by global query filters — evaluated per-query against the current DbContext instance.
    // Falls back to TenantId.Empty at design-time (migrations) where no HTTP context exists.
    private TenantId TenantIdFilter => _tenantContext?.CurrentTenantId ?? TenantId.Empty;
    private Guid TenantGuidFilter => _tenantContext?.CurrentTenantId.Value ?? Guid.Empty;

    // Aggregates
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<ProjectRequest> ProjectRequests => Set<ProjectRequest>(); // ✅ RENAMED
    public DbSet<Project> Projects => Set<Project>();  // ✅ NEW!
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Apex.API.Core.Aggregates.TaskAggregate.Task> Tasks => Set<Apex.API.Core.Aggregates.TaskAggregate.Task>();
    public DbSet<ChangeRequest> ChangeRequests => Set<ChangeRequest>();
    public DbSet<DeploymentRequest> DeploymentRequests => Set<DeploymentRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Important: Call base for Identity

        // ✅ IGNORE BASE CLASSES THAT AREN'T ENTITIES
        modelBuilder.Ignore<DomainEventBase>();
        modelBuilder.Ignore<EntityBase>();

        // Apply entity configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApexDbContext).Assembly);

        // Configure Identity tables to use shared schema
        modelBuilder.Entity<User>().ToTable("Users", "shared");
        modelBuilder.Entity<Role>().ToTable("Roles", "shared");
        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles", "shared");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims", "shared");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins", "shared");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens", "shared");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims", "shared");

        // ====================================================================
        // GLOBAL TENANT QUERY FILTERS
        // Every query against these entities automatically includes
        // WHERE TenantId = <currentTenantId> — no per-query filter needed.
        // Use .IgnoreQueryFilters() on a query when cross-tenant access is
        // intentional (e.g. admin reporting, background jobs).
        // ====================================================================
        modelBuilder.Entity<ChangeRequest>()
            .HasQueryFilter(cr => cr.TenantId == TenantIdFilter);

        modelBuilder.Entity<ProjectRequest>()
            .HasQueryFilter(r => r.TenantId == TenantIdFilter);

        modelBuilder.Entity<Project>()
            .HasQueryFilter(p => p.TenantId == TenantIdFilter);

        modelBuilder.Entity<Department>()
            .HasQueryFilter(d => d.TenantId == TenantIdFilter);

        modelBuilder.Entity<Apex.API.Core.Aggregates.TaskAggregate.Task>()
            .HasQueryFilter(t => t.TenantId == TenantIdFilter);

        modelBuilder.Entity<DeploymentRequest>()
            .HasQueryFilter(dr => dr.TenantId == TenantIdFilter);

        // Notification uses a plain Guid for TenantId (not a Vogen value object)
        modelBuilder.Entity<Notification>()
            .HasQueryFilter(n => n.TenantId == TenantGuidFilter);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Dispatch domain events before saving
        if (_dispatcher != null)
        {
            var entitiesWithEvents = ChangeTracker
                .Entries<IHasDomainEvents>()
                .Where(e => e.Entity.DomainEvents.Any())
                .Select(e => e.Entity)
                .ToList();

            await _dispatcher.DispatchAndClearEvents(entitiesWithEvents);
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
