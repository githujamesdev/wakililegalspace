'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { case_, calendarEvent, client, invoice, organization, organizationMember, task } from '@/lib/db/schema'
import { and, asc, count, eq, gte, lt, sum } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getAuthorizedOrganization(slug: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const result = await db
    .select({ id: organization.id, name: organization.name })
    .from(organization)
    .innerJoin(organizationMember, eq(organizationMember.organizationId, organization.id))
    .where(and(eq(organization.slug, slug), eq(organizationMember.userId, session.user.id)))
    .limit(1)

  if (!result[0]) throw new Error('Organization access denied')
  return result[0]
}

export async function getDashboardData(slug: string) {
  const org = await getAuthorizedOrganization(slug)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTomorrow = new Date(startOfDay)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

  const [activeMatter, hearings, dueTasks, outstanding, upcomingHearings, upcomingTasks, activeMatters] = await Promise.all([
    db.select({ value: count() }).from(case_).where(and(eq(case_.organizationId, org.id), eq(case_.status, 'open'))),
    db.select({ value: count() }).from(calendarEvent).where(and(eq(calendarEvent.organizationId, org.id), eq(calendarEvent.eventType, 'hearing'), gte(calendarEvent.startTime, startOfDay), lt(calendarEvent.startTime, startOfTomorrow))),
    db.select({ value: count() }).from(task).where(and(eq(task.organizationId, org.id), gte(task.dueDate, startOfDay), lt(task.dueDate, startOfTomorrow), eq(task.status, 'todo'))),
    db.select({ value: sum(invoice.total) }).from(invoice).where(and(eq(invoice.organizationId, org.id), eq(invoice.status, 'overdue'))),
    db.select({ title: calendarEvent.title, startTime: calendarEvent.startTime, location: calendarEvent.location, caseId: calendarEvent.caseId }).from(calendarEvent).where(and(eq(calendarEvent.organizationId, org.id), eq(calendarEvent.eventType, 'hearing'), gte(calendarEvent.startTime, startOfDay))).orderBy(asc(calendarEvent.startTime)).limit(5),
    db.select({ title: task.title, dueDate: task.dueDate, priority: task.priority }).from(task).where(and(eq(task.organizationId, org.id), eq(task.status, 'todo'), gte(task.dueDate, startOfDay))).orderBy(asc(task.dueDate)).limit(5),
    db.select({ id: case_.id, title: case_.title, status: case_.status, targetDate: case_.targetDate, clientName: client.name }).from(case_).innerJoin(client, eq(client.id, case_.clientId)).where(and(eq(case_.organizationId, org.id), eq(case_.status, 'open'))).orderBy(asc(case_.targetDate)).limit(5),
  ])

  return {
    organizationName: org.name,
    metrics: { activeMatters: Number(activeMatter[0]?.value ?? 0), todaysHearings: Number(hearings[0]?.value ?? 0), tasksDueToday: Number(dueTasks[0]?.value ?? 0), outstandingFees: Number(outstanding[0]?.value ?? 0) },
    upcomingHearings,
    upcomingTasks,
    activeMatters,
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
