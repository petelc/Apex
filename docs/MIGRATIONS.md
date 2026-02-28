# EF Core Migrations — Runbook

## Current Migrations

| Migration | Date | Description |
|---|---|---|
| `InitialCreate` | 2026-02-22 | Full schema: all core aggregates, Identity tables, shared schema |
| `AddDeploymentRequests` | 2026-02-24 | `DeploymentRequests` table + indexes |
| `AddNotifications` | 2026-02-24 | `Notifications` table + TenantId/UserId indexes |

Migration files live in:
```
ApexAPI/src/Apex.API.Infrastructure/Migrations/
```

The `ApexDbContext` is the sole migration target. Migrations assembly is `Apex.API.Infrastructure`.

---

## Dev Workflow

### Apply pending migrations (dev)

`appsettings.Development.json` sets `Database:ApplyMigrationsOnStartup: true`, so the API auto-migrates on startup during local development. No manual step needed.

### Add a new migration

From the repo root:

```bash
cd ApexAPI
dotnet ef migrations add <MigrationName> \
  --project src/Apex.API.Infrastructure \
  --startup-project src/Apex.API.Web
```

**Naming conventions:**
- Describe the change, not the date: `AddProjectTags`, `RenameStatusColumn`, `AddAuditLog`
- Use PascalCase
- Never edit a migration that has already been applied to any shared environment

### Preview SQL before applying

```bash
dotnet ef migrations script <FromMigration> <ToMigration> \
  --project src/Apex.API.Infrastructure \
  --startup-project src/Apex.API.Web \
  --output migration.sql
```

Omit `<FromMigration>` to script from the beginning. Review `migration.sql` before applying to staging/prod.

### Apply manually (staging / prod)

`appsettings.Production.json` sets `Database:ApplyMigrationsOnStartup: false`. Migrations **never run automatically in production**.

Apply using the EF Core bundle or `dotnet ef`:

```bash
# Option A — dotnet ef (requires SDK on the deploy machine / CI runner)
dotnet ef database update \
  --project src/Apex.API.Infrastructure \
  --startup-project src/Apex.API.Web \
  --connection "<prod-connection-string>"

# Option B — generate an idempotent SQL script and run it through your DB tool
dotnet ef migrations script --idempotent \
  --project src/Apex.API.Infrastructure \
  --startup-project src/Apex.API.Web \
  --output deploy.sql
# Then: sqlcmd -S <server> -d ApexDb -i deploy.sql  (or SSMS, Azure portal, etc.)
```

The `--idempotent` flag wraps each migration in an existence check, making the script safe to re-run.

---

## Rollback

EF Core generates a `Down()` method for every migration. Use it only in dev/staging — **never roll back in production** unless coordinated with the team.

```bash
# Roll back to a specific migration (all later ones are undone)
dotnet ef database update <TargetMigration> \
  --project src/Apex.API.Infrastructure \
  --startup-project src/Apex.API.Web

# Remove the last unapplied migration (only safe if not yet applied to any DB)
dotnet ef migrations remove \
  --project src/Apex.API.Infrastructure \
  --startup-project src/Apex.API.Web
```

For production rollbacks, prefer a forward-only fix migration over running `Down()`.

---

## Multi-Tenant Schema Notes

- Identity tables (`Users`, `Roles`, `UserRoles`, etc.) live in the **`shared`** schema.
- Tenant-scoped tables (ChangeRequests, Projects, etc.) live in the **`dbo`** schema (default).
- Global query filters on `ApexDbContext` scope all tenant-data queries automatically. No migration-level change needed when adding a new tenant-scoped aggregate — just add `HasQueryFilter` in `OnModelCreating`.

---

## Design-Time Context

`ApexDbContextFactory` (`Data/ApexDbContextFactory.cs`) provides EF tooling with a `DbContext` instance at design time (when no HTTP context exists). It reads `ConnectionStrings:DefaultConnection` from `appsettings.Development.json`.

If you add a new constructor dependency to `ApexDbContext`, update the factory as well.

---

## CI / CD Checklist

Before merging a PR that contains a new migration:

- [ ] `dotnet build` passes with no errors
- [ ] `dotnet ef migrations script --idempotent` produces valid SQL (spot-check)
- [ ] No data-destructive operations (column drops, type changes) without a data-migration step
- [ ] Migration reviewed by a second developer if it touches shared/Identity tables
- [ ] Staging DB updated and smoke-tested before production deploy
