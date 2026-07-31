'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { channel, message } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getChannels(organizationId: string) {
  const userId = await getUserId()

  return db
    .select()
    .from(channel)
    .where(
      and(
        eq(channel.organizationId, organizationId),
        eq(channel.userId, userId)
      )
    )
    .orderBy(desc(channel.createdAt))
}

export async function getChannelById(
  channelId: string,
  organizationId: string
) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(channel)
    .where(
      and(
        eq(channel.id, channelId),
        eq(channel.organizationId, organizationId),
        eq(channel.userId, userId)
      )
    )

  return result[0] || null
}

export async function createChannel(
  organizationId: string,
  data: {
    name: string
    description?: string
    channelType: string
    isPrivate?: boolean
    caseId?: string
    clientId?: string
  }
) {
  const userId = await getUserId()
  const id = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(channel).values({
    id,
    organizationId,
    userId,
    name: data.name,
    description: data.description,
    channelType: data.channelType,
    isPrivate: data.isPrivate || false,
    caseId: data.caseId,
    clientId: data.clientId,
    members: JSON.stringify([userId]),
  })

  revalidatePath(`/org/[slug]/messaging`, 'layout')
  return id
}

export async function getMessages(
  channelId: string,
  organizationId: string,
  limit: number = 50
) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(message)
    .where(
      and(
        eq(message.channelId, channelId),
        eq(message.organizationId, organizationId)
      )
    )
    .orderBy(desc(message.createdAt))
    .limit(limit)

  return result.reverse()
}

export async function sendMessage(
  channelId: string,
  organizationId: string,
  content: string,
  mentions?: string[]
) {
  const userId = await getUserId()
  const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(message).values({
    id,
    organizationId,
    userId,
    channelId,
    content,
    mentions: mentions ? JSON.stringify(mentions) : null,
    isEdited: false,
  })

  revalidatePath(`/org/[slug]/messaging`, 'layout')
  return id
}

export async function editMessage(
  messageId: string,
  organizationId: string,
  content: string
) {
  const userId = await getUserId()

  const msg = await db
    .select()
    .from(message)
    .where(
      and(
        eq(message.id, messageId),
        eq(message.organizationId, organizationId),
        eq(message.userId, userId)
      )
    )

  if (!msg || msg.length === 0) {
    throw new Error('Message not found or access denied')
  }

  await db
    .update(message)
    .set({ content, isEdited: true, updatedAt: new Date() })
    .where(eq(message.id, messageId))

  revalidatePath(`/org/[slug]/messaging`, 'layout')
}

export async function deleteMessage(
  messageId: string,
  organizationId: string
) {
  const userId = await getUserId()

  await db
    .delete(message)
    .where(
      and(
        eq(message.id, messageId),
        eq(message.organizationId, organizationId),
        eq(message.userId, userId)
      )
    )

  revalidatePath(`/org/[slug]/messaging`, 'layout')
}
