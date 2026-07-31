import bcryptjs from 'bcryptjs'
import { db } from './db'
import {
  userCredential,
  userRole,
  rolePermission,
  permission,
  module as moduleTable,
  authAuditLog,
} from './db/schema'
import { eq, and, inArray } from 'drizzle-orm'

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword)
}

// Generate temporary password (8 chars: uppercase, lowercase, number, symbol)
export function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'

  let chars =
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    symbols[Math.floor(Math.random() * symbols.length)]

  const remaining = [...uppercase, ...lowercase, ...numbers, ...symbols]
  for (let i = 0; i < 4; i++) {
    chars += remaining[Math.floor(Math.random() * remaining.length)]
  }

  return chars
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

// Get user with their roles and permissions
export async function getUserWithRoles(userId: string, organizationId: string) {
  const userRoles = await db
    .select()
    .from(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.organizationId, organizationId)))

  if (userRoles.length === 0) {
    return null
  }

  const roleIds = userRoles.map((ur) => ur.roleId)

  // Get all permissions for user's roles
  const rolePerms = await db
    .select()
    .from(rolePermission)
    .where(inArray(rolePermission.roleId, roleIds))

  return {
    userId,
    organizationId,
    roles: roleIds,
    permissions: rolePerms.map((rp) => rp.permissionId),
  }
}

// Get user's accessible modules
export async function getUserModules(userId: string, organizationId: string) {
  const userPerms = await getUserWithRoles(userId, organizationId)

  if (!userPerms || userPerms.permissions.length === 0) {
    return []
  }

  const perms = await db
    .select()
    .from(permission)
    .where(inArray(permission.id, userPerms.permissions))

  // Get unique module IDs from permissions
  const moduleIds = [...new Set(perms.map((p) => p.moduleId))]

  if (moduleIds.length === 0) {
    return []
  }

  const modules = await db
    .select()
    .from(moduleTable)
    .where(inArray(moduleTable.id, moduleIds))

  return modules.sort((a, b) => (a.order || 0) - (b.order || 0))
}

// Check if user has permission for a module
export async function hasModuleAccess(
  userId: string,
  organizationId: string,
  moduleName: string
): Promise<boolean> {
  const modules = await getUserModules(userId, organizationId)
  return modules.some((m) => m.name === moduleName)
}

// Log authentication events
export async function logAuthEvent(
  action: string,
  status: 'success' | 'failed',
  data: {
    userId?: string
    email?: string
    ipAddress?: string
    userAgent?: string
    reason?: string
  }
) {
  try {
    await db.insert(authAuditLog).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      email: data.email,
      action,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status,
      reason: data.reason,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error('[v0] Failed to log auth event:', error)
  }
}

// Lock account after failed attempts
export async function lockAccountOnFailedLogin(userId: string) {
  const cred = await db
    .select()
    .from(userCredential)
    .where(eq(userCredential.userId, userId))
    .limit(1)

  if (cred.length === 0) return

  const attempts = (cred[0].failedLoginAttempts || 0) + 1
  const lockout = attempts >= 5

  await db
    .update(userCredential)
    .set({
      failedLoginAttempts: attempts,
      lockedUntil: lockout ? new Date(Date.now() + 30 * 60 * 1000) : null,
    })
    .where(eq(userCredential.userId, userId))
}

// Reset login attempts
export async function resetLoginAttempts(userId: string) {
  await db
    .update(userCredential)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
    })
    .where(eq(userCredential.userId, userId))
}

// Check if account is locked
export async function isAccountLocked(userId: string): Promise<boolean> {
  const cred = await db
    .select()
    .from(userCredential)
    .where(eq(userCredential.userId, userId))
    .limit(1)

  if (cred.length === 0) return false

  if (!cred[0].lockedUntil) return false

  if (new Date() > cred[0].lockedUntil) {
    // Unlock account
    await resetLoginAttempts(userId)
    return false
  }

  return true
}
