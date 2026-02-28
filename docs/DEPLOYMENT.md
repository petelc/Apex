# Apex — Deployment Guide

> Written for developers, not infrastructure engineers.
> Last updated: February 2026

---

## The Three Apps

| App | Folder | What it is | Where it lives |
|---|---|---|---|
| Marketing site | `Apex/` | Next.js 16 (public-facing website) | Vercel |
| React app | `ApexApp/` | Vite SPA (the actual product) | Azure Static Web Apps |
| .NET API | `ApexAPI/` | ASP.NET Core 10 + FastEndpoints | Azure App Service |

Each app deploys independently. Changing a React component does not trigger an API redeploy.

---

## Domain Layout

Once DNS is configured, you'll have:

```
apex.io           →  Marketing site (Vercel)
app.apex.io       →  React app (Azure Static Web Apps)
api.apex.io       →  .NET API (Azure App Service)
```

Buy the domain from **Cloudflare Registrar** (at-cost pricing). Let Cloudflare manage your DNS — you'll add records Vercel and Azure give you during setup. DNS changes can take up to 48 hours but are usually live in under 10 minutes with Cloudflare.

---

## Azure Resources

Everything lives in one Azure **Resource Group** (think of it as a folder), e.g. `apex-prod`.

### 1. Azure SQL Database
Your primary database. EF Core migrations target this.

- **Tier:** General Purpose, Serverless, 2 vCores (auto-pauses when idle — cheap to start)
- **Cost:** ~$15–30/month depending on usage
- **After provisioning:** Copy the connection string — it goes into Key Vault

### 2. Azure Cache for Redis
Already wired in `CacheService`. Used for dashboard stats and user lookups.

- **Tier:** C1 Basic to start (upgrade to Standard when you have real traffic)
- **Cost:** ~$16/month
- **After provisioning:** Copy the connection string — it goes into Key Vault

### 3. Azure Key Vault
Stores all secrets. Your App Service reads from it automatically at startup using Managed Identity — no secrets in environment variables or config files.

Secrets to store in Key Vault:

| Secret Name | Value |
|---|---|
| `ConnectionStrings--DefaultConnection` | Azure SQL connection string |
| `Redis--ConnectionString` | Redis connection string |
| `JwtSettings--SecretKey` | A long random string (use a password manager to generate 64+ chars) |
| `Email--SendGridApiKey` | Your SendGrid API key |

- **Cost:** ~$0–2/month (essentially free at your scale)

### 4. Azure App Service
Where your .NET API runs. Use Linux hosting — it's faster and cheaper than Windows for .NET.

- **Tier:** B2 (2 vCore, 3.5 GB RAM) to start. Upgrade to P1v3 when you have customers.
- **Cost:** ~$35–55/month
- **Runtime:** .NET 10 (select this when creating — Azure supports it)
- **After provisioning:**
  - Enable **Managed Identity** (System assigned) — this lets it read Key Vault without a password
  - Add Key Vault access policy for the Managed Identity
  - Set `ASPNETCORE_ENVIRONMENT = Production` in Application Settings

### 5. Application Insights
Logs, traces, exceptions, and performance charts for the API. Connected to App Service in a few clicks.

- **Cost:** Free up to 5 GB/month of data. More than enough to start.
- **After provisioning:** Copy the `APPLICATIONINSIGHTS_CONNECTION_STRING` — add it to App Service Application Settings

### 6. Azure Blob Storage
Used for profile picture uploads (currently deferred in the codebase — backend endpoint is ready, frontend upload is wired once this is provisioned).

- **Create:** One storage account, one container named `profile-pictures`, set blob access to Private
- **Cost:** ~$0.02/GB (negligible to start)
- **After provisioning:** Copy the connection string — add it to Key Vault as `AzureStorage--ConnectionString`

### Monthly Cost Summary

| Resource | Estimated cost |
|---|---|
| Azure SQL (Serverless) | ~$15–30 |
| Redis Cache C1 | ~$16 |
| App Service B2 | ~$35–55 |
| Application Insights | Free (under 5 GB) |
| Key Vault | ~$1–2 |
| Blob Storage | ~$1–5 |
| **Total** | **~$70–110/month** |

This goes up when you add tenants and traffic, but it's a reasonable SaaS baseline.

---

## GitHub Actions Workflows

Four workflow files live in `.github/workflows/`. They are all path-filtered — only the relevant workflow triggers when you change that part of the codebase.

### `pr-checks.yml`
**Triggers:** Every pull request to `main`
**What it does:** Builds all three apps and runs .NET unit + integration tests in parallel. A failure blocks the PR from merging (enforce this in GitHub branch protection settings).

```
PR opened
  ├── api       → dotnet restore → build → unit tests → integration tests
  ├── app       → npm ci → npm run build (TypeScript + Vite)
  └── marketing → npm ci → npm run build (Next.js)
```

### `api-deploy.yml`
**Triggers:** Push to `main` when `ApexAPI/**` changes, or manual trigger
**What it does:** Builds the API, runs tests, publishes to Azure App Service.

```
Push to main (ApexAPI/** changed)
  └── Job 1: build-and-test
        → Restore (Web + UnitTests + IntegrationTests only — skips Aspire)
        → Build Release
        → Unit tests
        → Integration tests
        → Publish to ./api-publish/
        → Upload artifact
  └── Job 2: deploy (only runs if Job 1 passes)
        → Download artifact
        → Deploy to Azure App Service via publish profile
```

Aspire and Functional test projects are intentionally excluded — they require running infrastructure to execute.

### `app-deploy.yml`
**Triggers:** Push to `main` when `ApexApp/**` changes, or manual trigger
**What it does:** Builds the Vite SPA with production env vars injected, deploys to Azure Static Web Apps.

```
Push to main (ApexApp/** changed)
  → npm ci
  → npm run build (with VITE_API_URL=https://api.apex.io injected)
  → Deploy dist/ to Azure Static Web Apps
```

> **Important:** `VITE_API_URL` is baked into the JavaScript bundle at build time. In production the app calls the API directly at `https://api.apex.io` — not through the dev proxy. You must set this variable in GitHub (`Settings → Variables → Actions`).

### `marketing-deploy.yml`
**Triggers:** Push to `main` when `Apex/**` changes, or manual trigger
**What it does:** Builds the Next.js site and deploys to Vercel via CLI.

```
Push to main (Apex/** changed)
  → vercel pull (downloads env vars from Vercel)
  → vercel build --prod
  → vercel deploy --prebuilt --prod
```

> **Simpler alternative:** Connect Vercel directly to your GitHub repo in the Vercel dashboard. It auto-deploys on every push to `main` with zero configuration — you don't need this workflow at all if you do that.

---

## Secrets & Variables to Configure

Go to `GitHub → Settings → Secrets and variables → Actions` and add these:

### Secrets (encrypted, never shown after saving)

| Secret | How to get it |
|---|---|
| `AZURE_API_PUBLISH_PROFILE` | Azure Portal → App Service → Overview → "Download publish profile" → paste entire XML |
| `AZURE_STATIC_WEB_APPS_TOKEN` | Azure Portal → Static Web Apps → Manage deployment token |
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | vercel.com → Settings → General → "Your ID" |
| `VERCEL_PROJECT_ID` | vercel.com → Project Settings → General → "Project ID" |

### Variables (visible, not sensitive)

| Variable | Value |
|---|---|
| `AZURE_API_APP_NAME` | Your App Service name, e.g. `apex-api-prod` |
| `VITE_API_URL` | `https://api.apex.io` |

---

## First Deploy — Order to Do It

Follow this order to avoid chasing your tail:

1. **Buy the domain** on Cloudflare Registrar
2. **Create an Azure account** (Pay-As-You-Go — don't prepay)
3. **Provision Azure resources** — follow `docs/AZURE-SETUP-CHECKLIST.md` step by step
4. **Run EF Core migrations** from your local machine once to create the schema:
   ```bash
   dotnet ef database update \
     --project ApexAPI/src/Apex.API.Infrastructure \
     --startup-project ApexAPI/src/Apex.API.Web \
     --connection "<prod-connection-string>"
   ```
5. **Deploy the marketing site** first — connect Vercel to GitHub, add the domain, verify it works
6. **Deploy the React app** — connect Azure Static Web Apps to GitHub, add `app.apex.io`
7. **Add GitHub secrets/vars** for the API workflow
8. **Push a change to `ApexAPI/**`** to trigger the first API deploy, or use the manual trigger in GitHub Actions
9. **Verify** by hitting `https://api.apex.io/health` (or your health endpoint)
10. **Lock down branch protection** in GitHub so PRs require passing checks before merge

---

## Environment Configuration

### Local Development
`appsettings.Development.json` — connection strings for local SQL and Redis (via Orbstack or Docker), JWT secret, CORS set to localhost origins. `ApplyMigrationsOnStartup: true` so migrations auto-run on startup.

### Production
`appsettings.Production.json` — sets `ApplyMigrationsOnStartup: false` (never auto-migrate in prod), CORS set to `https://app.apex.io` only. All secrets come from Key Vault, not this file.

```
Local Dev                              Production
─────────────────────────────          ─────────────────────────────
appsettings.Development.json           appsettings.Production.json
Orbstack SQL + Redis (local)           Azure SQL + Azure Redis
Migrations apply on startup            Migrations run manually (see MIGRATIONS.md)
CORS: localhost origins                CORS: https://app.apex.io only
Swagger UI: enabled                    Swagger UI: disabled
```

---

## EF Core Migrations

See `docs/MIGRATIONS.md` for the full runbook. Short version:

- **Dev:** Migrations apply automatically on startup (`ApplyMigrationsOnStartup: true`)
- **Production:** Run manually before deploying a new API version that has new migrations:
  ```bash
  dotnet ef database update \
    --project ApexAPI/src/Apex.API.Infrastructure \
    --startup-project ApexAPI/src/Apex.API.Web \
    --connection "<prod-connection-string>"
  ```
- **New migration:**
  ```bash
  dotnet ef migrations add <MigrationName> \
    --project ApexAPI/src/Apex.API.Infrastructure \
    --startup-project ApexAPI/src/Apex.API.Web
  ```

---

## SSL Certificates

You don't need to buy or manage SSL certificates. Both Azure and Vercel issue free Let's Encrypt certificates automatically when you add a custom domain. They renew automatically too.

---

## After You Have Paying Customers

These are the next infrastructure steps once you're live and generating revenue:

- **Scale App Service** from B2 → P1v3 (adds auto-scaling + SLA)
- **Scale Redis** from C1 Basic → C1 Standard (adds replication + SLA)
- **Scale SQL** from Serverless → provisioned vCores (predictable latency)
- **Enable Azure Backup** for the SQL database
- **Set up alerts** in Application Insights (CPU, error rate, response time thresholds)
- **Stripe integration** for subscription billing (not yet in the codebase)
