# Wakili Legal Workspace - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Landing Page │  │  Sign In     │  │  Dashboard &         │  │
│  │              │  │  Page        │  │  Organization Views  │  │
│  │              │  │              │  │                      │  │
│  │  / (public)  │  │ /auth/       │  │  /dashboard          │  │
│  │              │  │ sign-in      │  │  /org/[slug]/*       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                  │                        │           │
│         └──────────────────┼────────────────────────┘           │
│                            │                                    │
│                    Middleware Protection                         │
│                    (Authentication Check)                        │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     API LAYER                                   │
├────────────────────────────┼────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Authentication Routes                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ POST /api/auth/sign-in      → Validate & Create Session │  │
│  │ POST /api/auth/sign-out     → Clear Session             │  │
│  │ GET  /api/organizations    → List User Orgs             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Admin Routes                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ POST /api/admin/[slug]/users       → Create User         │  │
│  │ GET  /api/admin/[slug]/users       → List Users          │  │
│  │ DELETE /api/admin/[slug]/users/[id] → Delete User        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                   Auth Utilities & Functions
                 (lib/auth-utils.ts)
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼──────┐  ┌────────▼───────┐  ┌──────▼─────────┐
    │ Password   │  │ Role/          │  │ Audit          │
    │ Hashing    │  │ Permission     │  │ Logging        │
    │ Verification│  │ Management     │  │                │
    └─────┬──────┘  └────────┬───────┘  └──────┬─────────┘
          │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┐
│         │                  │                  │                 │
│  ┌──────▼──────────────────▼──────────────────▼──────────────┐ │
│  │          DATABASE LAYER (PostgreSQL)                      │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ User Management Tables                             │  │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │ • user              (email, name, profile)         │  │ │
│  │  │ • userCredential    (password hash, lockout)       │  │ │
│  │  │ • userRole          (user-role assignments)        │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ RBAC Tables                                        │  │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │ • role              (Admin, Manager, Attorney...)  │  │ │
│  │  │ • module            (Dashboard, Cases, Clients...) │  │ │
│  │  │ • permission        (view, create, edit, delete)  │  │ │
│  │  │ • rolePermission    (role-permission mapping)     │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Audit & Compliance                                 │  │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │ • authAuditLog      (login attempts, IP, status)   │  │ │
│  │  │ • activityLog       (entity modifications)         │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Business Data Tables                               │  │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │ • organization      (law firms)                    │  │ │
│  │  │ • client            (case clients)                 │  │ │
│  │  │ • case              (legal cases/matters)          │  │ │
│  │  │ • document          (files & documents)            │  │ │
│  │  │ • task              (workflow tasks)               │  │ │
│  │  │ • calendarEvent     (scheduling)                   │  │ │
│  │  │ • timeEntry         (billable hours)               │  │ │
│  │  │ • message           (team communication)           │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────┘  │ │
│                                                              │ │
└──────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
START
  │
  ▼
User at http://localhost:3000
  │
  ├─── Has valid session? ──YES──┐
  │                             │
  NO                            ▼
  │               Redirect to Dashboard
  ├─── Is /auth/sign-in? ──NO──►Redirect to Sign In
  │
  YES
  │
  ▼
User enters credentials
  │
  ▼
POST /api/auth/sign-in
  │
  ├─── Email not found? ──YES──┐
  │                            │
  NO                           ▼
  │                      Log: "User not found"
  ├─── Account locked? ──YES──┐Return: 403 Forbidden
  │                          │
  NO                         └─ Wait 30 minutes
  │
  ├─── Verify password ──FAIL──┐
  │                            │
  PASS                         ▼
  │                   Increment failed attempts
  ├─── Attempts ≥ 5? ──YES─► Lock account (30 min)
  │                          Return: 401 Unauthorized
  NO
  │
  ▼
Reset failed attempts to 0
  │
  ▼
Create session cookie (7 days)
  │
  ▼
Log: "Login successful" with IP, user-agent
  │
  ▼
Return session token
  │
  ▼
Redirect to /dashboard
  │
  ▼
GET /api/organizations
  │
  ▼
Load user's organizations
  │
  ▼
User selects organization → /org/[slug]
  │
  ▼
Load user's assigned role(s)
  │
  ▼
Load accessible modules based on role
  │
  ▼
Display sidebar with only accessible modules
  │
  ▼
END (User in workspace)
```

## Role-Based Access Control (RBAC) Model

```
┌─────────────────────────────────────────────────────┐
│                    USER                             │
│ (email, name, password hash, account status)        │
└────────────────┬────────────────────────────────────┘
                 │
                 │ 1:N relationship
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              USER ROLE                              │
│ (userId, roleId, organizationId)                    │
└────────────────┬────────────────────────────────────┘
                 │
                 │ N:1 relationship
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│                   ROLE                              │
│ (Admin, Manager, Attorney, Paralegal, Support)     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ 1:N relationship
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              ROLE PERMISSION                        │
│ (roleId, permissionId)                              │
└────────────────┬────────────────────────────────────┘
                 │
                 │ N:1 relationship
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│               PERMISSION                            │
│ (moduleId, name: view/create/edit/delete/share)    │
└────────────────┬────────────────────────────────────┘
                 │
                 │ N:1 relationship
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│                MODULE                               │
│ (Dashboard, Cases, Clients, Documents,              │
│  Messaging, Calendar, Tasks, Time Tracking,         │
│  Search, Security)                                  │
└─────────────────────────────────────────────────────┘

EXAMPLE:
────────
Attorney User
    │
    ├─► attorney-role
         │
         ├─► permission(view, cases)
         ├─► permission(create, cases)
         ├─► permission(view, documents)
         ├─► permission(create, documents)
         └─► ... more permissions
              │
              └─► Visible modules: Cases, Documents, etc.
```

## Permission Checking Flow

```
User requests module: "Cases"
    │
    ▼
Check: Does user have session? ──NO──► Redirect to login
    │
    YES
    ▼
Get user ID from session
    │
    ▼
Query: SELECT roles FROM userRole WHERE userId = ?
    │
    ▼
Get all roles for user
    │
    ▼
For each role:
    │
    ├─► Query: SELECT permissions FROM rolePermission WHERE roleId = ?
    │
    └─► Collect all permissions
    │
    ▼
Find "cases" module in collected permissions
    │
    ├─── Found? ──YES──► Grant Access to Cases module
    │
    NO
    │
    └──► Deny Access (404 or forbidden message)
```

## Data Flow for Module Access

```
┌─────────────────────────────────────────────────────────┐
│  COMPONENT: Sidebar Navigation                         │
│  Shows only modules user can access                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        Call: getUserModules(userId, orgId)
        (from lib/auth-utils.ts)
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   Get userRole         Get rolePermission
   for userId               for each role
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
           Get module info
           (displayName, icon, order)
                   │
                   ▼
        Sort by order
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  RESULT: Array of accessible modules                   │
│  [{                                                     │
│    id: "2",                                             │
│    name: "cases",                                       │
│    displayName: "Cases",                                │
│    icon: "FileText",                                    │
│    order: 1                                             │
│  }, ...]                                                │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR RENDERED WITH:                                │
│  • Dashboard (order 0)                                  │
│  • Cases (order 1)  ← Only if user has permission     │
│  • Clients (order 2)                                    │
│  • Documents (order 3)                                  │
│  • ... etc based on permissions                         │
└─────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌───────────────────────────────────────────────────────┐
│              Layer 1: Transport                       │
│  • HTTPS in production                                │
│  • Secure flag on cookies                             │
│  • SameSite=Lax to prevent CSRF                       │
└───────────────────────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────┐
│              Layer 2: Authentication                  │
│  • Bcryptjs password hashing (10 rounds)              │
│  • Account lockout (5 attempts, 30 min)               │
│  • Session tokens in HTTP-only cookies                │
│  • First-login password change forced                 │
└───────────────────────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────┐
│              Layer 3: Authorization                   │
│  • Middleware checks session validity                 │
│  • Role-based access control enforced                 │
│  • Permission checking per module                     │
│  • Organization data isolation                        │
└───────────────────────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────┐
│              Layer 4: Audit                           │
│  • All login attempts logged                          │
│  • IP address & user-agent tracked                    │
│  • Success/failure recorded                           │
│  • Failure reasons documented                         │
└───────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│               VERCEL DEPLOYMENT                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Next.js 16 Application (Edge Runtime)       │  │
│  │  • API Routes                                │  │
│  │  • Server Components                         │  │
│  │  • Middleware                                │  │
│  └──────────────────────────────┬───────────────┘  │
│                                 │                  │
│  ┌──────────────────────────────┴───────────────┐  │
│  │  Environment Variables                       │  │
│  │  • DATABASE_URL (Neon)                       │  │
│  │  • BETTER_AUTH_SECRET                        │  │
│  │  • NODE_ENV=production                       │  │
│  └──────────────────────────────┬───────────────┘  │
│                                 │                  │
└─────────────────────────────────┼──────────────────┘
                                  │
              ┌───────────────────┴────────────────┐
              │                                    │
              ▼                                    ▼
    ┌──────────────────────┐          ┌──────────────────────┐
    │  Neon PostgreSQL     │          │  Vercel Blob         │
    │  (Database)          │          │  (File Storage)      │
    │  • Authentication    │          │  • Documents         │
    │  • RBAC              │          │  • Files             │
    │  • Business Data     │          │  • Uploads           │
    └──────────────────────┘          └──────────────────────┘
```

## File Structure Visualization

```
wakili-workspace/
│
├── app/                                    ← Application Pages & Routes
│   ├── auth/
│   │   └── sign-in/
│   │       └── page.tsx                    ← Login Page
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── sign-in/route.ts            ← Login Endpoint
│   │   │   └── sign-out/route.ts           ← Logout Endpoint
│   │   ├── admin/
│   │   │   └── [slug]/users/route.ts       ← User Management API
│   │   └── organizations/route.ts          ← Orgs API
│   │
│   ├── org/[slug]/                         ← Workspace Routes
│   │   ├── admin/users/page.tsx            ← Admin Panel
│   │   ├── page.tsx                        ← Dashboard
│   │   ├── cases/page.tsx                  ← Cases Module
│   │   ├── clients/page.tsx                ← Clients Module
│   │   └── ... (8 more modules)
│   │
│   ├── dashboard/page.tsx                  ← Main Dashboard
│   └── page.tsx                            ← Landing Page
│
├── lib/
│   ├── auth-utils.ts                       ← ✨ Core Auth Functions
│   ├── auth.ts                             ← Better Auth Config
│   ├── auth-client.ts                      ← Client-side Auth
│   ├── db/
│   │   ├── index.ts                        ← DB Connection
│   │   └── schema.ts                       ← ✨ Database Schema (Updated)
│   └── multi-tenant-context.ts             ← Tenant Utils
│
├── components/
│   ├── ui/                                 ← shadcn/ui Components
│   ├── sidebar.tsx                         ← Navigation
│   └── auth-form.tsx                       ← Login Form
│
├── scripts/
│   └── seed-db.ts                          ← ✨ Database Seeding
│
├── middleware.ts                           ← ✨ Route Protection
│
├── SETUP_WINDOWS.md                        ← ✨ Setup Guide
├── WINDOWS_SETUP_STEPS.txt                 ← ✨ Quick Steps
├── QUICK_START.md                          ← ✨ Quick Reference
├── RBAC_IMPLEMENTATION.md                  ← ✨ Technical Docs
├── IMPLEMENTATION_COMPLETE.md              ← ✨ Summary
└── ARCHITECTURE.md                         ← This file

✨ = New or significantly updated
```

## Performance Optimization

```
Database Level:
├── Indexes on:
│   ├── user.email (faster lookups)
│   ├── userRole.userId (role queries)
│   ├── rolePermission.roleId (permission queries)
│   └── organizationMember.organizationId (org queries)
│
Server Level:
├── Session caching (7 days)
├── Role/permission lookup caching per request
├── Middleware short-circuits public routes
│
Client Level:
├── React memoization for components
├── Form debouncing for validation
└── Toast notifications for feedback
```

## Scaling Considerations

```
For 1,000+ Users:
├── Add read replicas for database
├── Cache role permissions in Redis
├── Archive old audit logs
├── Monitor query performance
└── Implement database connection pooling

For 10,000+ Users:
├── Separate read/write database instances
├── Implement distributed session storage
├── Archive audit logs to S3
├── Add CDN for static assets
└── Consider microservices for auth

For 100,000+ Users:
├── Dedicated authentication microservice
├── Multi-region database replication
├── Real-time audit logging system
├── Advanced caching strategy
└── API rate limiting & throttling
```

---

**Architecture Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Production Ready
