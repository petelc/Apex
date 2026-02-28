using FastEndpoints;
using FastEndpoints.Swagger;
using Apex.API.Infrastructure;
using Apex.API.Infrastructure.Data;
using Apex.API.Web.Configurations;
using Hangfire;
using Apex.API.Web.Infrastructure;
using Apex.API.Web.Hubs;
using Apex.API.Infrastructure.Jobs;
using Apex.API.Core.Interfaces;
using Apex.API.UseCases.Users.Interfaces;
using Apex.API.Infrastructure.Services;
using Apex.API.UseCases.Common.Interfaces;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults()
       .AddLoggerConfigs();

// CORS: origins are environment-specific — set in appsettings.Development.json / appsettings.Production.json.
// The base appsettings.json has no origins, so production never accidentally allows localhost.
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
    options.AddPolicy("HangfirePolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

using var loggerFactory = LoggerFactory.Create(config => config.AddConsole());
var startupLogger = loggerFactory.CreateLogger<Program>();

startupLogger.LogInformation("Starting web host");

builder.Services.AddOptionConfigs(builder.Configuration, startupLogger, builder);

// Add Infrastructure (DbContext, Repositories, MediatR, Identity, JWT, etc.)
builder.Services.AddInfrastructure(builder.Configuration);

// SignalR — built into ASP.NET Core, no NuGet package required
builder.Services.AddSignalR();

// Register the Web-side notification hub adapter (wraps IHubContext<NotificationHub>)
builder.Services.AddScoped<INotificationHubService, NotificationHubService>();

// Add Authorization services
builder.Services.AddAuthorization();

// Add FastEndpoints with Swagger configuration
builder.Services.AddFastEndpoints()
    .SwaggerDocument(o =>
    {
        o.ShortSchemaNames = true;

        o.DocumentSettings = settings =>
        {
            settings.Title = "APEX Multi-Tenant API";
            settings.Version = "v1";
            settings.Description = "A production-ready multi-tenant SaaS platform with authentication";

            settings.PostProcess = document =>
            {
                document.Servers.Clear();

                document.Servers.Add(new NSwag.OpenApiServer
                {
                    Url = "https://acme.localhost:5000",
                    Description = "Acme Tenant"
                });

                document.Servers.Add(new NSwag.OpenApiServer
                {
                    Url = "https://localhost:5000",
                    Description = "No Tenant"
                });
            };
        };
    });

// Add Memory Cache (if not already added)
builder.Services.AddMemoryCache();

// Register User Lookup Service
builder.Services.AddScoped<IUserLookupService, UserLookupService>();

// register Dashboard Service
builder.Services.AddScoped<IDashboardService, DashboardService>();

var app = builder.Build();

// ✅ SEED DATABASE (roles, etc.)
await DatabaseSeeder.SeedAsync(app.Services);



// ✅ IMPORTANT: Use CORS before Authentication/Authorization
app.UseCors();
app.UseCors("HangfirePolicy");

// Authentication & Authorization BEFORE endpoints
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

// FastEndpoints middleware
app.UseFastEndpoints(config =>
{
    config.Endpoints.RoutePrefix = "api";
    config.Serializer.Options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// Swagger UI (only in development)
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerGen(uiConfig: c =>
    {
        c.ConfigureDefaults();
        c.PersistAuthorization = true;
    });
}

// Hangfire Dashboard
var hangfireEnabled = app.Configuration.GetValue<bool>("Hangfire:Enabled");
if (hangfireEnabled)
{
    var dashboardPath = app.Configuration.GetValue<string>("Hangfire:DashboardPath") ?? "/hangfire";

    app.UseHangfireDashboard(dashboardPath, new DashboardOptions
    {
        Authorization = new[] { new HangfireAuthorizationFilter() }
    });

    using (var scope = app.Services.CreateScope())
    {
        var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();

        // Auto-start changes - runs every 5 minutes
        recurringJobManager.AddOrUpdate<AutoStartChangeJob>(
            "auto-start-changes",
            job => job.CheckAndStartScheduledChanges(),
            "*/5 * * * *", // Every 5 minutes
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });

        // 24-hour reminders - runs every 15 minutes
        recurringJobManager.AddOrUpdate<ChangeReminderJob>(
            "change-reminders-24h",
            job => job.SendReminders24HoursBefore(),
            "*/15 * * * *", // Every 15 minutes
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });

        // 1-hour reminders - runs every 15 minutes
        recurringJobManager.AddOrUpdate<ChangeReminderJob>(
            "change-reminders-1h",
            job => job.SendReminders1HourBefore(),
            "*/15 * * * *", // Every 15 minutes
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });

        // Check for overdue changes - runs every hour
        recurringJobManager.AddOrUpdate<OverdueChangesJob>(
            "check-overdue-changes",
            job => job.CheckOverdueChanges(),
            "0 * * * *", // Every hour at minute 0
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });

        app.Logger.LogInformation("✅ Registered {Count} recurring background jobs", 4);
    }
}

app.MapDefaultEndpoints();

// SignalR hub — clients connect to /hubs/notifications?access_token=<jwt>
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();

public partial class Program { }
