
import { db } from '@/lib/db'
import {
  role as roleTable,
  module as moduleTable,
  permission as permissionTable,
  rolePermission,
} from '@/lib/db/schema'

const MODULES = [
  { name: 'dashboard', displayName: 'Dashboard', icon: 'LayoutGrid' },
  { name: 'cases', displayName: 'Cases', icon: 'Briefcase' },
  { name: 'clients', displayName: 'Clients', icon: 'Users' },
  { name: 'documents', displayName: 'Documents', icon: 'FileText' },
  { name: 'messaging', displayName: 'Messaging', icon: 'MessageSquare' },
  { name: 'calendar', displayName: 'Calendar', icon: 'Calendar' },
  { name: 'tasks', displayName: 'Tasks', icon: 'CheckSquare' },
  { name: 'time-tracking', displayName: 'Time Tracking', icon: 'Clock' },
  { name: 'search', displayName: 'Search', icon: 'Search' },
  { name: 'security', displayName: 'Security', icon: 'Lock' },
  { name: 'settings', displayName: 'Settings', icon: 'Settings' },
]

const PERMISSIONS = [
  { name: 'view', description: 'View items' },
  { name: 'create', description: 'Create new items' },
  { name: 'edit', description: 'Edit existing items' },
  { name: 'delete', description: 'Delete items' },
  { name: 'share', description: 'Share with others' },
]

const ROLE_PERMISSIONS = {
  admin: ['dashboard', 'cases', 'clients', 'documents', 'messaging', 'calendar', 'tasks', 'time-tracking', 'search', 'security', 'settings'],
  manager: ['dashboard', 'cases', 'clients', 'documents', 'messaging', 'calendar', 'tasks', 'time-tracking', 'search'],
  attorney: ['dashboard', 'cases', 'clients', 'documents', 'messaging', 'calendar', 'time-tracking', 'search'],
  paralegal: ['dashboard', 'cases', 'documents', 'messaging', 'calendar', 'tasks', 'time-tracking'],
  support: ['dashboard', 'cases', 'clients', 'documents', 'messaging'],
}

export async function seedRBAC() {
  console.log('🌱 Seeding RBAC data...')

  try {
    // 1. Insert modules
    console.log('📦 Creating modules...')
    for (const mod of MODULES) {
      await db
        .insert(moduleTable)
        .values({
          id: `mod_${mod.name}`,
          name: mod.name,
          displayName: mod.displayName,
          icon: mod.icon,
        })
        .onConflictDoNothing()
    }

    // 2. Insert permissions
    console.log('🔐 Creating permissions...')
    for (const perm of PERMISSIONS) {
      await db
        .insert(permissionTable)
        .values({
          id: `perm_${perm.name}`,
          moduleId: 'mod_dashboard', // placeholder
          name: perm.name,
          description: perm.description,
        })
        .onConflictDoNothing()
    }

    console.log('✅ RBAC seeding complete!')
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error)
  }
}

seedRBAC()