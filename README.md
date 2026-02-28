# APEX Platform Monorepo

![Monorepo](https://img.shields.io/badge/repo-monorepo-2F855A) ![Backend](https://img.shields.io/badge/backend-.NET%2010-512BD4) ![Frontend](https://img.shields.io/badge/frontend-React%2019-61DAFB) ![UI](https://img.shields.io/badge/ui-Material%20UI%20v7-007FFF)

This repository contains the two main application projects that make up APEX:

- **ApexAPI**: .NET 10 backend API using FastEndpoints, Clean Architecture, and multi-tenant patterns.
- **ApexApp**: React 19 + TypeScript frontend using Material UI and Vite.

Together, they provide an end-to-end SaaS workflow for authentication, dashboarding, project requests, projects, tasks, and related administrative features.

## Audience and Scope

- **Audience:** Full-stack developers, backend/API engineers, frontend engineers, and DevOps contributors working on APEX.
- **Scope:** Monorepo-level orientation, startup order, local environment setup, smoke checks, and links to project-specific documentation.
- **Use this README when:** You need to run or understand the full stack across `ApexAPI` and `ApexApp`.

---

## Repository Layout

```text
Apex/
├── ApexAPI/   # Backend API (.NET 10, FastEndpoints, EF Core)
└── ApexApp/   # Frontend UI (React 19, TypeScript, MUI, Vite)
```

---

## ApexAPI (Backend)

### Highlights

- Multi-tenant architecture with tenant-aware processing
- FastEndpoints-based HTTP API
- Clean Architecture style separation across Core / UseCases / Infrastructure / Web
- EF Core for persistence
- Test projects for unit, integration, functional, and Aspire-based scenarios

### Key Backend Folders

```text
ApexAPI/src/
├── Apex.API.Core/            # Domain models, value objects, interfaces
├── Apex.API.UseCases/        # Application workflows and use cases
├── Apex.API.Infrastructure/  # Data access, identity, jobs, services
├── Apex.API.Web/             # API host, endpoints, configuration
└── Apex.API.AspireHost/      # Aspire orchestration host
```

---

## ApexApp (Frontend)

### Highlights

- React 19 + TypeScript application
- Material UI-based design system
- Auth flows with protected routing
- Feature areas for dashboard, change requests, projects, and tasks
- API client modules for backend integration

### Key Frontend Folders

```text
ApexApp/src/
├── api/          # HTTP client + API modules
├── components/   # Reusable and feature-specific UI components
├── contexts/     # App-level providers (auth/theme)
├── pages/        # Route-level screens
├── schemas/      # Validation schemas
├── theme/        # MUI theme definitions
├── types/        # TypeScript domain types
└── utils/        # Utilities
```

---

## Prerequisites

- .NET 10 SDK
- Node.js (LTS) + npm
- Docker Desktop (recommended for local database workflows)

---

## Quick Start

### 1) Run the API

```bash
cd ApexAPI
dotnet restore
dotnet run --project src/Apex.API.Web
```

### 2) Run the Frontend

```bash
cd ApexApp
npm install
npm run dev
```

By default, the frontend uses Vite and is configured to communicate with the backend API (direct URL and/or proxy setup depending on local configuration).

---

## Local Development Checklist

- [ ] **Start dependencies** (if required by your API profile), e.g. local database via Docker.
- [ ] **Start backend first** from `ApexAPI` and confirm API is reachable.
- [ ] **Set frontend API target** in `ApexApp/.env` when needed:

```bash
VITE_API_URL=https://acme.localhost:5000/api
```

- [ ] **Start frontend second** from `ApexApp` with `npm run dev`.
- [ ] **Verify app + API connectivity** by loading the UI and confirming authenticated requests succeed.

### Recommended Startup Order

1. Infrastructure/services (if needed)
2. API (`ApexAPI`)
3. Frontend (`ApexApp`)

### Common Local URLs

- Frontend (Vite): `http://localhost:3000`
- API (example): `https://acme.localhost:5000`

### Troubleshooting

- **CORS errors in browser console**
  - Ensure the API is running and frontend requests are targeting the expected origin.
  - If using `VITE_API_URL`, verify it points to your active API host.
  - If using Vite proxy, confirm calls use `/api/*` and proxy target matches the API URL.

- **HTTPS / certificate warnings on localhost**
  - Trust the local ASP.NET Core development certificate:

```bash
dotnet dev-certs https --trust
```

    - Restart browser and dev servers after trusting certs.

- **Frontend hitting wrong API host or port**
  - Check `ApexApp/.env` for `VITE_API_URL`.
  - Check `ApexApp/vite.config.ts` proxy target for `/api`.
  - Restart `npm run dev` after changing env or Vite config.

### Smoke Test (1-minute check)

1. Confirm API is responding using the host that matches your local setup:

```bash
curl -k https://acme.localhost:5000/swagger
curl -k https://localhost:5000/swagger
```

2. Open the frontend at `http://localhost:3000` and verify login page loads.
3. Sign in with a test account and verify the dashboard loads without network errors.

---

## Testing

### Backend

```bash
cd ApexAPI
dotnet test
```

### Frontend

```bash
cd ApexApp
npm run build
npm run lint
```

```bash
cd ApexTests
npm run tests:Headed
npm run test:ci
npm run test:report
npm run codegen
npm run test:auth
npm run test:cr
npm run test:project
npm run test:deployments
npm run test:admin
npm run test:dashboard
```

---

## Notes

- For backend-specific architecture and operational details, see `ApexAPI/README.md`.
- For frontend-specific workflows and UI details, see `ApexApp/README.md`.
- For Playwright-specific details, see `ApexTests/README.md`
