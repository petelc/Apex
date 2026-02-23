using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Apex.API.Core.Aggregates.DeploymentRequestAggregate;
using Apex.API.Core.ValueObjects;

namespace Apex.API.Infrastructure.Data.Config;

/// <summary>
/// EF Core configuration for DeploymentRequest aggregate
/// </summary>
public class DeploymentRequestConfiguration : IEntityTypeConfiguration<DeploymentRequest>
{
    public void Configure(EntityTypeBuilder<DeploymentRequest> builder)
    {
        builder.ToTable("DeploymentRequests", "shared");

        // Primary key
        builder.HasKey(dr => dr.Id);

        builder.Property(dr => dr.Id)
            .HasConversion(
                id => id.Value,
                value => DeploymentRequestId.From(value))
            .ValueGeneratedNever();

        builder.Property(dr => dr.TenantId)
            .HasConversion(
                id => id.Value,
                value => TenantId.From(value))
            .IsRequired();

        // Required fields
        builder.Property(dr => dr.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(dr => dr.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(dr => dr.AffectedSystems)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(dr => dr.RollbackPlan)
            .IsRequired()
            .HasMaxLength(2000);

        // Enums stored as strings
        builder.Property(dr => dr.Status)
            .HasConversion(
                s => s.Name,
                name => DeploymentRequestStatus.FromName(name, false))
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(dr => dr.Priority)
            .HasConversion(
                p => p.Name,
                name => RequestPriority.FromName(name, false))
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(dr => dr.RiskLevel)
            .HasConversion(
                rl => rl.Name,
                name => RiskLevel.FromName(name, false))
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(dr => dr.Environment)
            .HasConversion(
                e => e.Name,
                name => DeploymentEnvironment.FromName(name, false))
            .IsRequired()
            .HasMaxLength(50);

        // Optional fields
        builder.Property(dr => dr.DeploymentWindow)
            .HasMaxLength(100);

        builder.Property(dr => dr.DeploymentNotes)
            .HasMaxLength(4000);

        builder.Property(dr => dr.ApprovalNotes)
            .HasMaxLength(2000);

        builder.Property(dr => dr.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(dr => dr.FailureReason)
            .HasMaxLength(1000);

        builder.Property(dr => dr.RollbackReason)
            .HasMaxLength(1000);

        // User IDs
        builder.Property(dr => dr.CreatedByUserId)
            .IsRequired();

        builder.Property(dr => dr.ApprovedByUserId);
        builder.Property(dr => dr.ProjectId);
        builder.Property(dr => dr.ChangeRequestId);

        // Dates
        builder.Property(dr => dr.CreatedDate)
            .IsRequired();

        builder.Property(dr => dr.SubmittedDate);
        builder.Property(dr => dr.ApprovedDate);
        builder.Property(dr => dr.RejectedDate);
        builder.Property(dr => dr.ScheduledDate);
        builder.Property(dr => dr.ScheduledStartDate);
        builder.Property(dr => dr.ScheduledEndDate);
        builder.Property(dr => dr.ActualStartDate);
        builder.Property(dr => dr.ActualEndDate);
        builder.Property(dr => dr.StartedDate);
        builder.Property(dr => dr.DeployedDate);
        builder.Property(dr => dr.FailedDate);
        builder.Property(dr => dr.RolledBackDate);

        // Indexes for common queries
        builder.HasIndex(dr => dr.TenantId);
        builder.HasIndex(dr => dr.Status);
        builder.HasIndex(dr => dr.Environment);
        builder.HasIndex(dr => dr.ScheduledStartDate);
        builder.HasIndex(dr => new { dr.TenantId, dr.Status });

        // Ignore navigation properties (domain events)
        builder.Ignore(dr => dr.DomainEvents);
    }
}
