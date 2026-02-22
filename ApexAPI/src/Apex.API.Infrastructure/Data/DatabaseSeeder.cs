using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Apex.API.Core.Aggregates.UserAggregate;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Infrastructure.Data;

/// <summary>
/// Seeds initial data including system roles and the default admin user
/// </summary>
public static class DatabaseSeeder
{
    // Dev-only seed admin — override via environment variables in production
    private const string SeedAdminEmail = "admin@acme.com";
    private const string SeedAdminPassword = "SecureAdminPass123!";
    private const string SeedAdminFirstName = "System";
    private const string SeedAdminLastName = "Admin";

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Role>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger("DatabaseSeeder");

        logger.LogInformation("Starting database seeding...");

        await SeedRolesAsync(roleManager, logger);
        await SeedAdminUserAsync(userManager, logger);

        logger.LogInformation("Database seeding completed.");
    }

    private static async Task SeedRolesAsync(RoleManager<Role> roleManager, ILogger logger)
    {
        // System roles to seed
        var systemRoles = new[]
        {
            (Role.SystemRoles.TenantAdmin, "Administrator with full access to tenant", true),
            (Role.SystemRoles.User, "Standard user with basic access", true),
            (Role.SystemRoles.Manager, "Manager with elevated privileges", true),
            (Role.SystemRoles.ReadOnly, "Read-only access user", true)
        };

        foreach (var (roleName, description, isSystemRole) in systemRoles)
        {
            // Check if role exists (check by normalized name to handle any tenant)
            var existingRole = await roleManager.FindByNameAsync(roleName);

            if (existingRole == null)
            {
                // Create role for "system" tenant (shared roles)
                var role = Role.Create(
                    TenantId.From(Guid.Empty), // System tenant ID
                    roleName,
                    description,
                    isSystemRole);

                var result = await roleManager.CreateAsync(role);

                if (result.Succeeded)
                {
                    logger.LogInformation("Created system role: {RoleName}", roleName);
                }
                else
                {
                    logger.LogError(
                        "Failed to create role {RoleName}: {Errors}",
                        roleName,
                        string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                logger.LogInformation("Role {RoleName} already exists", roleName);
            }
        }
    }

    private static async Task SeedAdminUserAsync(UserManager<User> userManager, ILogger logger)
    {
        var adminEmail = Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL") ?? SeedAdminEmail;

        var existing = await userManager.FindByEmailAsync(adminEmail);
        if (existing != null)
        {
            // Ensure TenantAdmin role is assigned even if user already exists
            if (!await userManager.IsInRoleAsync(existing, Role.SystemRoles.TenantAdmin))
            {
                var addResult = await userManager.AddToRoleAsync(existing, Role.SystemRoles.TenantAdmin);
                if (addResult.Succeeded)
                    logger.LogInformation("Assigned TenantAdmin role to existing admin user: {Email}", adminEmail);
                else
                    logger.LogWarning("Could not assign TenantAdmin role to {Email}: {Errors}",
                        adminEmail, string.Join(", ", addResult.Errors.Select(e => e.Description)));
            }
            else
            {
                logger.LogInformation("Admin user already exists with TenantAdmin role: {Email}", adminEmail);
            }
            return;
        }

        var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? SeedAdminPassword;

        var admin = User.Create(
            TenantId.From(Guid.Empty),
            adminEmail,
            SeedAdminFirstName,
            SeedAdminLastName,
            phoneNumber: null,
            timeZone: null);

        var createResult = await userManager.CreateAsync(admin, adminPassword);
        if (!createResult.Succeeded)
        {
            logger.LogError("Failed to seed admin user: {Errors}",
                string.Join(", ", createResult.Errors.Select(e => e.Description)));
            return;
        }

        var roleResult = await userManager.AddToRoleAsync(admin, Role.SystemRoles.TenantAdmin);
        if (roleResult.Succeeded)
            logger.LogInformation("Seeded admin user with TenantAdmin role: {Email}", adminEmail);
        else
            logger.LogWarning("Admin user created but TenantAdmin role failed: {Errors}",
                string.Join(", ", roleResult.Errors.Select(e => e.Description)));
    }
}