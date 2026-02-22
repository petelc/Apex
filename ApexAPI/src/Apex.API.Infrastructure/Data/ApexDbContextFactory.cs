using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Apex.API.Infrastructure.Data;

public class ApexDbContextFactory : IDesignTimeDbContextFactory<ApexDbContext>
{
    public ApexDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Apex.API.Web"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not found in appsettings.json");

        var optionsBuilder = new DbContextOptionsBuilder<ApexDbContext>();
        optionsBuilder.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.MigrationsAssembly(typeof(ApexDbContext).Assembly.FullName);
        });

        return new ApexDbContext(optionsBuilder.Options);
    }
}
