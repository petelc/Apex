# APEX Project TODO

> Generated: February 2026
> Based on: Solution Architecture Document v3.1 + full codebase analysis

---

## Priority 1 — Blockers (End-to-End Functionality) ✅

### Backend API

- [x] **Tests: Write domain entity unit tests** — 120 tests (ChangeRequest, Task, Project, ProjectRequest aggregates)
- [x] **Tests: Write handler unit tests** — 24 handler tests (CreateChangeRequest, ApproveProjectRequest, CompleteTask)
- [x] **Tests: Write integration tests for critical API flows** — 14 integration tests (ChangeRequest + ProjectRequest workflows, handler→repo→DB roundtrips)
- [x] **Delete Change Request endpoint** — `DELETE /change-requests/{id}` added, delegates to `CancelChangeRequestCommand`

### Frontend App

- [x] **Admin route protection** — `/admin/users` and `/admin/departments` now require `TenantAdmin` role via `ProtectedRoute`
- [x] **Remove debug `console.log` statements** — Removed from 7 files (Tasks, ProjectDetail, ProjectRequestDetail, ChangeRequestDetail, TaskAssignmentActions, AssignProjectManagerDialog, projectRequests API)

---

## Priority 2 — Cleanup (Technical Debt) ✅

### Frontend App

- [x] **Delete unused backup/variant page files**
  - `src/pages/Dashboard_Old.tsx`
  - `src/pages/Dashboard_Enhanced.tsx`
  - `src/pages/Login_Dark.tsx`
  - `src/pages/Login_Original.tsx`
  - `src/pages/ProjectDetail-old.tsx`
  - `src/pages/ChangeRequestsList.tsx`

- [x] **Delete unused backup layout files**
  - `src/components/layout/AppLayout_Dark.tsx`
  - `src/components/layout/AppLayout_Original.tsx`

- [ ] **Implement or remove Notifications icon** _(deferred — keeping as placeholder)_
  _Location: `ApexApp/src/components/layout/AppLayout.tsx`_

### Backend API

- [x] **Remove diagnostic/debug endpoints**
  Deleted `DiagnosticUserLookupEndpoint`, `DiagnosticGetUsersByRoleEndpoint`, `TestUserLookupEndpoint` — all were `AllowAnonymous()` and exposed user data.

---

## Priority 3 — Features In Progress ✅

### Frontend–Backend Integration

- [x] **Dashboard: Replace mock data with live API**
  `Dashboard.tsx` is the active route, fully wired to `GET /dashboard/stats`. Was already complete.

- [x] **Change Analytics page: Wire to real API**
  All 4 endpoints wired via `changeRequestApi`. Was already complete.

- [x] **User Role Manager**
  `components/admin/UserRoleManager.tsx` wired to all 3 admin role endpoints. Fixed contract mismatch: `assignRole` was sending `{ role }` but backend expects `{ roleName }`. Deleted unused duplicate `pages/admin/UserRoleManager.tsx`.

- [ ] **Profile Picture Upload** _(blocked on infrastructure — deferred to Priority 6)_
  Backend endpoint functional with local filesystem. Azure Blob Storage wiring deferred until Azure infrastructure is provisioned.
  _Backend: `ApexAPI/src/Apex.API.Web/Endpoints/Users/UploadProfilePictureEndpoint.cs`_

---

## Priority 4 — New Features (Planned)

### Deployment Management ✅

- [x] **DeploymentRequest aggregate** — 10-state lifecycle, domain events, value objects (DeploymentRequestId, DeploymentRequestStatus, DeploymentEnvironment)
- [x] **DeploymentRequest use cases** — Create, List, GetById, Submit, Approve, Reject, Schedule, StartExecution, Complete, MarkFailed, Rollback, Cancel, Delete
- [x] **DeploymentRequest endpoints** — 13 endpoints, full CRUD + workflow, user name enrichment
- [x] **Deployment Management UI** — List page, detail page, create form (with project/CR dropdowns), all workflow action buttons

### Advanced Reporting

- [x] **Project analytics page** — KPI cards, status breakdown, duration metrics, priority breakdown. Backend: `GET /reports/project-metrics`. Frontend: `/project-analytics` route.
- [x] **Task analytics page** — KPI cards, status breakdown, time tracking, assignment distribution, priority breakdown. Backend: `GET /reports/task-metrics`. Frontend: `/task-analytics` route.
- [x] **Export to CSV** — Both analytics pages have CSV export via browser-native Blob download.

### Notifications ✅

- [x] **In-app notification system** — `Notification` entity, `INotificationService`, 4 REST endpoints (`GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/{id}/read`, `POST /notifications/read-all`). Bell icon in AppLayout wired to `NotificationDrawer`.
- [x] **SignalR real-time updates** — `NotificationHub` at `/hubs/notifications`, JWT auth via `access_token` query param. Handles domain events for CR (5), PR (3), DR (5) aggregates. Frontend `NotificationContext` manages the `HubConnection`.

### Audit Trail ✅

- [x] **Audit trail viewer UI** — Already implemented. `TaskDetail` has a Timeline tab wired to `GET /tasks/{id}/timeline`. Fixed `AllowAnonymous()` security bug — endpoint now requires authenticated roles.
- [x] **Change request history tab** — Already implemented. `ChangeRequestDetail` has a Timeline tab; `ChangeRequestTimeline.tsx` reconstructs the history from the CR's timestamp fields.

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