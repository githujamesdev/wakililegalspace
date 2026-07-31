'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { user, organizationMember, organization } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

/**
 * Fetch all users in an organization
 */
export async function fetchOrganizationUsers(organizationSlug: string) {
  console.log('[org-users] fetchOrganizationUsers: called with slug =', organizationSlug)
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log('[org-users] fetchOrganizationUsers: no session, unauthorized')
      throw new Error('Unauthorized')
    }
    console.log('[org-users] fetchOrganizationUsers: session userId =', session.user.id)

    // Get organization by slug
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, organizationSlug),
    })

    if (!org) {
      console.log('[org-users] fetchOrganizationUsers: no organization found for slug =', organizationSlug)
      throw new Error('Organization not found')
    }
    console.log('[org-users] fetchOrganizationUsers: resolved org =', { id: org.id, slug: org.slug, name: org.name })

    // Check if user is member of organization
    const memberRecord = await db.query.organizationMember.findFirst({
      where: and(
        eq(organizationMember.organizationId, org.id),
        eq(organizationMember.userId, session.user.id)
      ),
    })

    console.log(
      '[org-users] fetchOrganizationUsers: membership lookup for orgId =',
      org.id,
      'userId =',
      session.user.id,
      '-> found =',
      !!memberRecord
    )

    if (!memberRecord) {
      // Extra diagnostics: show what org memberships this user DOES have,
      // so we can see if it's a mismatched org id / stale session / no rows at all.
      const allMemberships = await db.query.organizationMember.findMany({
        where: eq(organizationMember.userId, session.user.id),
      })
      console.log(
        '[org-users] fetchOrganizationUsers: user has',
        allMemberships.length,
        'membership row(s) total:',
        allMemberships.map((m) => ({ organizationId: m.organizationId, role: m.role }))
      )
      throw new Error('You are not a member of this organization')
    }

    console.log('[org-users] fetchOrganizationUsers: caller role =', memberRecord.role)

    // Get all members of organization with their user details
    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: organizationMember.role,
        createdAt: organizationMember.createdAt,
        lastLogin: user.lastLogin,
      })
      .from(organizationMember)
      .innerJoin(user, eq(organizationMember.userId, user.id))
      .where(eq(organizationMember.organizationId, org.id))

    console.log('[org-users] fetchOrganizationUsers: fetched', members.length, 'member(s) for org =', org.id)

    return {
      success: true,
      users: members,
    }
  } catch (error) {
    console.error('[org-users] fetchOrganizationUsers: ERROR', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
      users: [],
    }
  }
}

/**
 * Add a new member to an organization
 */
export async function addOrganizationMember(
  organizationSlug: string,
  email: string,
  name: string,
  role: string = 'member'
) {
  console.log('[org-users] addOrganizationMember: called with', { organizationSlug, email, name, role })
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log('[org-users] addOrganizationMember: no session, unauthorized')
      throw new Error('Unauthorized')
    }
    console.log('[org-users] addOrganizationMember: session userId =', session.user.id)

    // Get organization by slug
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, organizationSlug),
    })

    if (!org) {
      console.log('[org-users] addOrganizationMember: no organization found for slug =', organizationSlug)
      throw new Error('Organization not found')
    }
    console.log('[org-users] addOrganizationMember: resolved org =', { id: org.id, slug: org.slug })

    // Check if user is admin of organization
    const memberRecord = await db.query.organizationMember.findFirst({
      where: and(
        eq(organizationMember.organizationId, org.id),
        eq(organizationMember.userId, session.user.id)
      ),
    })

    console.log('[org-users] addOrganizationMember: caller membership found =', !!memberRecord, 'role =', memberRecord?.role)

    if (!memberRecord || (memberRecord.role !== 'admin' && memberRecord.role !== 'owner')) {
      console.log('[org-users] addOrganizationMember: rejected, caller is not admin/owner')
      throw new Error('Only admins can add members')
    }

    // Check if user already exists
    let targetUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    })
    console.log('[org-users] addOrganizationMember: target user exists =', !!targetUser)

    // If user doesn't exist, create one
    if (!targetUser) {
      const newUserId = uuid()
      console.log('[org-users] addOrganizationMember: creating new user with id =', newUserId)
      await db.insert(user).values({
        id: newUserId,
        name,
        email,
        emailVerified: false,
      })
      targetUser = {
        id: newUserId,
        name,
        email,
        image: null,
        emailVerified: false,
        phone: null,
        employeeNumber: null,
        department: null,
        jobTitle: null,
        employmentStatus: 'active',
        lastLogin: null,
        profilePhoto: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    // Check if user is already a member
    const existingMember = await db.query.organizationMember.findFirst({
      where: and(
        eq(organizationMember.organizationId, org.id),
        eq(organizationMember.userId, targetUser.id)
      ),
    })
    console.log('[org-users] addOrganizationMember: already a member =', !!existingMember)

    if (existingMember) {
      throw new Error('User is already a member of this organization')
    }

    // Add user to organization
    const newMemberId = uuid()
    await db.insert(organizationMember).values({
      id: newMemberId,
      organizationId: org.id,
      userId: targetUser.id,
      role,
    })

    console.log('[org-users] addOrganizationMember: added userId =', targetUser.id, 'to org =', org.id, 'with role =', role)

    return {
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        image: targetUser.image,
        role,
        createdAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('[org-users] addOrganizationMember: ERROR', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add member',
    }
  }
}