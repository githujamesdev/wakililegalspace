'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { client, invoice, case_, organization } from '@/lib/db/schema'
import { eq, and, sum, count, sql } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

/**
 * Fetch all clients for an organization
 */
export async function fetchOrganizationClients(organizationSlug: string, searchQuery?: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    // Get organization by slug
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, organizationSlug),
    })

    if (!org) {
      throw new Error('Organization not found')
    }

    // Build query with optional search
    let query = db
      .select({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        clientType: client.clientType,
        status: client.status,
        city: client.city,
        outstandingBalance: client.outstandingBalance,
        createdAt: client.createdAt,
      })
      .from(client)
      .where(eq(client.organizationId, org.id))

    if (searchQuery) {
      const searchLower = `%${searchQuery.toLowerCase()}%`
      // Search by name, email, phone, etc.
      query = query.where(
        sql`(LOWER(${client.name}) LIKE ${searchLower} OR 
             LOWER(${client.email}) LIKE ${searchLower} OR 
             LOWER(${client.phone}) LIKE ${searchLower})`
      )
    }

    const clients = await query

    // Get case count for each client
    const clientsWithCounts = await Promise.all(
      clients.map(async (c) => {
        const caseCount = await db
          .select({ count: count() })
          .from(case_)
          .where(and(
            eq(case_.organizationId, org.id),
            eq(case_.clientId, c.id)
          ))

        return {
          ...c,
          matterCount: caseCount[0]?.count || 0,
        }
      })
    )

    return {
      success: true,
      clients: clientsWithCounts,
    }
  } catch (error) {
    console.error('[v0] Error fetching clients:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch clients',
      clients: [],
    }
  }
}

/**
 * Fetch client statistics
 */
export async function fetchClientStatistics(organizationSlug: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    // Get organization by slug
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, organizationSlug),
    })

    if (!org) {
      throw new Error('Organization not found')
    }

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Total clients
    const totalClients = await db
      .select({ count: count() })
      .from(client)
      .where(eq(client.organizationId, org.id))

    // Individual clients
    const individuals = await db
      .select({ count: count() })
      .from(client)
      .where(and(
        eq(client.organizationId, org.id),
        eq(client.clientType, 'individual')
      ))

    // Corporate clients
    const corporate = await db
      .select({ count: count() })
      .from(client)
      .where(and(
        eq(client.organizationId, org.id),
        eq(client.clientType, 'corporate')
      ))

    // Active clients
    const active = await db
      .select({ count: count() })
      .from(client)
      .where(and(
        eq(client.organizationId, org.id),
        eq(client.status, 'active')
      ))

    // New clients this month
    const newThisMonth = await db
      .select({ count: count() })
      .from(client)
      .where(and(
        eq(client.organizationId, org.id),
        sql`${client.createdAt} >= ${startOfMonth}`
      ))

    // Outstanding balance
    const balances = await db
      .select({ total: sum(client.outstandingBalance) })
      .from(client)
      .where(eq(client.organizationId, org.id))

    return {
      success: true,
      statistics: {
        totalClients: totalClients[0]?.count || 0,
        individuals: individuals[0]?.count || 0,
        corporate: corporate[0]?.count || 0,
        active: active[0]?.count || 0,
        newThisMonth: newThisMonth[0]?.count || 0,
        outstandingBalance: balances[0]?.total || 0,
      },
    }
  } catch (error) {
    console.error('[v0] Error fetching statistics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      statistics: null,
    }
  }
}

/**
 * Create a new client
 */
export async function createClient(
  organizationSlug: string,
  clientData: {
    clientType: 'individual' | 'corporate'
    name: string
    email?: string
    phone?: string
    city?: string
    country?: string
    // Individual fields
    fullName?: string
    nationalId?: string
    passport?: string
    dateOfBirth?: Date
    occupation?: string
    preferredCommunication?: string
    // Corporate fields
    companyName?: string
    registrationNumber?: string
    kraPin?: string
    contactPerson?: string
    industry?: string
    // Address
    physicalAddress?: string
    postalAddress?: string
    zipCode?: string
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    // Get organization by slug
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, organizationSlug),
    })

    if (!org) {
      throw new Error('Organization not found')
    }

    // Create new client
    const newClientId = uuid()
    await db.insert(client).values({
      id: newClientId,
      organizationId: org.id,
      userId: session.user.id,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      clientType: clientData.clientType,
      city: clientData.city,
      country: clientData.country,
      // Individual fields
      fullName: clientData.fullName,
      nationalId: clientData.nationalId,
      passport: clientData.passport,
      dateOfBirth: clientData.dateOfBirth,
      occupation: clientData.occupation,
      preferredCommunication: clientData.preferredCommunication,
      // Corporate fields
      companyName: clientData.companyName,
      registrationNumber: clientData.registrationNumber,
      kraPin: clientData.kraPin,
      contactPerson: clientData.contactPerson,
      industry: clientData.industry,
      // Address
      physicalAddress: clientData.physicalAddress,
      postalAddress: clientData.postalAddress,
      zipCode: clientData.zipCode,
    })

    const newClient = await db.query.client.findFirst({
      where: eq(client.id, newClientId),
    })

    return {
      success: true,
      client: newClient,
    }
  } catch (error) {
    console.error('[v0] Error creating client:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client',
    }
  }
}
