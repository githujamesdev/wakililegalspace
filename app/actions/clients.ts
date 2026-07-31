
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createClient(data: {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  clientType?: string
  taxId?: string
}) {
  const userId = await getUserId()

  try {
    const clientId = `client_${nanoid(12)}`

    // Insert into database
    const result = await db
      .insert({
        id: clientId,
        userId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        zipcode: data.zipCode || null,
        clienttype: data.clientType || 'individual',
        status: 'active',
        createdat: new Date(),
        updatedat: new Date(),
      } as any)
      .into('client' as any)
      .returning('*')

    return {
      success: true,
      client: {
        id: clientId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        zipcode: data.zipCode,
      },
    }
  } catch (error) {
    console.error('[v0] Client creation error:', error)
    return {
      success: false,
      error: 'Failed to create client',
    }
  }
}

export async function searchClients(searchTerm: string) {
  const userId = await getUserId()

  try {
    // Query database with search term
    const results = await db
      .select({
        id: 'id' as any,
        name: 'name' as any,
        email: 'email' as any,
        phone: 'phone' as any,
        address: 'address' as any,
        city: 'city' as any,
      })
      .from('client' as any)
      .where(eq('userid' as any, userId))

    // Filter by search term
    const filtered = results.filter(
      (c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return {
      success: true,
      clients: filtered,
    }
  } catch (error) {
    console.error('[v0] Client search error:', error)
    return {
      success: false,
      error: 'Failed to search clients',
      clients: [],
    }
  }
}

export async function getClient(clientId: string) {
  const userId = await getUserId()

  try {
    const result = await db
      .select()
      .from('client' as any)
      .where(eq('id' as any, clientId))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('[v0] Get client error:', error)
    throw error
  }
}