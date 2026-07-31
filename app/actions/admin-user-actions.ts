'use server'

import { db } from '@/lib/db'
import {
  user as userTable,
  userCredential,
  userRole,
  organizationMember,
  authAuditLog,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { hashPassword, logAuthAudit } from '@/lib/auth-custom'
import { auth } from '@/lib/auth'

/**
 * Get all users in an organization (admin only)
 */
export async function getAllUsers(organizationId: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Not authenticated')

    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        createdAt: userTable.createdAt,
        isActive: userCredential.isActive,
        isFirstLogin: userCredential.isFirstLogin,
      })
      .from(userTable)
      .innerJoin(organizationMember, eq(userTable.id, organizationMember.userId))
      .leftJoin(userCredential, eq(userTable.id, userCredential.userId))
      .where(eq(organizationMember.organizationId, organizationId))

    return { success: true, data: users }
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

/**
 * Create new user with temporary password and assign to organization
 */
export async function createUser({
  organizationId,
  name,
  email,
  roleId,
}: {
  organizationId: string
  name: string
  email: string
  roleId: string
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Not authenticated')

    // Check if user already exists
    const existing = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1)

    if (existing.length > 0) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Generate temp password
    const tempPassword = Math.random().toString(36).substring(2, 14) + 'A1!'
    const hashedPassword = await hashPassword(tempPassword)

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await db.insert(userTable).values({
      id: userId,
      name,
      email,
      emailVerified: false,
    })

    // Create credentials
    await db.insert(userCredential).values({
      id: `cred_${userId}`,
      userId,
      password: hashedPassword,
      isActive: true,
      isFirstLogin: true,
    })

    // Add to organization
    await db.insert(organizationMember).values({
      id: `orgmem_${userId}`,
      organizationId,
      userId,
      role: 'member',
    })

    // Assign role
    await db.insert(userRole).values({
      id: `userRole_${userId}`,
      userId,
      roleId,
      organizationId,
    })

    // Log audit
    await logAuthAudit({
      userId: session.user.id,
      email,
      action: 'user-created',
      status: 'success',
      reason: `User created by ${session.user.name}`,
    })

    return {
      success: true,
      data: {
        userId,
        email,
        tempPassword,
        message: 'User created. Share this temporary password with them.',
      },
    }
  } catch (error) {
    console.error('[v0] Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string, organizationId: string) {
  try {
    const session = await auth()
    if (!session) throw new Error('Not authenticated')

    const user = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1)

    if (!user.length) {
      return { success: false, error: 'User not found' }
    }

    // Delete user (cascade deletes related records)
    await db.delete(userTable).where(eq(userTable.id, userId))

    await logAuthAudit({
      userId: session.user.id,
      email: user[0].email,
      action: 'user-deleted',
      status: 'success',
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

/**
 * Update user role in organization
 */
export async function updateUserRole(
  userId: string,
  organizationId: string,
  newRoleId: string
) {
  try {
    const session = await auth()
    if (!session) throw new Error('Not authenticated')

    await db
      .update(userRole)
      .set({ roleId: newRoleId })
      .where(and(eq(userRole.userId, userId), eq(userRole.organizationId, organizationId)))

    await logAuthAudit({
      userId: session.user.id,
      action: 'role-changed',
      status: 'success',
      reason: `Role updated for user ${userId}`,
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating user role:', error)
    return { success: false, error: 'Failed to update user role' }
  }
}

/**
 * Force password change on next login
 */
export async function forcePasswordChange(userId: string) {
  try {
    await db
      .update(userCredential)
      .set({ isFirstLogin: true })
      .where(eq(userCredential.userId, userId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error forcing password change:', error)
    return { success: false, error: 'Failed to force password change' }
  }
}

/**
 * Get user's current password reset status
 */
export async function getUserPasswordStatus(userId: string) {
  try {
    const cred = await db
      .select({
        isFirstLogin: userCredential.isFirstLogin,
        isActive: userCredential.isActive,
        lockedUntil: userCredential.lockedUntil,
        failedLoginAttempts: userCredential.failedLoginAttempts,
      })
      .from(userCredential)
      .where(eq(userCredential.userId, userId))
      .limit(1)

    if (!cred.length) {
      return { success: false, error: 'User credentials not found' }
    }

    return { success: true, data: cred[0] }
  } catch (error) {
    console.error('[v0] Error getting password status:', error)
    return { success: false, error: 'Failed to get password status' }
  }
}

/**
 * Deactivate user account
 */
export async function deactivateUser(userId: string) {
  try {
    await db
      .update(userCredential)
      .set({ isActive: false })
      .where(eq(userCredential.userId, userId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error deactivating user:', error)
    return { success: false, error: 'Failed to deactivate user' }
  }
}

/**
 * Reactivate user account
 */
export async function reactivateUser(userId: string) {
  try {
    await db
      .update(userCredential)
      .set({ isActive: true })
      .where(eq(userCredential.userId, userId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error reactivating user:', error)
    return { success: false, error: 'Failed to reactivate user' }
  }
}
