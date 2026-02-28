# Azure Setup Checklist

> Step-by-step provisioning guide. Written for developers new to Azure.
> Work through sections in order — later steps depend on earlier ones.
> Estimated time: 2–4 hours the first time.

---

## Before You Start

- [ ] Create an Azure account at **portal.azure.com** (free to create, pay-as-you-go billing)
- [ ] Install the Azure CLI: `brew install azure-cli` (Mac) or see [aka.ms/azurecli](https://aka.ms/azurecli)
- [ ] Log in: `az login` — opens a browser, sign in with your Azure account
- [ ] Choose a region. Pick the one closest to your users, e.g. `eastus`, `westeurope`, `australiaeast`
  - You'll use this same region for every resource below — keep them together to avoid cross-region data transfer costs

---

## Step 1 — Resource Group

A resource group is just a folder that holds all your Azure resources. Create one and everything else goes inside it.

**In the Azure Portal:**
1. Search "Resource groups" → Create
2. Name: `apex-prod`
3. Region: *(your chosen region)*
4. Review + Create → Create

**Or via CLI:**
```bash
az group create --name apex-prod --location eastus
```

- [ ] Resource group `apex-prod` created

---

## Step 2 — Azure SQL Database

1. Search "SQL databases" → Create
2. **Basics tab:**
   - Resource group: `apex-prod`
   - Database name: `ApexDb`
   - Server: Click "Create new"
     - Server name: `apex-sql-prod` (must be globally unique — Azure will tell you if it's taken)
     - Authentication: SQL authentication
     - Admin login: `apexadmin`
     - Password: *(generate a strong one, save it in your password manager)*
   - Compute + storage: Click "Configure database"
     - Change to **General Purpose → Serverless**
     - vCores: 2
     - Min vCores: 0.5 (auto-pauses after 1 hour idle — saves money)
   - Backup redundancy: Locally redundant (cheapest; upgrade later if needed)
3. **Networking tab:**
   - Allow Azure services to access this server: **Yes** (App Service needs this)
   - Add your current client IP so you can run migrations from your laptop
4. Review + Create → Create

**After it's created:**
1. Go to the database → Connection strings → ADO.NET tab
2. Copy the connection string, replace `{your_password}` with the actual password
3. Save it — you'll add it to Key Vault in Step 5

- [ ] SQL Server `apex-sql-prod` created
- [ ] Database `ApexDb` created
- [ ] Connection string copied and saved securely

---

## Step 3 — Azure Cache for Redis

1. Search "Azure Cache for Redis" → Create
2. **Basics tab:**
   - Resource group: `apex-prod`
   - DNS name: `apex-redis-prod` (globally unique)
   - Location: *(same region)*
   - Cache type: **C1 Basic** (~$16/mo to start)
3. Review + Create → Create
4. *(Takes 5–15 minutes to provision)*

**After it's created:**
1. Go to the cache → Settings → Access keys
2. Copy the **Primary connection string** (StackExchange.Redis format)
   - It looks like: `apex-redis-prod.redis.cache.windows.net:6380,password=...,ssl=True,abortConnect=False`
3. Save it — you'll add it to Key Vault in Step 5

- [ ] Redis cache `apex-redis-prod` created
- [ ] Primary connection string copied and saved securely

---

## Step 4 — Azure App Service

This is where your .NET API runs.

1. Search "App Services" → Create → Web App
2. **Basics tab:**
   - Resource group: `apex-prod`
   - Name: `apex-api-prod` (this becomes your default URL: `apex-api-prod.azurewebsites.net`)
   - Publish: **Code**
   - Runtime stack: **.NET 10**
   - Operating System: **Linux** (cheaper and faster than Windows for .NET)
   - Region: *(same region)*
   - Pricing plan: Click "Create new" → **B2** (2 vCore, 3.5 GB)
3. Review + Create → Create

**After it's created:**

### Enable Managed Identity
This lets the App Service authenticate to Key Vault without any passwords.
1. App Service → Settings → Identity
2. System assigned tab → Status: **On** → Save
3. Copy the **Object (principal) ID** — you'll need it for Key Vault

### Configure Application Settings
App Service → Settings → Environment variables → App settings → Add:

| Name | Value |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | *(add after Step 6 — Application Insights)* |

*(Connection strings and secrets will come from Key Vault — you'll wire that up in Step 5)*

### Download the Publish Profile
You'll paste this into GitHub as a secret later.
1. App Service → Overview → Download publish profile
2. Save the downloaded `.PublishSettings` file — open it in a text editor, copy the entire XML content

- [ ] App Service `apex-api-prod` created (.NET 10, Linux)
- [ ] Managed Identity enabled, Object ID copied
- [ ] Application settings: `ASPNETCORE_ENVIRONMENT = Production`
- [ ] Publish profile downloaded

---

## Step 5 — Azure Key Vault

Key Vault stores all your secrets. The App Service reads them automatically at startup using its Managed Identity — nothing sensitive in your config files or environment variables.

### Create the Key Vault
1. Search "Key vaults" → Create
2. **Basics tab:**
   - Resource group: `apex-prod`
   - Name: `apex-kv-prod` (globally unique)
   - Region: *(same region)*
   - Pricing tier: Standard
3. Review + Create → Create

### Give the App Service Access to Key Vault
1. Key vault → Access control (IAM) → Add → Add role assignment
2. Role: **Key Vault Secrets User**
3. Assign access to: **Managed identity**
4. Select: your App Service (`apex-api-prod`)
5. Review + assign

### Add Your Secrets
Key vault → Objects → Secrets → Generate/Import for each:

| Secret name | Value |
|---|---|
| `ConnectionStrings--DefaultConnection` | Your Azure SQL connection string |
| `Redis--ConnectionString` | Your Redis connection string |
| `JwtSettings--SecretKey` | A random 64+ character string (use a password generator) |
| `Email--SendGridApiKey` | Your SendGrid API key |
| `AzureStorage--ConnectionString` | *(add after Step 7 — Blob Storage)* |

> **Note on naming:** Azure Key Vault doesn't support `:` in secret names. ASP.NET Core's Key Vault provider maps `--` to `:` automatically, so `ConnectionStrings--DefaultConnection` in Key Vault becomes `ConnectionStrings:DefaultConnection` in your app config.

### Wire Key Vault to the App Service
1. App Service → Settings → Environment variables → Add app setting:

| Name | Value |
|---|---|
| `AZURE_KEY_VAULT_URL` | `https://apex-kv-prod.vault.azure.net/` |

Your API is already configured to use Key Vault via Managed Identity when this env var is set.

> If your `Program.cs` doesn't yet have Key Vault configuration, see the "Wiring Key Vault" section at the bottom of this document.

- [ ] Key Vault `apex-kv-prod` created
- [ ] App Service granted "Key Vault Secrets User" role
- [ ] All secrets added to Key Vault
- [ ] `AZURE_KEY_VAULT_URL` added to App Service settings

---

## Step 6 — Application Insights

1. Search "Application Insights" → Create
2. **Basics tab:**
   - Resource group: `apex-prod`
   - Name: `apex-insights-prod`
   - Region: *(same region)*
   - Resource mode: Workspace-based *(keep default)*
3. Review + Create → Create

**After it's created:**
1. Application Insights → Overview → Connection String (copy it — starts with `InstrumentationKey=...`)
2. App Service → Settings → Environment variables → App settings:
   - Add: `APPLICATIONINSIGHTS_CONNECTION_STRING` = *(paste the connection string)*

- [ ] Application Insights `apex-insights-prod` created
- [ ] Connection string added to App Service settings

---

## Step 7 — Azure Blob Storage

Used for profile picture uploads.

1. Search "Storage accounts" → Create
2. **Basics tab:**
   - Resource group: `apex-prod`
   - Storage account name: `apexstorageprod` (lowercase, no hyphens, globally unique)
   - Region: *(same region)*
   - Redundancy: Locally redundant storage (LRS) — cheapest
3. Review + Create → Create

**After it's created:**
1. Storage account → Data storage → Containers → + Container
   - Name: `profile-pictures`
   - Public access level: **Private** (no anonymous access)
2. Storage account → Security + networking → Access keys
3. Copy the **Connection string** from key1
4. Add it to Key Vault as `AzureStorage--ConnectionString`

- [ ] Storage account `apexstorageprod` created
- [ ] Container `profile-pictures` created (private)
- [ ] Connection string added to Key Vault

---

## Step 8 — Custom Domain & DNS

### Buy the Domain
1. Go to **cloudflare.com** → Register a domain
2. Search for `apex.io` (or your actual domain name)
3. Purchase it — Cloudflare charges at-cost (~$10–15/year for `.io`)
4. Cloudflare becomes your DNS provider automatically

### Add DNS Records for the API
1. Azure Portal → App Service (`apex-api-prod`) → Settings → Custom domains
2. Click "+ Add custom domain"
3. Enter: `api.apex.io`
4. Azure will give you a **CNAME record** and a **TXT verification record** to add to DNS
5. Go to Cloudflare → your domain → DNS → Add those records
6. Back in Azure → Verify → Add custom domain

### SSL Certificate for the API
1. App Service → Settings → Custom domains → TLS/SSL settings
2. Click "Add binding" next to `api.apex.io`
3. Select "Create App Service Managed Certificate" (free, auto-renews)

### Add DNS Records for the React App
1. Azure Portal → Static Web Apps → Custom domains
2. Click "+ Add"
3. Enter: `app.apex.io`
4. Azure gives you a CNAME or TXT record to add in Cloudflare
5. Add it in Cloudflare → verify in Azure
6. Azure Static Web Apps provisions SSL automatically

### Add DNS Records for the Marketing Site (Vercel)
1. vercel.com → your project → Settings → Domains → Add Domain
2. Enter: `apex.io`
3. Vercel gives you the DNS records to add (usually an A record + CNAME)
4. Add them in Cloudflare
5. Vercel provisions SSL automatically

- [ ] Domain purchased on Cloudflare
- [ ] `api.apex.io` → Azure App Service (CNAME + SSL)
- [ ] `app.apex.io` → Azure Static Web Apps (CNAME + SSL)
- [ ] `apex.io` → Vercel (A record + CNAME + SSL)
- [ ] DNS verified and live (test with `curl https://api.apex.io/health`)

---

## Step 9 — Run First Production Migration

Do this once before the first API deploy. Your local machine needs a connection to Azure SQL (you allowed your IP in Step 2).

```bash
cd ApexAPI

dotnet ef database update \
  --project src/Apex.API.Infrastructure \
  --startup-project src/Apex.API.Web \
  --connection "Server=apex-sql-prod.database.windows.net;Database=ApexDb;User Id=apexadmin;Password=<your-password>;TrustServerCertificate=False;Encrypt=True;"
```

After this, every future migration gets applied the same way before deploying new API code that requires it.

- [ ] EF Core migrations applied to production SQL database

---

## Step 10 — GitHub Actions Secrets & Variables

Go to your GitHub repo → **Settings → Secrets and variables → Actions**

### Secrets tab (click "New repository secret" for each)

| Secret name | How to get it |
|---|---|
| `AZURE_API_PUBLISH_PROFILE` | Content of the `.PublishSettings` file from Step 4 (entire XML) |
| `AZURE_STATIC_WEB_APPS_TOKEN` | Azure Portal → Static Web Apps → Overview → Manage deployment token |
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create (Scope: Full Account) |
| `VERCEL_ORG_ID` | vercel.com → Settings → General → "Your ID" |
| `VERCEL_PROJECT_ID` | vercel.com → your project → Settings → General → "Project ID" |

### Variables tab (click "New repository variable" for each)

| Variable name | Value |
|---|---|
| `AZURE_API_APP_NAME` | `apex-api-prod` |
| `VITE_API_URL` | `https://api.apex.io` |

- [ ] All 5 secrets added
- [ ] Both variables added

---

## Step 11 — Deploy & Verify

### React App (Azure Static Web Apps)
In the Azure Portal when creating the Static Web Apps resource, it will ask you to connect your GitHub repo. This auto-generates a workflow file in `.github/workflows/`. If you're using the one in this repo instead, skip the auto-generated file (or delete it).

```bash
# Manual trigger from the GitHub Actions tab, or push a change to ApexApp/**
```

Visit `https://app.apex.io` → should show your login page

### Marketing Site (Vercel)
Option A (easiest): Connect Vercel to GitHub in the Vercel dashboard → auto-deploys on push.
Option B: Push a change to `Apex/**` → triggers `marketing-deploy.yml`

Visit `https://apex.io` → should show the marketing homepage

### API
Push a change to `ApexAPI/**` or manually trigger `api-deploy.yml` from the GitHub Actions tab.

```bash
# Quick health check
curl https://api.apex.io/health
```

- [ ] React app live at `https://app.apex.io`
- [ ] Marketing site live at `https://apex.io`
- [ ] API responding at `https://api.apex.io`
- [ ] Login with `admin@acme.com` works end-to-end

---

## Step 12 — GitHub Branch Protection (optional but recommended)

Enforce that PRs must pass checks before merging:

1. GitHub → Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Check: **Require status checks to pass before merging**
4. Search for and add: `API — Build & Test`, `App — TypeScript & Build`, `Marketing — TypeScript & Build`
5. Check: **Require a pull request before merging**
6. Save changes

- [ ] Branch protection configured on `main`

---

## Wiring Key Vault in `Program.cs`

If your `Program.cs` doesn't already use Key Vault, add this before `builder.Build()`:

```csharp
var keyVaultUrl = builder.Configuration["AZURE_KEY_VAULT_URL"];
if (!string.IsNullOrEmpty(keyVaultUrl))
{
    builder.Configuration.AddAzureKeyVault(
        new Uri(keyVaultUrl),
        new DefaultAzureCredential()); // Uses Managed Identity in Azure, dev credentials locally
}
```

And add the NuGet packages:
```bash
dotnet add ApexAPI/src/Apex.API.Web package Azure.Extensions.AspNetCore.Configuration.Secrets
dotnet add ApexAPI/src/Apex.API.Web package Azure.Identity
```

> `DefaultAzureCredential` automatically uses Managed Identity in Azure. Locally, it falls back to your `az login` credentials, so you can test Key Vault access from your machine without any code changes.

---

## Quick Reference — Resource Names

| Resource | Name |
|---|---|
| Resource Group | `apex-prod` |
| SQL Server | `apex-sql-prod` |
| SQL Database | `ApexDb` |
| Redis Cache | `apex-redis-prod` |
| App Service | `apex-api-prod` |
| Key Vault | `apex-kv-prod` |
| Application Insights | `apex-insights-prod` |
| Storage Account | `apexstorageprod` |
| Blob Container | `profile-pictures` |

---

## When Things Go Wrong

**API deploy fails:**
- Check the GitHub Actions log for the exact error
- Check App Service → Monitoring → Log stream for startup errors
- Check Application Insights → Failures for exception details

**App can't reach the API (CORS errors):**
- Confirm `ASPNETCORE_ENVIRONMENT = Production` is set in App Service settings
- Confirm `appsettings.Production.json` has `https://app.apex.io` in `AllowedOrigins`
- Confirm the API is responding: `curl https://api.apex.io/health`

**Login fails in production:**
- Check Key Vault: confirm `JwtSettings--SecretKey` secret exists and has a value
- Check App Service → Environment variables → confirm `AZURE_KEY_VAULT_URL` is set

**Database connection errors:**
- Confirm App Service's outbound IP is allowed in SQL firewall
  - App Service → Properties → Outbound IP addresses → copy all IPs
  - SQL Server → Networking → Firewall rules → add each IP
- Or: turn on "Allow Azure services" in SQL networking (simpler, slightly less secure)
