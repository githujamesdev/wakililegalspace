'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { case_ } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getCases(organizationId: string, caseStatus?: string) {
  const userId = await getUserId()

  let query = db
    .select()
    .from(case_)
    .where(
      and(
        eq(case_.organizationId, organizationId),
        eq(case_.userId, userId)
      )
    )

  if (caseStatus) {
    query = query.where(eq(case_.status, caseStatus))
  }

  return query.orderBy(desc(case_.createdAt))
}

export async function getCaseById(caseId: string, organizationId: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(case_)
    .where(
      and(
        eq(case_.id, caseId),
        eq(case_.organizationId, organizationId),
        eq(case_.userId, userId)
      )
    )

  return result[0] || null
}

export async function createCase(
  organizationId: string,
  clientId: string,
  data: {
    title: string
    description?: string
    caseNumber?: string
    caseType: string
    priority?: string
    status?: string
    courtName?: string
    judge?: string
    opponent?: string
    startDate?: Date
    targetDate?: Date
  }
) {
  const userId = await getUserId()
  const id = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(case_).values({
    id,
    organizationId,
    userId,
    clientId,
    title: data.title,
    description: data.description,
    caseNumber: data.caseNumber,
    caseType: data.caseType,
    priority: data.priority || 'medium',
    status: data.status || 'open',
    courtName: data.courtName,
    judge: data.judge,
    opponent: data.opponent,
    startDate: data.startDate,
    targetDate: data.targetDate,
  })

  revalidatePath(`/org/[slug]/cases`, 'layout')
  return id
}

export async function updateCase(
  caseId: string,
  organizationId: string,
  data: Partial<typeof case_.$inferInsert>
) {
  const userId = await getUserId()

  await db
    .update(case_)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(case_.id, caseId),
        eq(case_.organizationId, organizationId),
        eq(case_.userId, userId)
      )
    )

  revalidatePath(`/org/[slug]/cases`, 'layout')
}

export async function deleteCase(caseId: string, organizationId: string) {
  const userId = await getUserId()

  await db
    .delete(case_)
    .where(
      and(
        eq(case_.id, caseId),
        eq(case_.organizationId, organizationId),
        eq(case_.userId, userId)
      )
    )

  revalidatePath(`/org/[slug]/cases`, 'layout')
}
