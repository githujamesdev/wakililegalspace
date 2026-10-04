import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { organization, organizationMember } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { and, eq, or } from 'drizzle-orm'

export async function requireOrganizationMember(organizationRef: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const org = await db
    .select({ id: organization.id, userId: organization.userId })
    .from(organization)
    .where(or(eq(organization.id, organizationRef), eq(organization.slug, organizationRef)))
    .limit(1)

  if (!org[0]) throw new Error('Forbidden')

  const membership = await db
    .select({ id: organizationMember.id, role: organizationMember.role })
    .from(organizationMember)
    .where(
      and(
        eq(organizationMember.organizationId, org[0].id),
        eq(organizationMember.userId, session.user.id),
      ),
    )
    .limit(1)

  const isOwner = org[0].userId === session.user.id
  if (!membership[0] && !isOwner) throw new Error('Forbidden')

  return {
    userId: session.user.id,
    organizationId: org[0].id,
    role: membership[0]?.role ?? 'owner',
  }
}

export async function requireOrganizationAdmin(organizationId: string) {
  const membership = await requireOrganizationMember(organizationId)
  if (membership.role !== 'owner' && membership.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return membership
}

export function isAuthorizationError(error: unknown) {
  return error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')
}

export function safeActionError(error: unknown, fallback = 'Request could not be completed') {
  if (isAuthorizationError(error)) return error.message
  return fallback
}

export const authorization = { requireOrganizationMember, requireOrganizationAdmin }
export default authorization
