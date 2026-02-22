using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apex.API.Infrastructure.Migrations;

  /// <inheritdoc />
  public partial class InitialCreate : Migration
  {
      /// <inheritdoc />
      protected override void Up(MigrationBuilder migrationBuilder)
      {
          migrationBuilder.EnsureSchema(
              name: "shared");

          migrationBuilder.CreateTable(
              name: "ChangeRequests",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                  Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                  ChangeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  RiskLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  ImpactAssessment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                  RollbackPlan = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                  AffectedSystems = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                  ScheduledStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ScheduledEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ActualStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ActualEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ChangeWindow = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                  RequiresCABApproval = table.Column<bool>(type: "bit", nullable: false),
                  CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  ReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  ApprovedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  ReviewNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                  ApprovalNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                  DenialReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                  ImplementationNotes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                  RollbackReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  SubmittedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ReviewStartedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  DeniedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  FailedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  RolledBackDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_ChangeRequests", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "Departments",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                  Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                  DepartmentManagerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  LastModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_Departments", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "ProjectRequests",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                  Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                  BusinessJustification = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                  Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  AssignedToUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  ReviewedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  ApprovedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  ConvertedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  SubmittedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ReviewStartedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  DeniedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ConvertedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  LastModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ReviewNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                  ApprovalNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                  DenialReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                  ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                  ProposedStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ProposedEndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_ProjectRequests", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "Projects",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                  Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                  Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  ProjectRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Budget = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                  StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ActualStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  ActualEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  ProjectManagerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  LastModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_Projects", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "Roles",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                  IsSystemRole = table.Column<bool>(type: "bit", nullable: false),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                  NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                  ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_Roles", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "Tasks",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                  Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                  ImplementationNotes = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: true),
                  ResolutionNotes = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: true),
                  Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  AssignedToUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  AssignedToDepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  AssignedToDepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  StartedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  CompletedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  EstimatedHours = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                  ActualHours = table.Column<decimal>(type: "decimal(8,2)", nullable: false, defaultValue: 0m),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  StartedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  LastModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  BlockedReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                  BlockedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_Tasks", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "Tenants",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                  Subdomain = table.Column<string>(type: "nvarchar(63)", maxLength: 63, nullable: false),
                  SchemaName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                  Tier = table.Column<int>(type: "int", nullable: false),
                  Status = table.Column<int>(type: "int", nullable: false),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  TrialEndsDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  LastModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  IsActive = table.Column<bool>(type: "bit", nullable: false),
                  MaxUsers = table.Column<int>(type: "int", nullable: false),
                  MaxRequestsPerMonth = table.Column<int>(type: "int", nullable: false),
                  MaxStorageGB = table.Column<int>(type: "int", nullable: false),
                  Region = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_Tenants", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "Users",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                  LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                  IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                  ProfileImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                  TimeZone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  LastModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  LastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                  NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                  Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                  NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                  EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                  PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                  TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                  LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                  LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                  AccessFailedCount = table.Column<int>(type: "int", nullable: false)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_Users", x => x.Id);
              });

          migrationBuilder.CreateTable(
              name: "RoleClaims",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<int>(type: "int", nullable: false)
                      .Annotation("SqlServer:Identity", "1, 1"),
                  RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_RoleClaims", x => x.Id);
                  table.ForeignKey(
                      name: "FK_RoleClaims_Roles_RoleId",
                      column: x => x.RoleId,
                      principalSchema: "shared",
                      principalTable: "Roles",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
              });

          migrationBuilder.CreateTable(
              name: "TaskActivityLogs",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  ActivityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                  Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                  Details = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                  UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                  TaskId2 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_TaskActivityLogs", x => x.Id);
                  table.ForeignKey(
                      name: "FK_TaskActivityLogs_Tasks_TaskId",
                      column: x => x.TaskId,
                      principalSchema: "shared",
                      principalTable: "Tasks",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
                  table.ForeignKey(
                      name: "FK_TaskActivityLogs_Tasks_TaskId2",
                      column: x => x.TaskId2,
                      principalSchema: "shared",
                      principalTable: "Tasks",
                      principalColumn: "Id");
              });

          migrationBuilder.CreateTable(
              name: "TaskChecklistItems",
              columns: table => new
              {
                  Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  TaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                  IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                  Order = table.Column<int>(type: "int", nullable: false),
                  CompletedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                  CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                  CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                  TaskId2 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_TaskChecklistItems", x => x.Id);
                  table.ForeignKey(
                      name: "FK_TaskChecklistItems_Tasks_TaskId",
                      column: x => x.TaskId,
                      principalSchema: "shared",
                      principalTable: "Tasks",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
                  table.ForeignKey(
                      name: "FK_TaskChecklistItems_Tasks_TaskId2",
                      column: x => x.TaskId2,
                      principalSchema: "shared",
                      principalTable: "Tasks",
                      principalColumn: "Id");
              });

          migrationBuilder.CreateTable(
              name: "UserClaims",
              schema: "shared",
              columns: table => new
              {
                  Id = table.Column<int>(type: "int", nullable: false)
                      .Annotation("SqlServer:Identity", "1, 1"),
                  UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_UserClaims", x => x.Id);
                  table.ForeignKey(
                      name: "FK_UserClaims_Users_UserId",
                      column: x => x.UserId,
                      principalSchema: "shared",
                      principalTable: "Users",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
              });

          migrationBuilder.CreateTable(
              name: "UserLogins",
              schema: "shared",
              columns: table => new
              {
                  LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                  ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                  ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                  UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_UserLogins", x => new { x.LoginProvider, x.ProviderKey });
                  table.ForeignKey(
                      name: "FK_UserLogins_Users_UserId",
                      column: x => x.UserId,
                      principalSchema: "shared",
                      principalTable: "Users",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
              });

          migrationBuilder.CreateTable(
              name: "UserRoles",
              schema: "shared",
              columns: table => new
              {
                  UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                  table.ForeignKey(
                      name: "FK_UserRoles_Roles_RoleId",
                      column: x => x.RoleId,
                      principalSchema: "shared",
                      principalTable: "Roles",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
                  table.ForeignKey(
                      name: "FK_UserRoles_Users_UserId",
                      column: x => x.UserId,
                      principalSchema: "shared",
                      principalTable: "Users",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
              });

          migrationBuilder.CreateTable(
              name: "UserTokens",
              schema: "shared",
              columns: table => new
              {
                  UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                  LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                  Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                  Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
              },
              constraints: table =>
              {
                  table.PrimaryKey("PK_UserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                  table.ForeignKey(
                      name: "FK_UserTokens_Users_UserId",
                      column: x => x.UserId,
                      principalSchema: "shared",
                      principalTable: "Users",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
              });

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_ChangeType",
              schema: "shared",
              table: "ChangeRequests",
              column: "ChangeType");

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_CreatedByUserId",
              schema: "shared",
              table: "ChangeRequests",
              column: "CreatedByUserId");

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_ProjectId",
              schema: "shared",
              table: "ChangeRequests",
              column: "ProjectId");

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_RiskLevel",
              schema: "shared",
              table: "ChangeRequests",
              column: "RiskLevel");

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_ScheduledStartDate",
              schema: "shared",
              table: "ChangeRequests",
              column: "ScheduledStartDate");

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_Status",
              schema: "shared",
              table: "ChangeRequests",
              column: "Status");

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_TenantId",
              schema: "shared",
              table: "ChangeRequests",
              column: "TenantId");

          migrationBuilder.CreateIndex(
              name: "IX_ChangeRequests_TenantId_Status",
              schema: "shared",
              table: "ChangeRequests",
              columns: new[] { "TenantId", "Status" });

          migrationBuilder.CreateIndex(
              name: "IX_Departments_DepartmentManagerUserId",
              schema: "shared",
              table: "Departments",
              column: "DepartmentManagerUserId",
              filter: "[DepartmentManagerUserId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Departments_TenantId",
              schema: "shared",
              table: "Departments",
              column: "TenantId");

          migrationBuilder.CreateIndex(
              name: "IX_Departments_TenantId_IsActive",
              schema: "shared",
              table: "Departments",
              columns: new[] { "TenantId", "IsActive" });

          migrationBuilder.CreateIndex(
              name: "IX_Departments_TenantId_Name",
              schema: "shared",
              table: "Departments",
              columns: new[] { "TenantId", "Name" },
              unique: true);

          migrationBuilder.CreateIndex(
              name: "IX_ProjectRequests_AssignedToUserId",
              schema: "shared",
              table: "ProjectRequests",
              column: "AssignedToUserId",
              filter: "[AssignedToUserId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_ProjectRequests_ProjectId",
              schema: "shared",
              table: "ProjectRequests",
              column: "ProjectId",
              filter: "[ProjectId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_ProjectRequests_TenantId",
              schema: "shared",
              table: "ProjectRequests",
              column: "TenantId");

          migrationBuilder.CreateIndex(
              name: "IX_ProjectRequests_TenantId_Status",
              schema: "shared",
              table: "ProjectRequests",
              columns: new[] { "TenantId", "Status" });

          migrationBuilder.CreateIndex(
              name: "IX_Projects_ProjectManagerUserId",
              schema: "shared",
              table: "Projects",
              column: "ProjectManagerUserId",
              filter: "[ProjectManagerUserId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Projects_ProjectRequestId",
              schema: "shared",
              table: "Projects",
              column: "ProjectRequestId");

          migrationBuilder.CreateIndex(
              name: "IX_Projects_TenantId",
              schema: "shared",
              table: "Projects",
              column: "TenantId");

          migrationBuilder.CreateIndex(
              name: "IX_Projects_TenantId_Status",
              schema: "shared",
              table: "Projects",
              columns: new[] { "TenantId", "Status" });

          migrationBuilder.CreateIndex(
              name: "IX_RoleClaims_RoleId",
              schema: "shared",
              table: "RoleClaims",
              column: "RoleId");

          migrationBuilder.CreateIndex(
              name: "IX_Roles_TenantId",
              schema: "shared",
              table: "Roles",
              column: "TenantId");

          migrationBuilder.CreateIndex(
              name: "IX_Roles_TenantId_Name",
              schema: "shared",
              table: "Roles",
              columns: new[] { "TenantId", "Name" },
              unique: true,
              filter: "[Name] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "RoleNameIndex",
              schema: "shared",
              table: "Roles",
              column: "NormalizedName",
              unique: true,
              filter: "[NormalizedName] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_TaskActivityLogs_TaskId",
              table: "TaskActivityLogs",
              column: "TaskId");

          migrationBuilder.CreateIndex(
              name: "IX_TaskActivityLogs_TaskId2",
              table: "TaskActivityLogs",
              column: "TaskId2");

          migrationBuilder.CreateIndex(
              name: "IX_TaskActivityLogs_Timestamp",
              table: "TaskActivityLogs",
              column: "Timestamp");

          migrationBuilder.CreateIndex(
              name: "IX_TaskChecklistItems_TaskId",
              table: "TaskChecklistItems",
              column: "TaskId");

          migrationBuilder.CreateIndex(
              name: "IX_TaskChecklistItems_TaskId2",
              table: "TaskChecklistItems",
              column: "TaskId2");

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_AssignedToDepartmentId",
              schema: "shared",
              table: "Tasks",
              column: "AssignedToDepartmentId",
              filter: "[AssignedToDepartmentId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_AssignedToDepartmentId_Status",
              schema: "shared",
              table: "Tasks",
              columns: new[] { "AssignedToDepartmentId", "Status" },
              filter: "[AssignedToDepartmentId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_AssignedToUserId",
              schema: "shared",
              table: "Tasks",
              column: "AssignedToUserId",
              filter: "[AssignedToUserId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_CompletedByUserId",
              schema: "shared",
              table: "Tasks",
              column: "CompletedByUserId",
              filter: "[CompletedByUserId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_ProjectId",
              schema: "shared",
              table: "Tasks",
              column: "ProjectId");

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_ProjectId_Status",
              schema: "shared",
              table: "Tasks",
              columns: new[] { "ProjectId", "Status" });

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_StartedByUserId",
              schema: "shared",
              table: "Tasks",
              column: "StartedByUserId",
              filter: "[StartedByUserId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Tasks_TenantId",
              schema: "shared",
              table: "Tasks",
              column: "TenantId");

          migrationBuilder.CreateIndex(
              name: "IX_Tenants_Subdomain",
              schema: "shared",
              table: "Tenants",
              column: "Subdomain",
              unique: true);

          migrationBuilder.CreateIndex(
              name: "IX_UserClaims_UserId",
              schema: "shared",
              table: "UserClaims",
              column: "UserId");

          migrationBuilder.CreateIndex(
              name: "IX_UserLogins_UserId",
              schema: "shared",
              table: "UserLogins",
              column: "UserId");

          migrationBuilder.CreateIndex(
              name: "IX_UserRoles_RoleId",
              schema: "shared",
              table: "UserRoles",
              column: "RoleId");

          migrationBuilder.CreateIndex(
              name: "EmailIndex",
              schema: "shared",
              table: "Users",
              column: "NormalizedEmail");

          migrationBuilder.CreateIndex(
              name: "IX_Users_DepartmentId",
              schema: "shared",
              table: "Users",
              column: "DepartmentId",
              filter: "[DepartmentId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "IX_Users_IsActive",
              schema: "shared",
              table: "Users",
              column: "IsActive");

          migrationBuilder.CreateIndex(
              name: "IX_Users_TenantId",
              schema: "shared",
              table: "Users",
              column: "TenantId");

          migrationBuilder.CreateIndex(
              name: "IX_Users_TenantId_DepartmentId",
              schema: "shared",
              table: "Users",
              columns: new[] { "TenantId", "DepartmentId" },
              filter: "[DepartmentId] IS NOT NULL");

          migrationBuilder.CreateIndex(
              name: "UserNameIndex",
              schema: "shared",
              table: "Users",
              column: "NormalizedUserName",
              unique: true,
              filter: "[NormalizedUserName] IS NOT NULL");
      }

      /// <inheritdoc />
      protected override void Down(MigrationBuilder migrationBuilder)
      {
          migrationBuilder.DropTable(
              name: "ChangeRequests",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "Departments",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "ProjectRequests",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "Projects",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "RoleClaims",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "TaskActivityLogs");

          migrationBuilder.DropTable(
              name: "TaskChecklistItems");

          migrationBuilder.DropTable(
              name: "Tenants",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "UserClaims",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "UserLogins",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "UserRoles",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "UserTokens",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "Tasks",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "Roles",
              schema: "shared");

          migrationBuilder.DropTable(
              name: "Users",
              schema: "shared");
      }
  }
