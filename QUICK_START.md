# Wakili Legal Workspace - Quick Start

**For detailed setup, see SETUP_WINDOWS.md**

## 30-Second Setup

### 1. Prerequisites
- Install Node.js: https://nodejs.org
- Install PostgreSQL: https://postgresql.org/download/windows
- Create database: `psql -U postgres` then `CREATE DATABASE wakili_db;`

### 2. Project Setup
```bash
cd wakili-workspace
pnpm install
```

### 3. Environment Setup
Create `.env.local`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/wakili_db
BETTER_AUTH_SECRET=generate_with_powershell_command
NODE_ENV=development
```

Generate secret in PowerShell:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 4. Database Setup
```bash
# Create tables (paste entire SQL from SETUP_WINDOWS.md into psql)
psql -U postgres -d wakili_db

# Seed roles and admin user
pnpm seed
```

### 5. Run Application
```bash
pnpm dev
```

**Open**: http://localhost:3000

## Login Credentials

```
Email: admin@wakili.local
Password: Admin123!
```

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm seed         # Initialize database with roles
pnpm lint         # Check code quality
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `pnpm dev -- -p 3001` |
| DB connection failed | Check DATABASE_URL and PostgreSQL is running |
| Module not found | Run `pnpm install` |
| Permission denied | Run PowerShell as Administrator |

## Architecture

- **Frontend**: Next.js 16 with React 19
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Custom RBAC with bcryptjs
- **UI**: shadcn/ui components
- **Styling**: Tailwind CSS v4

## Features

✅ Multi-tenant workspace  
✅ Role-based access control (5 roles)  
✅ 10 modules with granular permissions  
✅ User management by admins  
✅ Secure authentication with password hashing  
✅ Audit logging  
✅ Windows compatible  

## Need Help?

See SETUP_WINDOWS.md for complete documentation
