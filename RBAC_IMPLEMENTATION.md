# RBAC Authentication Implementation Summary

Complete documentation of the role-based access control system implemented in Wakili Legal Workspace.

## Overview

The authentication system has been completely redesigned to use database-driven user management with role-based access control (RBAC). This replaces the default Better Auth registration flow with an admin-controlled user creation system.

## Architecture

### Key Components

#### 1. Database Schema (New Tables)

**Users & Credentials**
- `userCredential`: Stores hashed passwords, login attempts, account lock status
- `user`: Basic user information (email, name)

**Roles & Permissions**
- `role`: Define 5 system roles (Admin, Manager, Attorney, Paralegal, Support)
- `permission`: Actions within modules (view, create, edit, delete, share)
- `module`: 10 modules representing features (Dashboard, Cases, Clients, etc.)
- `rolePermission`: Links roles to permissions (many-to-many)
- `userRole`: Assigns roles to users per organization (many-to-many)

**Audit**
- `authAuditLog`: Logs all authentication events (login, logout, failures)

#### 2. Authentication Flow

```
Admin Creates User
    ↓
User Receives Temporary Password
    ↓
User Logs In with Temp Password
    ↓
System Checks: isFirstLogin = true
    ↓
Force Password Change Required
    ↓
User Gets Full Access Based on Role
```

#### 3. Security Features

- **Password Hashing**: bcryptjs with salt rounds = 10
- **Account Lockout**: 5 failed attempts → 30-minute lockout
- **Temporary Passwords**: Generated with mixed case, numbers, symbols
- **Audit Logging**: Every login attempt tracked with IP, user agent
- **Session Management**: HTTP-only cookies for session tokens
- **First Login Flag**: Forces password change on initial access

## File Structure

```
wakili-workspace/
├── lib/
│   ├── auth-utils.ts                 # Core auth functions
│   ├── auth.ts                       # Better Auth config
│   └── db/
│       └── schema.ts                 # Drizzle schema with RBAC tables
│
├── app/
│   ├── auth/
│   │   └── sign-in/page.tsx          # Custom login page
│   │
│   ├── api/auth/
│   │   ├── sign-in/route.ts          # Login endpoint
│   │   └── sign-out/route.ts         # Logout endpoint
│   │
│   ├── api/admin/[slug]/
│   │   └── users/route.ts            # User management endpoint
│   │
│   ├── org/[slug]/admin/
│   │   └── users/page.tsx            # Admin user panel
│   │
│   └── dashboard/page.tsx            # Main dashboard after login
│
├── scripts/
│   └── seed-db.ts                    # Initialize roles & admin user
│
├── middleware.ts                     # Route protection
│
├── SETUP_WINDOWS.md                  # Complete Windows guide
├── QUICK_START.md                    # Quick reference
└── RBAC_IMPLEMENTATION.md            # This file
```

## Database Tables

### role
```sql
CREATE TABLE role (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  isSystem BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### module
```sql
CREATE TABLE module (
  id TEXT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order INTEGER DEFAULT 0,
  createdAt TIMESTAMP
);
```

### permission
```sql
CREATE TABLE permission (
  id TEXT PRIMARY KEY,
  moduleId TEXT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP
);
```

### rolePermission
```sql
CREATE TABLE rolePermission (
  id TEXT PRIMARY KEY,
  roleId TEXT NOT NULL,
  permissionId TEXT NOT NULL,
  createdAt TIMESTAMP
);
```

### userCredential
```sql
CREATE TABLE userCredential (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,           -- bcryptjs hashed
  isActive BOOLEAN DEFAULT TRUE,
  isFirstLogin BOOLEAN DEFAULT TRUE,
  lastPasswordChange TIMESTAMP,
  passwordExpiresAt TIMESTAMP,
  failedLoginAttempts INTEGER DEFAULT 0,
  lockedUntil TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### userRole
```sql
CREATE TABLE userRole (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  roleId TEXT NOT NULL,
  organizationId TEXT NOT NULL,
  createdAt TIMESTAMP
);
```

### authAuditLog
```sql
CREATE TABLE authAuditLog (
  id TEXT PRIMARY KEY,
  userId TEXT,
  email TEXT,
  action VARCHAR(50) NOT NULL,    -- login, logout, failed-login, password-change
  ipAddress TEXT,
  userAgent TEXT,
  status VARCHAR(20) NOT NULL,    -- success, failed
  reason TEXT,
  createdAt TIMESTAMP
);
```

## Authentication Functions (lib/auth-utils.ts)

### Core Functions

```typescript
// Hash password with bcryptjs
hashPassword(password: string): Promise<string>

// Verify password against hash
verifyPassword(password: string, hashedPassword: string): Promise<boolean>

// Generate temporary password (8 chars: uppercase, lowercase, number, symbol)
generateTemporaryPassword(): string

// Get user with their roles and permissions
getUserWithRoles(userId: string, organizationId: string): Promise<{...}>

// Get accessible modules for user
getUserModules(userId: string, organizationId: string): Promise<Module[]>

// Check if user has access to module
hasModuleAccess(userId: string, organizationId: string, moduleName: string): Promise<boolean>

// Log authentication events
logAuthEvent(action: string, status: 'success' | 'failed', data: {...}): void

// Account lockout after failed attempts
lockAccountOnFailedLogin(userId: string): void

// Reset login attempts
resetLoginAttempts(userId: string): void

// Check if account is locked
isAccountLocked(userId: string): Promise<boolean>
```

## API Endpoints

### POST /api/auth/sign-in
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Sign in successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "isFirstLogin": true
  }
}
```

**Error Cases:**
- Invalid credentials: 401
- Account locked: 403
- User not found: 401
- Account inactive: 403

### POST /api/auth/sign-out
Clears session cookie. No body required.

### POST /api/admin/{slug}/users
**Required:** Admin role

**Request:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "attorney"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "new-user-id",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "attorney"
  },
  "temporaryPassword": "AbCd1234"
}
```

### GET /api/admin/{slug}/users
Lists all users in organization (Admin only).

### DELETE /api/admin/{slug}/users/{userId}
Deletes user account (Admin only).

## System Roles

### 1. Admin
- **Access**: All modules
- **Permissions**: Full access including user management, settings
- **Use Case**: System administrator

### 2. Manager
- **Modules**: Dashboard, Cases, Clients, Documents, Messaging, Calendar, Tasks, Time Tracking, Search
- **Denied**: Security & Settings
- **Use Case**: Office manager, practice manager

### 3. Attorney
- **Modules**: Dashboard, Cases, Documents, Messaging, Calendar, Tasks, Time Tracking, Search
- **Denied**: Clients, Security, Settings
- **Use Case**: Lawyers, counsel

### 4. Paralegal
- **Modules**: Dashboard, Cases, Documents, Messaging, Tasks, Time Tracking, Search
- **Denied**: Clients, Calendar, Security, Settings
- **Use Case**: Legal support staff

### 5. Support
- **Modules**: Dashboard, Clients, Documents, Messaging, Calendar
- **Denied**: Cases, Tasks, Time Tracking, Search, Security, Settings
- **Use Case**: Client support, reception

## Module Definitions

| ID | Name | Display Name | Feature |
|---|---|---|---|
| 1 | dashboard | Dashboard | Overview and metrics |
| 2 | cases | Cases | Case management |
| 3 | clients | Clients | Client management |
| 4 | documents | Documents | Document uploads & sharing |
| 5 | messaging | Messaging | Team communication |
| 6 | calendar | Calendar | Event scheduling |
| 7 | tasks | Tasks | Task management |
| 8 | time-tracking | Time Tracking | Billable hours |
| 9 | search | Search | Full-text search |
| 10 | security | Security | Audit logs & security |

## Permission Types

- **view**: Can see the module
- **create**: Can create new items
- **edit**: Can modify existing items
- **delete**: Can remove items
- **share**: Can share items with others

## Middleware Protection (middleware.ts)

Routes are protected by authentication middleware:

**Public Routes:**
- `/` (landing page)
- `/auth/sign-in` (login page)
- `/api/auth/sign-in` (login endpoint)
- `/api/auth/sign-out` (logout endpoint)

**Protected Routes:**
- `/dashboard` (main dashboard)
- `/org/[slug]/*` (organization workspaces)
- `/admin/*` (admin panel)

Unauthenticated users are redirected to `/auth/sign-in`.

## Database Seeding

The `pnpm seed` command initializes:

1. **Modules**: All 10 modules with metadata
2. **Permissions**: 22 permissions (view, create, edit, delete, share)
3. **System Roles**: 5 predefined roles with mapped permissions
4. **Admin User**: 
   - Email: `admin@wakili.local`
   - Password: `Admin123!`
   - Can be changed on first login

## Windows Compatibility

All code is fully compatible with Windows:

- **Connection String**: Uses standard PostgreSQL format
- **File Paths**: Uses forward slashes (Node.js compatible)
- **Crypto**: Uses built-in `crypto.randomUUID()` (Node.js 15.7+)
- **Process**: PowerShell compatible commands
- **Environment**: Proper `.env.local` handling

## Security Best Practices

### Implemented ✅

1. **Password Security**
   - bcryptjs hashing with 10 salt rounds
   - Temporary passwords with mixed characters
   - Password change enforced on first login
   - Password expiration tracking

2. **Account Protection**
   - Failed login attempt tracking
   - Automatic lockout after 5 attempts
   - 30-minute lockout period
   - Manual unlock capability

3. **Session Security**
   - HTTP-only cookies (not accessible via JavaScript)
   - Secure flag in production
   - SameSite=Lax to prevent CSRF
   - 7-day expiration

4. **Audit Trail**
   - All login attempts logged
   - IP address recorded
   - User agent tracked
   - Success/failure status recorded
   - Reason for failure logged

5. **Role-Based Access**
   - Granular module access
   - Permission-based operations
   - Organization isolation
   - User cannot escalate privileges

### To Implement (Optional)

- Two-factor authentication (2FA)
- Single sign-on (SSO)
- Password complexity requirements
- Automated password expiration
- Session timeout warnings
- IP whitelisting
- Brute force rate limiting per IP

## User Management Workflow

### Creating New User (Admin)

1. Admin goes to `/org/[slug]/admin/users`
2. Clicks "New User"
3. Enters: Email, Name, Role
4. System generates temporary password
5. Admin shares password with user

### User First Login

1. User goes to `/auth/sign-in`
2. Enters email and temporary password
3. System detects `isFirstLogin = true`
4. Redirects to password change dialog
5. User sets their password
6. Full access granted based on role

### Subsequent Logins

1. User enters email and password
2. System validates credentials
3. Checks account lock status
4. Resets failed attempts on success
5. Creates session and redirects to dashboard

## Troubleshooting

### "Invalid email or password"
- Verify credentials
- Check if account is active
- Ensure user credentials exist in database

### "Account locked"
- User exceeded failed login attempts
- Wait 30 minutes or ask admin to unlock
- Admin can reset: `UPDATE userCredential SET lockedUntil = NULL WHERE userId = ?`

### Module access denied
- Check user's assigned role
- Verify role has permission for module
- Check `rolePermission` table

### First login loop
- Set `isFirstLogin = false` in `userCredential`
- Ensure password is set in `userCredential`

## Migration from Old System

If migrating from Better Auth self-signup:

1. Create admin user with `pnpm seed`
2. Manually create user records with credentials
3. Assign roles to users
4. Update existing users with passwords
5. Test login flow

## Next Steps

1. **Customize Roles**: Adjust permissions per organization needs
2. **Add 2FA**: Implement TOTP authentication
3. **Email Notifications**: Send new user credentials via email
4. **Password Reset**: Implement "forgot password" flow
5. **Organization Settings**: Allow org admins to create custom roles
6. **API Keys**: Add personal access tokens for programmatic access

## Support

For issues or questions, check:
1. Console logs in terminal: `[v0]` prefix
2. Auth audit log in database: `authAuditLog` table
3. Error messages returned from API
4. SETUP_WINDOWS.md for setup issues
