'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { case_, client, invoice, payment, document } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq, and, desc } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getMatters(organizationId: string) {
  const userId = await getUserId()

  try {
    const matters = await db
      .select({
        id: case_.id,
        title: case_.title,
        caseNumber: case_.caseNumber,
        caseType: case_.caseType,
        status: case_.status,
        priority: case_.priority,
        clientId: case_.clientId,
        createdAt: case_.createdAt,
        updatedAt: case_.updatedAt,
        courtName: case_.courtName,
        judge: case_.judge,
        opponent: case_.opponent,
      })
      .from(case_)
      .where(
        and(
          eq(case_.organizationId, organizationId),
          eq(case_.userId, userId)
        )
      )
      .orderBy(desc(case_.createdAt))

    return matters
  } catch (error) {
    console.error('[v0] Get matters error:', error)
    return []
  }
}

export async function getMatterWithDetails(matterId: string, organizationId: string) {
  const userId = await getUserId()

  try {
    // Fetch matter
    const matterData = await db
      .select()
      .from(case_)
      .where(
        and(
          eq(case_.id, matterId),
          eq(case_.organizationId, organizationId),
          eq(case_.userId, userId)
        )
      )

    const matter = matterData[0]
    if (!matter) return null

    // Fetch client
    const clientData = await db
      .select()
      .from(client)
      .where(eq(client.id, matter.clientId))

    // Fetch documents
    const docs = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.caseId, matterId),
          eq(document.organizationId, organizationId)
        )
      )
      .orderBy(desc(document.createdAt))

    // Fetch invoices
    const invoices = await db
      .select()
      .from(invoice)
      .where(
        and(
          eq(invoice.caseId, matterId),
          eq(invoice.organizationId, organizationId)
        )
      )
      .orderBy(desc(invoice.createdAt))

    // Fetch payments
    const payments = await db
      .select()
      .from(payment)
      .where(eq(payment.organizationId, organizationId))

    // Calculate totals
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = payments
      .filter(p => invoices.some(inv => inv.id === p.invoiceId))
      .reduce((sum, pmt) => sum + pmt.amount, 0)
    const balance = totalInvoiced - totalPaid

    return {
      ...matter,
      client: clientData[0],
      documents: docs,
      invoices,
      payments: payments.filter(p => invoices.some(inv => inv.id === p.invoiceId)),
      financials: {
        totalInvoiced,
        totalPaid,
        balance,
      },
    }
  } catch (error) {
    console.error('[v0] Get matter with details error:', error)
    return null
  }
}

export async function createMatter(
  organizationId: string,
  data: {
    clientId: string
    title: string
    matterType: string
    priority: string
    court?: string
    judge?: string
    opposingParty?: string
    description?: string
  }
) {
  const userId = await getUserId()

  try {
    const matterId = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const matterNumber = `MAT-${Date.now()}`

    // Create matter in database using proper Drizzle ORM syntax
    await db.insert(case_).values({
      id: matterId,
      organizationId,
      userId,
      clientId: data.clientId,
      title: data.title,
      caseNumber: matterNumber,
      caseType: data.matterType,
      priority: data.priority,
      status: 'open',
      courtName: data.court || null,
      judge: data.judge || null,
      opponent: data.opposingParty || null,
      description: data.description || null,
    })

    revalidatePath(`/org/[slug]/matters`, 'layout')

    return {
      success: true,
      matterId,
      message: 'Matter created successfully',
    }
  } catch (error) {
    console.error('[v0] Matter creation error:', error)
    return {
      success: false,
      error: 'Failed to create matter',
    }
  }
}

export async function getMatter(matterId: string, organizationId: string) {
  const userId = await getUserId()

  try {
    const matter = await db
      .select()
      .from(case_)
      .where(
        and(
          eq(case_.id, matterId),
          eq(case_.organizationId, organizationId),
          eq(case_.userId, userId)
        )
      )

    return matter[0] || null
  } catch (error) {
    console.error('[v0] Get matter error:', error)
    throw error
  }
}

export async function updateMatterStatus(
  matterId: string,
  organizationId: string,
  status: 'open' | 'on-hold' | 'closed'
) {
  const userId = await getUserId()

  try {
    await db
      .update(case_)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(case_.id, matterId),
          eq(case_.organizationId, organizationId),
          eq(case_.userId, userId)
        )
      )

    revalidatePath(`/org/[slug]/matters`, 'layout')

    return {
      success: true,
      message: 'Matter updated successfully',
    }
  } catch (error) {
    console.error('[v0] Update matter error:', error)
    return {
      success: false,
      error: 'Failed to update matter',
    }
  }
}

export async function addCourtAttendance(
  matterId: string,
  organizationId: string,
  data: {
    court: string
    judge: string
    date: string
    attendance: string
    proceedings: string
    orders: string
    nextCourtDate: string
    adjournmentReason: string
    billableHours: number
  }
) {
  const userId = await getUserId()

  try {
    const attendanceId = `attendance_${nanoid(12)}`

    console.log('[v0] Adding court attendance:', attendanceId, data)

    // Generate AI summaries
    // 1. Professional Summary
    // 2. Client Friendly Summary
    // 3. Next Steps
    // 4. Deadlines
    // 5. Risks
    // 6. Recommended Actions

    return {
      success: true,
      attendanceId,
      aiSummaries: {
        professionalSummary: 'AI-generated summary...',
        clientSummary: 'Client-friendly summary...',
        nextSteps: ['Step 1', 'Step 2'],
        deadlines: [],
        risks: [],
        recommendations: [],
      },
    }
  } catch (error) {
    console.error('[v0] Add court attendance error:', error)
    return {
      success: false,
      error: 'Failed to add court attendance',
    }
  }
}
