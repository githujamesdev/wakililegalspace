import { db } from './db'
import { userRole, rolePermission, permission, module as moduleTable, role as roleTable } from './db/schema'
import { eq, and, inArray } from 'drizzle-orm'

/**
 * Get all permissions for a user in an organization
 * Queries: userRole → role → rolePermission → permission → module
 */
export async function getUserPermissions(userId: string, organizationId: string) {
  try {
    const userRoles = await db
      .select()
      .from(userRole)
      .where(and(eq(userRole.userId, userId), eq(userRole.organizationId, organizationId)))

    if (!userRoles.length) return []

    const roleIds = userRoles.map((r) => r.roleId)

    const permissions = await db
      .select({
        permissionId: permission.id,
        permissionName: permission.name,
        moduleId: moduleTable.id,
        moduleName: moduleTable.name,
        displayName: moduleTable.displayName,
      })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .innerJoin(moduleTable, eq(permission.moduleId, moduleTable.id))
      .where(rolePermission.roleId.inArray(roleIds))

    return permissions
  } catch (error) {
    console.error('[v0] Error getting user permissions:', error)
    return []
  }
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(userId: string, organizationId: string) {
  try {
    const userRoles = await db
      .select({
        roleId: userRole.roleId,
        roleName: roleTable.name,
        roleDescription: roleTable.description,
      })
      .from(userRole)
      .innerJoin(roleTable, eq(userRole.roleId, roleTable.id))
      .where(and(eq(userRole.userId, userId), eq(userRole.organizationId, organizationId)))
      .limit(1)

    return userRoles.length > 0 ? userRoles[0] : null
  } catch (error) {
    console.error('[v0] Error getting user role:', error)
    return null
  }
}

/**
 * Get all roles in an organization
 */
export async function getOrganizationRoles(organizationId: string) {
  try {
    const roles = await db
      .select()
      .from(roleTable)
      .where(eq(roleTable.organizationId, organizationId))

    return roles
  } catch (error) {
    console.error('[v0] Error getting organization roles:', error)
    return []
  }
}

/**
 * Get all modules
 */
export async function getAllModules() {
  try {
    const modules = await db.select().from(moduleTable)
    return modules
  } catch (error) {
    console.error('[v0] Error getting modules:', error)
    return []
  }
}

/**
 * Check if user has permission for a module
 */
export async function userHasModuleAccess(
  userId: string,
  organizationId: string,
  moduleName: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, organizationId)
  return permissions.some((p) => p.moduleName === moduleName)
}

/**
 * Check if user has specific permission in a module
 */
export async function userHasPermission(
  userId: string,
  organizationId: string,
  moduleName: string,
  permissionName: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, organizationId)
  return permissions.some(
    (p) => p.moduleName === moduleName && p.permissionName === permissionName
  )
}

/**
 * Get accessible modules for a user
 */
export async function getAccessibleModules(userId: string, organizationId: string) {
  const permissions = await getUserPermissions(userId, organizationId)
  const uniqueModules = [...new Map(
    permissions.map((p) => [p.moduleId, { id: p.moduleId, name: p.moduleName, displayName: p.displayName }])
  ).values()]
  return uniqueModules
}

/**
 * Common module and permission names (for reference only)
 * Actual data is queried from the database
 */
export const COMMON_MODULES = {
  DASHBOARD: 'dashboard',
  CASES: 'cases',
  CLIENTS: 'clients',
  DOCUMENTS: 'documents',
  MESSAGING: 'messaging',
  CALENDAR: 'calendar',
  TASKS: 'tasks',
  TIME_TRACKING: 'time-tracking',
  SEARCH: 'search',
  SECURITY: 'security',
  SETTINGS: 'settings',
}

export const COMMON_PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  SHARE: 'share',
}

