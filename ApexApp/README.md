# APEX App (React Frontend)

![Frontend](https://img.shields.io/badge/frontend-React%2019-61DAFB) ![Language](https://img.shields.io/badge/language-TypeScript-3178C6) ![UI](https://img.shields.io/badge/ui-Material%20UI%20v7-007FFF) ![Build](https://img.shields.io/badge/build-Vite-646CFF)

## Executive Summary

APEX App is a React 19 + TypeScript frontend that provides the primary user interface for authentication, dashboarding, change/project workflows, and task execution. It is built with Material UI v7 and Vite, integrates with the ApexAPI backend via configurable API base URL or proxy routing, and is designed to run as part of the monorepo full-stack workflow.

## Audience and Scope

- **Audience:** Frontend developers, UI engineers, and full-stack contributors working on the APEX user experience.
- **Scope:** Frontend setup, API integration behavior, route-level feature areas, and local verification workflows.
- **Use this README when:** You are building, running, debugging, or extending the React application.

## Table of Contents

- [Overview](#overview)
- [Monorepo Onboarding (Recommended)](#monorepo-onboarding-recommended)
- [Installation](#installation)
- [Proxy Configuration](#proxy-configuration)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [APEX Theme](#apex-theme)
- [Available Scripts](#available-scripts)
- [Features](#features)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)
- [Workflow Verification](#workflow-verification)

## Overview

A React 19 + Material UI application with:

- ✅ Full authentication (login, protected routes, token management)
- ✅ APEX brand theme (all your colors and typography)
- ✅ Dashboard with stats and quick actions
- ✅ Project Requests (create, submit, approve, convert)
- ✅ Projects (list, start, view tasks)
- ✅ Tasks (kanban board, create, start, complete)
- ✅ Responsive layout with sidebar navigation
- ✅ Error handling and loading states
- ✅ TypeScript for type safety

---

## Monorepo Onboarding (Recommended)

If you're running the full APEX stack from this repository:

1. Start backend services first from `../ApexAPI`
2. Set frontend API target in `.env` if needed
3. Start this UI with `npm run dev`

Example `.env`:

```bash
VITE_API_URL=https://acme.localhost:5000/api
```

You can also validate against localhost API hosts:

```bash
VITE_API_URL=https://localhost:5000/api
```

For the full startup checklist and troubleshooting, see the root monorepo guide: `../README.md`.

---

## Installation

### 1. Open the frontend project folder:

```bash
cd /path/to/Apex/ApexApp
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Configure API endpoint (optional):

Create `.env` file:

```bash
# Optional - defaults to /api with proxy
VITE_API_URL=https://acme.localhost:5000/api
```

### 4. Start development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

---

## Proxy Configuration

The Vite config includes a proxy to your API:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'https://acme.localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This means API calls to `/api/*` will be proxied to `https://acme.localhost:5000/api/*`

---

## Testing

### 1. Start your ASP.NET API:

```bash
cd /path/to/Apex/ApexAPI
dotnet run --project src/Apex.API.Web --urls "https://acme.localhost:5000"
```

### 2. Start the React UI:

```bash
cd /path/to/Apex/ApexApp
npm run dev
```

### 3. Login:

Open browser to `http://localhost:3000`

**Test Credentials:**

- Developer: `developer@acme.com`
- Admin: `admin2@acme.com`
- Password: (your test passwords)

---

## Project Structure

```
ApexApp/
├── src/
│   ├── api/                    # API client & endpoints
│   │   ├── client.ts          # Axios instance with interceptors
│   │   ├── auth.ts            # Authentication API
│   │   ├── projectRequests.ts # ProjectRequest API
│   │   ├── projects.ts        # Project API
│   │   └── tasks.ts           # Task API
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── layout/
│   │   │   └── AppLayout.tsx  # Sidebar + header
│   │   └── common/
│   │       └── StatusBadge.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx    # Auth state management
│   │
│   ├── pages/
│   │   ├── Login.tsx          # Login page
│   │   ├── Dashboard.tsx      # Dashboard with stats
│   │   ├── ProjectRequests.tsx # ProjectRequest management
│   │   ├── Projects.tsx       # Project list
│   │   ├── Tasks.tsx          # Task kanban board
│   │   └── NotFound.tsx       # 404 page
│   │
│   ├── theme/
│   │   └── apexTheme.ts       # MUI theme with APEX colors
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── projectRequest.ts
│   │   └── project.ts
│   │
│   ├── App.tsx                # Router & layout
│   └── main.tsx               # Entry point
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

---

## APEX Theme

Your brand colors are fully integrated:

```typescript
Primary Blue:    #2E5090  (buttons, headers, navigation)
Primary Dark:    #1E3A6F  (text, gradients)
Accent Blue:     #4A90E2  (links, secondary buttons)
Success Green:   #4CAF50  (success states, completed)
Warning Orange:  #FF9800  (pending, warnings)
Error Red:       #D32F2F  (errors, denied)

Typography:      Arial/Helvetica
```

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Features

### Authentication:

- ✅ Login with email/password
- ✅ Token storage in localStorage
- ✅ Auto-redirect on 401
- ✅ Protected routes
- ✅ Role-based UI (admin vs user)

### Dashboard:

- ✅ Stats cards (tasks, projects, requests)
- ✅ Quick actions
- ✅ Recent activity feed

### Project Requests:

- ✅ Create new request
- ✅ Submit for approval
- ✅ Approve/Deny (admin)
- ✅ Convert to project (admin)
- ✅ Status badges
- ✅ Priority chips

### Projects:

- ✅ List all projects
- ✅ View project details
- ✅ Start project
- ✅ View tasks for project

### Tasks:

- ✅ Kanban board (4 columns)
- ✅ Create task
- ✅ Start task
- ✅ Complete task
- ✅ Time tracking display
- ✅ Blocked tasks with reasons

### Layout:

- ✅ Responsive sidebar navigation
- ✅ App bar with user menu
- ✅ Mobile drawer
- ✅ Consistent spacing

---

## API Integration

All API calls are configured and ready:

```typescript
// Example: Create ProjectRequest
import { projectRequestApi } from "@/api/projectRequests";

const create = async () => {
  await projectRequestApi.create({
    title: "New Feature",
    description: "Build awesome feature",
    businessJustification: "Increase revenue",
    priority: "High",
  });
};
```

---

## Next Steps

### Immediate:

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Login and test the workflow

### Enhancements (Optional):

- Add department selection in task assignment
- Add user search/autocomplete
- Add task time logging modal
- Add project progress charts
- Add file upload for requests
- Add comments/discussion
- Add notifications
- Add dark mode toggle

### Production:

```bash
# Build for production
npm run build

# Output will be in dist/ folder
# Deploy to your hosting (Vercel, Netlify, etc.)
```

---

## Troubleshooting

### Issue: API calls fail with CORS error

**Solution:** Make sure your ASP.NET API has CORS configured for `http://localhost:3000`

### Issue: 401 Unauthorized after login

**Solution:** Check token is being stored and sent in Authorization header

### Issue: Module not found errors

**Solution:** Run `npm install` again

### Issue: TypeScript errors

**Solution:** Run `npm run build` to see all errors

---

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Material UI v7** - Component library
- **Vite** - Build tool
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date formatting

---

## Branding

The UI follows APEX branding guidelines:

- Professional color scheme
- Clean typography
- Consistent spacing
- Enterprise-grade UI

---

## Workflow Verification

Use this sequence to verify the end-to-end workflow:

1. Login as developer
2. Create ProjectRequest
3. Submit for approval
4. Login as admin
5. Approve request
6. Convert to project
7. View project
8. Create tasks
9. Start and complete tasks

For full-stack startup, troubleshooting, and smoke tests, see `../README.md`.
