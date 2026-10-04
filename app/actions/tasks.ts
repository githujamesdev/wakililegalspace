'use server'

import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { case_, task } from '@/lib/db/schema'
import { requireOrganizationMember } from '@/lib/authorization'

export async function getTasks(organizationId: string) {
  const member = await requireOrganizationMember(organizationId)
  return db
    .select({
      id: task.id,
      title: task.title,
      description: task.description,
      caseId: task.caseId,
      caseTitle: case_.title,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo,
    })
    .from(task)
    .leftJoin(case_, eq(case_.id, task.caseId))
    .where(eq(task.organizationId, organizationId))
    .orderBy(asc(task.dueDate), asc(task.createdAt))
}

export async function createTask(input: {
  organizationId: string
  title: string
  description?: string
  caseId?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
}) {
  const member = await requireOrganizationMember(input.organizationId)
  const title = input.title.trim()
  if (!title) throw new Error('Task title is required')
  if (input.caseId) {
    const linked = await db.select({ id: case_.id }).from(case_).where(and(eq(case_.id, input.caseId), eq(case_.organizationId, input.organizationId))).limit(1)
    if (!linked[0]) throw new Error('Matter not found')
  }
  const id = `task_${crypto.randomUUID()}`
  await db.insert(task).values({
    id,
    organizationId: input.organizationId,
    userId: member.userId,
    title,
    description: input.description?.trim() || null,
    caseId: input.caseId || null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    priority: input.priority || 'medium',
    status: 'todo',
  })
  return id
}

export async function updateTaskStatus(organizationId: string, taskId: string, status: 'todo' | 'in-progress' | 'done') {
  const member = await requireOrganizationMember(organizationId)
  const result = await db.update(task).set({ status, updatedAt: new Date() }).where(and(eq(task.id, taskId), eq(task.organizationId, organizationId))).returning({ id: task.id })
  if (!result[0]) throw new Error('Task not found')
  return result[0].id
}

export async function getOrganizationMatters(organizationId: string) {
  const member = await requireOrganizationMember(organizationId)
  return db.select({ id: case_.id, title: case_.title }).from(case_).where(eq(case_.organizationId, organizationId)).orderBy(asc(case_.title))
}

export type TaskList = Awaited<ReturnType<typeof getTasks>>
export type MatterList = Awaited<ReturnType<typeof getOrganizationMatters>>
