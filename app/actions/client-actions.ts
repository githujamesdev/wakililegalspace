'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { client } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getClients(organizationId: string) {
  const userId = await getUserId()

  return db
    .select()
    .from(client)
    .where(
      and(
        eq(client.organizationId, organizationId),
        eq(client.userId, userId)
      )
    )
    .orderBy(desc(client.createdAt))
}

export async function getClientById(clientId: string, organizationId: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(client)
    .where(
      and(
        eq(client.id, clientId),
        eq(client.organizationId, organizationId),
        eq(client.userId, userId)
      )
    )

  return result[0] || null
}

export async function createClient(
  organizationId: string,
  data: {
    name: string
    email?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    zipCode?: string
    clientType?: string
    notes?: string
  }
) {
  const userId = await getUserId()
  const id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(client).values({
    id,
    organizationId,
    userId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    country: data.country,
    zipCode: data.zipCode,
    clientType: data.clientType || 'individual',
    notes: data.notes,
    status: 'active',
  })

  revalidatePath(`/org/[slug]/clients`, 'layout')
  return id
}

export async function updateClient(
  clientId: string,
  organizationId: string,
  data: Partial<typeof client.$inferInsert>
) {
  const userId = await getUserId()

  await db
    .update(client)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(client.id, clientId),
        eq(client.organizationId, organizationId),
        eq(client.userId, userId)
      )
    )

  revalidatePath(`/org/[slug]/clients`, 'layout')
}

export async function deleteClient(clientId: string, organizationId: string) {
  const userId = await getUserId()

  await db
    .delete(client)
    .where(
      and(
        eq(client.id, clientId),
        eq(client.organizationId, organizationId),
        eq(client.userId, userId)
      )
    )

  revalidatePath(`/org/[slug]/clients`, 'layout')
}
