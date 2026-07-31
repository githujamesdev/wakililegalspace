import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

// import { db } from '../lib/db'
// import { role, module, permission, rolePermission, user, userCredential, organization } from '../lib/db/schema'
// import { hashPassword } from '../lib/auth-utils'

async function seedDatabase() {

   const { db } = await import("../lib/db");
  const { role, module, permission, rolePermission, user, userCredential, organization } =
    await import("../lib/db/schema");
  const { hashPassword } = await import("../lib/auth-utils");
  try {
    console.log('[v0] Starting database seed...')

    // Define modules
    const modules = [
      { id: '1', name: 'dashboard', displayName: 'Dashboard', icon: 'LayoutDashboard', order: 0 },
      { id: '2', name: 'cases', displayName: 'Cases', icon: 'FileText', order: 1 },
      { id: '3', name: 'clients', displayName: 'Clients', icon: 'Users', order: 2 },
      { id: '4', name: 'documents', displayName: 'Documents', icon: 'File', order: 3 },
      { id: '5', name: 'messaging', displayName: 'Messaging', icon: 'MessageSquare', order: 4 },
      { id: '6', name: 'calendar', displayName: 'Calendar', icon: 'Calendar', order: 5 },
      { id: '7', name: 'tasks', displayName: 'Tasks', icon: 'CheckSquare', order: 6 },
      { id: '8', name: 'time-tracking', displayName: 'Time Tracking', icon: 'Clock', order: 7 },
      { id: '9', name: 'search', displayName: 'Search', icon: 'Search', order: 8 },
      { id: '10', name: 'security', displayName: 'Security', icon: 'Shield', order: 9 },
    ]

    // Insert modules
    console.log('[v0] Inserting modules...')
    for (const mod of modules) {
      try {
        await db.insert(module).values({
          id: mod.id,
          name: mod.name,
          displayName: mod.displayName,
          icon: mod.icon,
          order: mod.order,
          createdAt: new Date(),
        })
      } catch (err: any) {
        if (!err.message.includes('duplicate')) {
          throw err
        }
      }
    }

    // Define permissions
    const permissions = [
      { id: '1', moduleId: '1', name: 'view', description: 'View dashboard' },
      { id: '2', moduleId: '2', name: 'view', description: 'View cases' },
      { id: '3', moduleId: '2', name: 'create', description: 'Create cases' },
      { id: '4', moduleId: '2', name: 'edit', description: 'Edit cases' },
      { id: '5', moduleId: '2', name: 'delete', description: 'Delete cases' },
      { id: '6', moduleId: '3', name: 'view', description: 'View clients' },
      { id: '7', moduleId: '3', name: 'create', description: 'Create clients' },
      { id: '8', moduleId: '4', name: 'view', description: 'View documents' },
      { id: '9', moduleId: '4', name: 'create', description: 'Create documents' },
      { id: '10', moduleId: '4', name: 'edit', description: 'Edit documents' },
      { id: '11', moduleId: '4', name: 'share', description: 'Share documents' },
      { id: '12', moduleId: '5', name: 'view', description: 'View messaging' },
      { id: '13', moduleId: '5', name: 'create', description: 'Send messages' },
      { id: '14', moduleId: '6', name: 'view', description: 'View calendar' },
      { id: '15', moduleId: '6', name: 'create', description: 'Create events' },
      { id: '16', moduleId: '7', name: 'view', description: 'View tasks' },
      { id: '17', moduleId: '7', name: 'create', description: 'Create tasks' },
      { id: '18', moduleId: '7', name: 'edit', description: 'Edit tasks' },
      { id: '19', moduleId: '8', name: 'view', description: 'View time entries' },
      { id: '20', moduleId: '8', name: 'create', description: 'Create time entries' },
      { id: '21', moduleId: '9', name: 'view', description: 'Use search' },
      { id: '22', moduleId: '10', name: 'view', description: 'View security logs' },
    ]

    // Insert permissions
    console.log('[v0] Inserting permissions...')
    for (const perm of permissions) {
      try {
        await db.insert(permission).values({
          id: perm.id,
          moduleId: perm.moduleId,
          name: perm.name,
          description: perm.description,
          createdAt: new Date(),
        })
      } catch (err: any) {
        if (!err.message.includes('duplicate')) {
          throw err
        }
      }
    }

    // Define roles
    const roles = [
      {
        id: 'admin-role',
        name: 'Admin',
        description: 'Full access to all features',
        permissions: permissions.map((p) => p.id),
      },
      {
        id: 'manager-role',
        name: 'Manager',
        description: 'Manage cases, clients, and team',
        permissions: ['1', '2', '3', '4', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
      },
      {
        id: 'attorney-role',
        name: 'Attorney',
        description: 'Access to cases, documents, and time tracking',
        permissions: ['1', '2', '3', '4', '6', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
      },
      {
        id: 'paralegal-role',
        name: 'Paralegal',
        description: 'Limited access to support attorneys',
        permissions: ['1', '2', '6', '8', '9', '12', '13', '14', '16', '17', '19', '20', '21'],
      },
      {
        id: 'support-role',
        name: 'Support',
        description: 'Client-facing support only',
        permissions: ['1', '6', '8', '12', '13', '14'],
      },
    ]

    // Insert roles
    console.log('[v0] Inserting roles...')
    for (const r of roles) {
      try {
        await db.insert(role).values({
          id: r.id,
          name: r.name,
          description: r.description,
          isSystem: true,
          organizationId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        // Link permissions to roles
        for (const permId of r.permissions) {
          try {
            await db.insert(rolePermission).values({
              id: crypto.randomUUID(),
              roleId: r.id,
              permissionId: permId,
              createdAt: new Date(),
            })
          } catch (err: any) {
            if (!err.message.includes('duplicate')) {
              console.error('[v0] Error linking permission:', permId, err.message)
            }
          }
        }
      } catch (err: any) {
        if (!err.message.includes('duplicate')) {
          console.error('[v0] Error inserting role:', r.name, err.message)
        }
      }
    }

    // Create demo admin user
    console.log('[v0] Creating demo admin user...')
    const adminPassword = await hashPassword('Admin123!')

    try {
      const adminUserId = crypto.randomUUID()

      await db.insert(user).values({
        id: adminUserId,
        email: 'admin@wakili.local',
        name: 'Admin User',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await db.insert(userCredential).values({
        id: crypto.randomUUID(),
        userId: adminUserId,
        password: adminPassword,
        isActive: true,
        isFirstLogin: false,
        lastPasswordChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log('[v0] Admin user created: admin@wakili.local / Admin123!')
    } catch (err: any) {
      if (!err.message.includes('duplicate')) {
        console.error('[v0] Error creating admin user:', err.message)
      } else {
        console.log('[v0] Admin user already exists')
      }
    }

    console.log('[v0] Database seed completed successfully!')
  } catch (error) {
    console.error('[v0] Database seed failed:', error)
    process.exit(1)
  }
}

seedDatabase()
