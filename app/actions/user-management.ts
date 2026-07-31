'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, organizationMember, account } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function getActiveOrganizationId(userId: string) {
  const orgMember = await db
    .select({ organizationId: organizationMember.organizationId })
    .from(organizationMember)
    .where(eq(organizationMember.userId, userId))
    .limit(1)
  
  if (!orgMember.length) {
    throw new Error('User not in any organization')
  }
  
  return orgMember[0].organizationId
}

/**
 * Get all users in the organization
 * Admin users can view all users in their organization
 */
export async function getOrganizationUsers(organizationId: string) {
  try {
    const userId = await getUserId()
    
    // Check if user is admin in this organization
    const membership = await db
      .select()
      .from(organizationMember)
      .where(and(
        eq(organizationMember.userId, userId),
        eq(organizationMember.organizationId, organizationId)
      ))
      .limit(1)
    
    // Allow if user is admin/owner, or member of the organization
    // For now, members can also view (change this if needed for privacy)
    if (!membership.length) {
      throw new Error('Access denied - you are not a member of this organization')
    }

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        department: user.department,
        jobTitle: user.jobTitle,
        employmentStatus: user.employmentStatus,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        role: organizationMember.role,
      })
      .from(user)
      .innerJoin(organizationMember, eq(user.id, organizationMember.userId))
      .where(eq(organizationMember.organizationId, organizationId))

    return { success: true, data: users }
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch users' 
    }
  }
}

/**
 * Create a new user and send them an invite
 */
export async function inviteUser({
  organizationId,
  email,
  name,
  phone,
  department,
  jobTitle,
  employmentStatus,
}: {
  organizationId: string
  email: string
  name: string
  phone?: string
  department?: string
  jobTitle?: string
  employmentStatus?: string
}) {
  try {
    const userId = await getUserId()
    
    // Verify user is admin in this organization
    const membership = await db
      .select()
      .from(organizationMember)
      .where(and(
        eq(organizationMember.userId, userId),
        eq(organizationMember.organizationId, organizationId)
      ))
      .limit(1)
    
    if (!membership.length || (membership[0].role !== 'admin' && membership[0].role !== 'owner')) {
      throw new Error('Only admins can invite users')
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (existing.length > 0) {
      // User exists, check if they're already in org
      const alreadyMember = await db
        .select()
        .from(organizationMember)
        .where(and(
          eq(organizationMember.userId, existing[0].id),
          eq(organizationMember.organizationId, organizationId)
        ))
        .limit(1)
      
      if (alreadyMember.length > 0) {
        return { 
          success: false, 
          error: 'User is already a member of this organization' 
        }
      }
      
      // Add existing user to organization
      await db.insert(organizationMember).values({
        id: `orgmem_${existing[0].id}_${organizationId}`,
        organizationId,
        userId: existing[0].id,
        role: 'member',
      })
      
      revalidatePath(`/org/[slug]/admin/users`)
      return { 
        success: true, 
        data: { 
          userId: existing[0].id,
          email: existing[0].email,
          message: 'User added to organization'
        }
      }
    }

    // Create new user - they'll need to sign up
    // For now, just add them as a member and they can sign up later
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await db.insert(user).values({
      id: newUserId,
      name,
      email,
      phone,
      department,
      jobTitle,
      employmentStatus: employmentStatus || 'active',
      emailVerified: false,
    })

    await db.insert(organizationMember).values({
      id: `orgmem_${newUserId}_${organizationId}`,
      organizationId,
      userId: newUserId,
      role: 'member',
    })

    revalidatePath(`/org/[slug]/admin/users`)
    return {
      success: true,
      data: {
        userId: newUserId,
        email,
        message: 'User invited. They will need to sign up to access the system.',
      },
    }
  } catch (error) {
    console.error('[v0] Error inviting user:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to invite user' 
    }
  }
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrganization(
  userId: string,
  organizationId: string
) {
  try {
    const currentUserId = await getUserId()
    
    // Verify current user is admin
    const membership = await db
      .select()
      .from(organizationMember)
      .where(and(
        eq(organizationMember.userId, currentUserId),
        eq(organizationMember.organizationId, organizationId)
      ))
      .limit(1)
    
    if (!membership.length || (membership[0].role !== 'admin' && membership[0].role !== 'owner')) {
      throw new Error('Only admins can remove users')
    }

    // Can't remove yourself
    if (userId === currentUserId) {
      throw new Error('You cannot remove yourself from the organization')
    }

    await db
      .delete(organizationMember)
      .where(and(
        eq(organizationMember.userId, userId),
        eq(organizationMember.organizationId, organizationId)
      ))

    revalidatePath(`/org/[slug]/admin/users`)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error removing user:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove user' 
    }
  }
}

/**
 * Update user role in organization
 */
export async function updateUserRole(
  userId: string,
  organizationId: string,
  newRole: 'admin' | 'member'
) {
  try {
    const currentUserId = await getUserId()
    
    // Verify current user is admin
    const membership = await db
      .select()
      .from(organizationMember)
      .where(and(
        eq(organizationMember.userId, currentUserId),
        eq(organizationMember.organizationId, organizationId)
      ))
      .limit(1)
    
    if (!membership.length || (membership[0].role !== 'admin' && membership[0].role !== 'owner')) {
      throw new Error('Only admins can change roles')
    }

    // Can't change your own role
    if (userId === currentUserId) {
      throw new Error('You cannot change your own role')
    }

    await db
      .update(organizationMember)
      .set({ role: newRole })
      .where(and(
        eq(organizationMember.userId, userId),
        eq(organizationMember.organizationId, organizationId)
      ))

    revalidatePath(`/org/[slug]/admin/users`)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating role:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update role' 
    }
  }
}
