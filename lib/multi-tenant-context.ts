'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizationMember } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Get current organization from URL slug
 * Multi-tenant apps use URL-based tenant isolation:
 * https://app.example.com/[organization-slug]/dashboard
 */
export async function getCurrentOrganizationSlug(): Promise<string | null> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const segments = pathname.split('/').filter(Boolean)
  return segments[0] || null
}

/**
 * Get current user's organization context
 */
export async function getOrganizationContext() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const slug = await getCurrentOrganizationSlug()
  if (!slug) throw new Error('Organization not found')

  // In a real implementation, you'd query the organization table
  // For now, return the slug and user ID
  return {
    userId: session.user.id,
    organizationSlug: slug,
    userEmail: session.user.email,
  }
}

/**
 * Check if user has access to organization
 */
export async function checkOrganizationAccess(organizationId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const member = await db
    .select()
    .from(organizationMember)
    .where(
      eq(organizationMember.organizationId, organizationId)
    )
    .limit(1)

  if (!member || member.length === 0) {
    throw new Error('Access denied')
  }

  return true
}

/**
 * Get user ID for server actions
 */
export async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}
