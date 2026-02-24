using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apex.API.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDeploymentRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DeploymentRequests",
                schema: "shared",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Environment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AffectedSystems = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    RollbackPlan = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    DeploymentNotes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RollbackReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DeploymentWindow = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ScheduledStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ScheduledEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApprovedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChangeRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeployedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RolledBackDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeploymentRequests", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeploymentRequests_Environment",
                schema: "shared",
                table: "DeploymentRequests",
                column: "Environment");

            migrationBuilder.CreateIndex(
                name: "IX_DeploymentRequests_ScheduledStartDate",
                schema: "shared",
                table: "DeploymentRequests",
                column: "ScheduledStartDate");

            migrationBuilder.CreateIndex(
                name: "IX_DeploymentRequests_Status",
                schema: "shared",
                table: "DeploymentRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DeploymentRequests_TenantId",
                schema: "shared",
                table: "DeploymentRequests",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DeploymentRequests_TenantId_Status",
                schema: "shared",
                table: "DeploymentRequests",
                columns: new[] { "TenantId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeploymentRequests",
                schema: "shared");
        }
    }
}
