# Playwright E2E Test Suite — ApexApp

## Context
Create a standalone Playwright E2E test project at `Apex/ApexTests/` covering the full ApexApp UI with headed tests against the live API. Coverage: Auth+Dashboard, Change Requests (full lifecycle), Projects+Tasks, Deployments, Admin (Users+Departments).

---

## Key Facts (from codebase)
- App dev server: `http://localhost:3000` (Vite, `npm run dev` in ApexApp/)
- API: `https://acme.localhost:5000` — self-signed cert, proxied by Vite as `/api`
- Auth tokens: localStorage keys `apex_token` (JWT string) + `apex_user` (JSON UserInfo)
- Login endpoint: `POST /api/users/login` → `{ accessToken, user: { userId, email, roles, ... } }`
- Seeded admin: `admin@acme.com` / `SecureAdminPass123!`
- Login form selectors: `getByLabel('Email')`, `getByLabel('Password')`, `getByRole('button', { name: 'Sign In' })`
- Sidebar nav items: "Dashboard", "Project Requests", "Projects", "Change Requests", "Deployments"
- Most list pages use MUI DataGrid → `getByRole('row')` / `getByRole('cell')`
- Admin tables use standard `<Table>` → accessible role selectors
- Change Request form: 3-step MUI Stepper ("Basic Information" → "Impact & Risk" → "Review & Submit")
- Task board: Kanban columns "Not Started", "In Progress", "Blocked", "Completed"
- Toasts rendered via notistack → `.notistack-SnackbarContainer`

---

## Folder Structure

```
Apex/ApexTests/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .env                     # gitignored — copy from .env.example
├── .env.example
├── .gitignore
├── global-setup.ts          # logs in 3 roles via API, writes .auth/*.json storageState
├── .auth/                   # gitignored — generated auth state files
│   ├── admin.json
│   ├── manager.json
│   └── user.json
├── fixtures/
│   └── auth.fixture.ts      # typed fixtures: adminPage, managerPage, userPage
├── pages/                   # Page Object Models
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── ChangeRequestsPage.ts
│   ├── ChangeRequestDetailPage.ts
│   ├── CreateChangeRequestPage.ts
│   ├── ProjectsPage.ts
│   ├── ProjectDetailPage.ts
│   ├── TaskBoardPage.ts
│   ├── DeploymentRequestsPage.ts
│   ├── AdminUsersPage.ts
│   └── AdminDepartmentsPage.ts
├── utils/
│   └── api-helpers.ts       # Node fetch helpers for test data setup/teardown
└── tests/
    ├── auth/login.spec.ts
    ├── dashboard/dashboard.spec.ts
    ├── change-requests/change-requests.spec.ts
    ├── projects/projects.spec.ts
    ├── projects/tasks.spec.ts
    ├── deployments/deployment-requests.spec.ts
    └── admin/
        ├── users.spec.ts
        └── departments.spec.ts
```

---

## `package.json`
```json
{
  "name": "apex-tests",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ci": "CI=true playwright test",
    "test:report": "playwright show-report",
    "codegen": "playwright codegen http://localhost:3000",
    "test:auth": "playwright test tests/auth",
    "test:cr": "playwright test tests/change-requests",
    "test:projects": "playwright test tests/projects",
    "test:admin": "playwright test tests/admin"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@types/node": "^22.0.0",
    "typescript": "^5.3.0",
    "dotenv": "^16.4.0"
  }
}
```

---

## `playwright.config.ts` — Key Settings

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  globalSetup: './global-setup.ts',
  webServer: {
    command: 'npm run dev',
    cwd: '../ApexApp',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    headless: process.env.CI === 'true',   // headed by default in dev
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,               // self-signed cert on API
  },
  projects: [
    { name: 'chromium',         use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-admin',   use: { ...devices['Desktop Chrome'], storageState: '.auth/admin.json' } },
    { name: 'chromium-manager', use: { ...devices['Desktop Chrome'], storageState: '.auth/manager.json' } },
    { name: 'chromium-user',    use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' } },
    { name: 'firefox',          use: { ...devices['Desktop Firefox'], storageState: '.auth/admin.json' } },
    { name: 'webkit',           use: { ...devices['Desktop Safari'],  storageState: '.auth/admin.json' } },
  ],
});
```

Auth tests use `chromium` (no storageState). All other tests use `chromium-admin` (or role-specific project).

---

## `global-setup.ts`
Calls `POST /api/users/login` directly via Node `fetch` — no browser launched. Writes Playwright storageState JSON (pre-populated localStorage) for each role to `.auth/`.

```typescript
async function loginAndSave(email: string, password: string, outputPath: string) {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { accessToken, user } = await res.json();
  fs.writeFileSync(outputPath, JSON.stringify({
    cookies: [],
    origins: [{ origin: BASE_URL, localStorage: [
      { name: 'apex_token', value: accessToken },
      { name: 'apex_user', value: JSON.stringify(user) },
    ]}],
  }));
}
```

---

## `fixtures/auth.fixture.ts`
Extends base `test` with `adminPage`, `managerPage`, `userPage` fixtures — each creates a browser context pre-loaded with the correct storageState. Import from this fixture in specs that need role-specific pages.

---

## `pages/BasePage.ts` — Common Helpers
- `navigate(path)` — goto + `waitForLoadState('networkidle')`
- `waitForToast(text?)` — waits for notistack snackbar (`.notistack-SnackbarContainer`)
- `clickNavItem(label)` — clicks sidebar nav link by text
- `waitForDataLoad()` — waits for `progressbar` role to disappear

---

## `utils/api-helpers.ts`
Node `fetch` functions for test data lifecycle (used in `beforeAll` / `afterAll`):

```typescript
getAdminToken(): Promise<string>
createChangeRequest(token, data): Promise<string>    // returns id
deleteChangeRequest(token, id): Promise<void>
createProject(token, data): Promise<string>
createDeploymentRequest(token, data): Promise<string>
createUser(token, data): Promise<string>
createDepartment(token, data): Promise<string>
deleteEntity(token, url): Promise<void>              // generic DELETE
```

---

## Test Specs

### `tests/auth/login.spec.ts` — project: `chromium`
- redirects unauthenticated user from `/dashboard` → `/login`
- successful login navigates to `/dashboard`
- wrong password shows error alert
- logout clears localStorage and redirects to `/login`

### `tests/dashboard/dashboard.spec.ts` — project: `chromium-admin`
- dashboard loads stat cards without error
- recent activity section renders
- navigation links in sidebar work

### `tests/change-requests/change-requests.spec.ts` — project: `chromium-admin`
- list page shows DataGrid with change request rows
- create via 3-step form (Basic → Impact/Risk → Review → Submit)
- submit a draft CR for review, assert status chip changes
- approve a submitted CR
- deny a submitted CR with reason
- search/filter by status

### `tests/projects/projects.spec.ts` — project: `chromium-admin`
- project list renders cards/rows
- navigate to project detail
- assign project manager via autocomplete dialog

### `tests/projects/tasks.spec.ts` — project: `chromium-admin`
- task board shows 4 kanban columns
- create task via dialog — appears in "Not Started"
- start task — moves to "In Progress"
- complete task — moves to "Completed"

### `tests/deployments/deployment-requests.spec.ts` — project: `chromium-admin`
- list renders (or shows empty state)
- create a deployment request via form
- detail page shows correct data

### `tests/admin/users.spec.ts` — project: `chromium-admin`
- user management table lists users
- create new user via dialog
- search filters table by name/email
- assign role via edit dialog

### `tests/admin/departments.spec.ts` — project: `chromium-admin`
- departments table lists entries
- create department
- delete department (with confirmation dialog)

---

## Playwright Features Enabled

| Feature | Config |
|---|---|
| Headed by default | `headless: process.env.CI === 'true'` |
| Video recording | `'on-first-retry'` |
| Screenshots | `'only-on-failure'` |
| Trace viewer | `'on-first-retry'` |
| HTML report | `reporter: [['html'], ['list']]` |
| Retries | `process.env.CI ? 1 : 0` |
| storageState auth | Per-project in `playwright.config.ts` |
| Auto web server | `webServer` starts Vite; `reuseExistingServer: true` |
| Custom fixtures | `fixtures/auth.fixture.ts` |
| Page Object Model | 12 page classes in `pages/` |
| API helpers | `utils/api-helpers.ts` (test data CRUD) |
| Multi-browser | chromium (primary) + firefox + webkit |
| Codegen | `npm run codegen` |
| ignoreHTTPSErrors | Self-signed cert on local API |

---

## Files to Create (28 total)

| Category | Files |
|---|---|
| Config | `package.json`, `playwright.config.ts`, `tsconfig.json`, `.env.example`, `.gitignore` |
| Auth setup | `global-setup.ts`, `fixtures/auth.fixture.ts` |
| Pages | `BasePage`, `LoginPage`, `DashboardPage`, `ChangeRequestsPage`, `ChangeRequestDetailPage`, `CreateChangeRequestPage`, `ProjectsPage`, `ProjectDetailPage`, `TaskBoardPage`, `DeploymentRequestsPage`, `AdminUsersPage`, `AdminDepartmentsPage` |
| Utils | `utils/api-helpers.ts` |
| Tests | `auth/login.spec.ts`, `dashboard/dashboard.spec.ts`, `change-requests/change-requests.spec.ts`, `projects/projects.spec.ts`, `projects/tasks.spec.ts`, `deployments/deployment-requests.spec.ts`, `admin/users.spec.ts`, `admin/departments.spec.ts` |

---

## First Run

```bash
cd Apex/ApexTests
npm install
npx playwright install --with-deps

# Fill in credentials (admin creds are the seeded defaults)
cp .env.example .env

# Ensure the API is running at https://acme.localhost:5000
# Playwright will auto-start the Vite dev server on port 3000

npm run test:headed        # headed — default dev mode
npm run test               # headless
npm run test:report        # open HTML report after run
npm run codegen            # record new tests interactively
```
