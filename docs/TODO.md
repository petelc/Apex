# APEX Project TODO

> Generated: February 2026
> Based on: Solution Architecture Document v3.1 + full codebase analysis

---

## Priority 1 — Blockers (End-to-End Functionality)

### Backend API

- [ ] **Tests: Write domain entity unit tests**
  All three test projects are empty placeholders. Start with domain aggregate tests (no infrastructure needed) — `ChangeRequest`, `Task`, `Project`, `ProjectRequest`.
  _Location: `ApexAPI/tests/Apex.API.UnitTests/`_

- [ ] **Tests: Write handler unit tests**
  Use the existing `NoOpMediator` pattern. Cover the most critical handlers: CreateChangeRequest, ApproveChangeRequest, CompleteTask, ConvertProjectRequestToProject.
  _Location: `ApexAPI/tests/Apex.API.UnitTests/`_

- [ ] **Tests: Write integration tests for critical API flows**
  Cover the change request approval workflow and project request conversion end-to-end.
  _Location: `ApexAPI/tests/Apex.API.IntegrationTests/`_

- [ ] **Delete Change Request endpoint**
  Frontend calls `DELETE /change-requests/{id}` — no backend endpoint exists.
  _Location: `ApexAPI/src/Apex.API.Web/Endpoints/ChangeRequests/`_

---

### Frontend App

- [ ] **Admin route protection**
  `/admin/users` and `/admin/departments` are unprotected. Add `hasRole('TenantAdmin')` checks via `ProtectedRoute` or inline redirect.
  _Location: `ApexApp/src/App.tsx`_

- [ ] **Remove debug `console.log` statements**
  - `ApexApp/src/pages/Tasks.tsx` line 65
  - `ApexApp/src/pages/ProjectDetail.tsx` line 85
  - `ApexApp/src/api/projectRequests.ts` line 20

---

## Priority 2 — Cleanup (Technical Debt)

### Frontend App

- [ ] **Delete unused backup/variant page files**
  These are not routed and create confusion:
  - `src/pages/Dashboard_Old.tsx`
  - `src/pages/Dashboard_Enhanced.tsx`
  - `src/pages/Login_Dark.tsx`
  - `src/pages/Login_Original.tsx`
  - `src/pages/ProjectDetail-old.tsx`
  - `src/pages/ChangeRequestsList.tsx` (not in routing)

- [ ] **Delete unused backup layout files**
  - `src/components/layout/AppLayout_Dark.tsx`
  - `src/components/layout/AppLayout_Original.tsx`

- [ ] **Implement or remove Notifications icon**
  `AppLayout` renders a `NotificationsIcon` with no handler. Either wire it to a notification system or remove it until that feature is built.
  _Location: `ApexApp/src/components/layout/AppLayout.tsx`_

- [ ] **Resolve `ChangeRequestsList.tsx` page**
  Exists as a standalone page but is not referenced in routing. Determine if it replaces `ChangeRequests.tsx` or can be deleted.

---

### Backend API

- [ ] **Remove diagnostic/debug endpoints before production**
  The following endpoints are dev-only and should be removed or gated behind a dev environment check:
  - `DiagnosticUserLookupEndpoint`
  - `DiagnosticGetUsersByRoleEndpoint`
  - `TestUserLookupEndpoint`
  _Location: `ApexAPI/src/Apex.API.Web/Endpoints/Users/`_

---

## Priority 3 — Features In Progress

### Frontend–Backend Integration

- [ ] **Dashboard: Replace mock data with live API**
  `Dashboard_Enhanced.tsx` and `Dashboard_Old.tsx` use hardcoded stats. The primary `Dashboard.tsx` calls the real API — confirm it's the active route and stat cards are fully wired.
  _Endpoint: `GET /api/dashboard/stats`_

- [ ] **Change Analytics page: Wire to real API**
  `ChangeAnalytics.tsx` has 4 chart components. Verify all four report endpoints are connected:
  - `GET /api/reports/change-metrics`
  - `GET /api/reports/success-rate`
  - `GET /api/reports/monthly-trends`
  - `GET /api/reports/top-affected-systems`

- [ ] **Profile Picture Upload**
  `ProfilePictureUpload.tsx` component exists but the backend `POST /users/me/profile-picture` endpoint needs Azure Blob Storage wired up.
  _Backend location: `ApexAPI/src/Apex.API.Web/Endpoints/Users/UploadProfilePictureEndpoint.cs`_

- [ ] **User Role Manager**
  `admin/UserRoleManager.tsx` component exists — verify it is correctly routed and wired to `GET /api/admin/roles`, `POST /api/admin/users/{id}/roles`, `DELETE /api/admin/users/{id}/roles/{role}`.

---

## Priority 4 — New Features (Planned)

### Deployment Management
_(Listed in architecture doc as "Planned — not yet started")_

- [ ] **DeploymentRequest aggregate** — Core domain model
- [ ] **DeploymentRequest use cases** — Create, Submit, Approve, Schedule, Execute, Complete
- [ ] **DeploymentRequest endpoints** — Full CRUD + workflow
- [ ] **Deployment Management UI** — List, detail, create form, approval workflow

### Advanced Reporting

- [ ] **Project analytics page** — Success rates, timelines, budget tracking
- [ ] **Task analytics page** — Completion rates by department, overdue trends
- [ ] **Export to CSV/PDF** — For change request and project reports

### Notifications

- [ ] **In-app notification system** — Wire the `NotificationsIcon` in AppLayout to a notification feed
- [ ] **SignalR real-time updates** — Live status changes for change requests and tasks

### Audit Trail

- [ ] **Audit trail viewer UI** — Surface the `TaskActivityLog` data already stored in the backend
- [ ] **Change request history tab** — Timeline of all state transitions with user attribution

---

## Priority 5 — Marketing Site (`Apex/`)

The homepage is complete. All inner pages are linked but do not exist yet.

- [ ] `/features` — Feature breakdown page
- [ ] `/pricing` — Full pricing page (tiers, FAQ, comparison table)
- [ ] `/contact` — Contact form (wire to email service)
- [ ] `/about` — Company/team page
- [ ] `/blog` — Blog index + post template
- [ ] `/signup` — Signup flow (connects to tenant creation API)
- [ ] `/security` — Security details page
- [ ] `/privacy` — Privacy policy
- [ ] `/terms` — Terms of service
- [ ] `/docs` — Documentation index
- [ ] **Dashboard screenshot/mockup** — Hero section has a placeholder grid; replace with a real screenshot or polished mockup
- [ ] **Demo video** — "Watch Demo" button in Hero links nowhere
- [ ] **Contact form backend** — Wire form submission to email service

---

## Priority 6 — Infrastructure & DevOps

- [ ] **CI/CD pipeline** — GitHub Actions: build, test, publish, deploy to Azure
- [ ] **Azure resources** — App Service, Azure SQL, Redis, Application Insights, Key Vault, Blob Storage
- [ ] **Environment configuration** — Staging vs Production appsettings, secrets via Key Vault
- [ ] **Redis caching** — `IDistributedCache` integration for hot-path queries (user lookups, dashboard stats)
- [ ] **EF Core migrations strategy** — Document migration workflow for team; current `InitialCreate` migration covers full schema
- [ ] **Swagger disabled in production** — Confirm `app.Environment.IsDevelopment()` gate is in place
- [ ] **CORS locked down for production** — Remove `localhost` origins from production CORS policy

---

## Completed ✅

- [x] Clean Architecture structure (Core → UseCases → Infrastructure → Web)
- [x] All core domain aggregates (ChangeRequest, Task, Project, ProjectRequest, Department, Tenant, User)
- [x] Full Change Request workflow with 11 states + domain events + email notifications
- [x] Hangfire background jobs (auto-start, reminders, overdue detection)
- [x] Multi-tenant isolation (schema-per-tenant, JWT claim extraction)
- [x] ASP.NET Core Identity with JWT + refresh tokens
- [x] Database seeder (roles + admin user)
- [x] All FastEndpoints wired (60+ endpoints)
- [x] Frontend: Authentication flow (login, forgot password, reset password)
- [x] Frontend: Dashboard with live stats
- [x] Frontend: Full Change Request UI (list, create, detail, all workflow actions, analytics)
- [x] Frontend: Full Task UI (kanban, detail, checklist, time log, assign, timeline)
- [x] Frontend: Project Request UI (list, create, detail, approval workflow)
- [x] Frontend: Projects UI (list, detail, status actions)
- [x] Frontend: Admin User Management (list, create, edit, roles, department assignment)
- [x] Frontend: Department CRUD UI
- [x] Frontend: User profile (edit, password change)
- [x] Department Update/Delete/GetUsers endpoints (added Feb 2026)
- [x] Marketing site homepage (Next.js 16 + Tailwind, 9 sections, fully animated)
- [x] Frontend–Backend API contract mismatches resolved