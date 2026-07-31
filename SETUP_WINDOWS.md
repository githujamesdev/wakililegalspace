# Wakili Legal Workspace - Windows Setup Guide

Complete step-by-step guide to run the application on Windows with the new RBAC authentication system.

## Prerequisites

### 1. Install Node.js
- Download: https://nodejs.org/ (LTS version 18+)
- Run installer and follow prompts
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install pnpm (Package Manager)
```bash
npm install -g pnpm
pnpm --version
```

### 3. Install PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Run installer
- **Important**: Remember the password you set for the `postgres` user
- During installation, select "pgAdmin 4" for database management

### 4. Create Database
Open PowerShell as Administrator and run:
```powershell
psql -U postgres
```

When prompted, enter the password you set during installation.

Then run these SQL commands:
```sql
CREATE DATABASE wakili_db;
\q
```

This creates the database and exits psql.

## Project Setup

### Step 1: Clone/Extract Project
Extract the project ZIP file to your desired location. In PowerShell, navigate to the project:
```bash
cd "C:\path\to\wakili-workspace"
```

### Step 2: Install Dependencies
```bash
pnpm install
```

This will install all required packages including bcryptjs, Drizzle ORM, etc.

### Step 3: Create Environment File

Create a file named `.env.local` in the project root with:

```
# PostgreSQL Database URL (Windows format)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/wakili_db

# Generate a secure secret - use this command in PowerShell:
# [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
BETTER_AUTH_SECRET=your_generated_secret_here

# Node environment
NODE_ENV=development
```

**Replace `your_password` with the PostgreSQL password you set during installation.**

### Step 4: Generate Auth Secret

In PowerShell, run:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy the output and paste it as the `BETTER_AUTH_SECRET` value in `.env.local`.

### Step 5: Create Database Tables

Run the SQL script to create all tables. Open PowerShell and run:

```bash
psql -U postgres -d wakili_db
```

Paste and run these commands:

```sql
-- Create all tables (in order due to dependencies)

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  expiresAt TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope TEXT,
  password TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "organization" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  description TEXT,
  subscription VARCHAR(50) DEFAULT 'free' NOT NULL,
  storageLimit INTEGER DEFAULT 5000000000,
  storageUsed INTEGER DEFAULT 0,
  maxUsers INTEGER DEFAULT 5,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "organizationMember" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'member' NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "client" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  zipCode TEXT,
  clientType VARCHAR(20) DEFAULT 'individual' NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "case" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  clientId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  caseNumber TEXT,
  caseType VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'open' NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' NOT NULL,
  courtName TEXT,
  judge TEXT,
  opponent TEXT,
  startDate TIMESTAMP,
  targetDate TIMESTAMP,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "document" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  caseId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  fileUrl TEXT NOT NULL,
  fileName TEXT NOT NULL,
  fileSize INTEGER,
  fileType VARCHAR(20),
  documentType VARCHAR(50),
  visibility VARCHAR(20) DEFAULT 'private' NOT NULL,
  version INTEGER DEFAULT 1,
  isArchived BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "documentShare" (
  id TEXT PRIMARY KEY,
  documentId TEXT NOT NULL,
  sharedWith TEXT NOT NULL,
  sharedBy TEXT NOT NULL,
  permission VARCHAR(20) DEFAULT 'view' NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "channel" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  channelType VARCHAR(20) DEFAULT 'general' NOT NULL,
  isPrivate BOOLEAN DEFAULT FALSE,
  caseId TEXT,
  clientId TEXT,
  members JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "message" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  channelId TEXT NOT NULL,
  content TEXT NOT NULL,
  mentions JSONB,
  isEdited BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "task" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  caseId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  assignedTo TEXT,
  status VARCHAR(20) DEFAULT 'todo' NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' NOT NULL,
  dueDate TIMESTAMP,
  reminder BOOLEAN DEFAULT FALSE,
  reminderTime TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "calendarEvent" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  caseId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  eventType VARCHAR(30) NOT NULL,
  startTime TIMESTAMP NOT NULL,
  endTime TIMESTAMP NOT NULL,
  location TEXT,
  attendees JSONB,
  reminder BOOLEAN DEFAULT TRUE,
  reminderMinutes INTEGER DEFAULT 30,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "timeEntry" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  caseId TEXT,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  billableRate INTEGER,
  isBillable BOOLEAN DEFAULT TRUE,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "activityLog" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT,
  entityType VARCHAR(50) NOT NULL,
  entityId TEXT NOT NULL,
  action VARCHAR(50) NOT NULL,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- RBAC Tables

CREATE TABLE IF NOT EXISTS "module" (
  id TEXT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "role" (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  isSystem BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "permission" (
  id TEXT PRIMARY KEY,
  moduleId TEXT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "rolePermission" (
  id TEXT PRIMARY KEY,
  roleId TEXT NOT NULL,
  permissionId TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "userCredential" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  password TEXT NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  isFirstLogin BOOLEAN DEFAULT TRUE,
  lastPasswordChange TIMESTAMP,
  passwordExpiresAt TIMESTAMP,
  failedLoginAttempts INTEGER DEFAULT 0,
  lockedUntil TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "userRole" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  roleId TEXT NOT NULL,
  organizationId TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "authAuditLog" (
  id TEXT PRIMARY KEY,
  userId TEXT,
  email TEXT,
  action VARCHAR(50) NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  status VARCHAR(20) NOT NULL,
  reason TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_role_organizationId ON role(organizationId);
CREATE INDEX IF NOT EXISTS idx_userRole_userId ON userRole(userId);
CREATE INDEX IF NOT EXISTS idx_userRole_roleId ON userRole(roleId);
CREATE INDEX IF NOT EXISTS idx_rolePermission_roleId ON rolePermission(roleId);
```

Type `\q` and press Enter to exit psql.

### Step 6: Seed Database with Roles

Run the seed script to create system roles and admin user:

```bash
pnpm seed
```

You should see output like:
```
[v0] Starting database seed...
[v0] Inserting modules...
[v0] Inserting permissions...
[v0] Inserting roles...
[v0] Creating demo admin user...
[v0] Admin user created: admin@wakili.local / Admin123!
[v0] Database seed completed successfully!
```

### Step 7: Start Development Server

```bash
pnpm dev
```

You should see:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
```

### Step 8: Access Application

Open your browser and go to: http://localhost:3000

## Login Credentials

After seeding, use these credentials:

**Admin Account:**
- Email: `admin@wakili.local`
- Password: `Admin123!`

**First Login:**
- You'll be prompted to change your password on first login
- After that, you can create more users from the admin panel

## Creating New Users

1. Log in as admin
2. Navigate to Admin > Users
3. Click "New User"
4. Enter user details and select role
5. A temporary password will be generated
6. Share the temporary password with the user
7. User changes password on first login

## Available Roles

- **Admin**: Full access to all modules and admin functions
- **Manager**: Manage cases, clients, documents, messaging, calendar, tasks, and time tracking
- **Attorney**: Access to cases, documents, messaging, calendar, and time tracking
- **Paralegal**: Limited access to support attorneys
- **Support**: Client-facing support access only

## Troubleshooting

### Port 3000 in use
If port 3000 is already in use, run:
```bash
pnpm dev -- -p 3001
```

### Database connection refused
1. Make sure PostgreSQL is running (Services > PostgreSQL Server)
2. Verify DATABASE_URL in .env.local
3. Check username/password

### Permission denied on seed script
Run PowerShell as Administrator

### Missing dependencies
```bash
pnpm install
```

## Project Structure

```
wakili-workspace/
├── app/
│   ├── auth/                 # Authentication pages
│   ├── api/                  # API routes
│   ├── org/[slug]/           # Organization workspace
│   ├── admin/                # Admin panel
│   └── dashboard/            # User dashboard
├── lib/
│   ├── auth-utils.ts         # Authentication utilities
│   ├── db/                   # Database configuration
│   └── multi-tenant-context.ts
├── scripts/
│   └── seed-db.ts            # Database seeding script
└── .env.local                # Environment variables
```

## Next Steps

1. Customize roles and permissions as needed
2. Set up Vercel Blob for document storage
3. Configure email notifications
4. Customize branding and colors
5. Deploy to Vercel

For additional help, contact support or check the documentation.
