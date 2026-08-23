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
    const matterPayments = payments.filter(p => invoices.some(inv => inv.id === p.invoiceId))
    const totalInvoiced = matter.agreedFee || invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = matterPayments.reduce((sum, pmt) => sum + pmt.amount, 0)
    const balance = Math.max(0, totalInvoiced - totalPaid)

    return {
      ...matter,
      client: clientData[0],
      documents: docs,
      invoices,
      payments: matterPayments,
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
    agreedFee?: number
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
      agreedFee: Math.max(0, Math.round(data.agreedFee || 0)),
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

export async function updateMatterAgreedFee(
  organizationId: string,
  matterId: string,
  agreedFeeCents: number
) {
  const userId = await getUserId()

  try {
    const matterRows = await db
      .select()
      .from(case_)
      .where(
        and(
          eq(case_.id, matterId),
          eq(case_.organizationId, organizationId),
          eq(case_.userId, userId)
        )
      )

    const matter = matterRows[0]
    if (!matter) return { success: false, error: 'Matter not found' }

    const agreedFee = Math.round(Number(agreedFeeCents))
    if (!Number.isFinite(agreedFee) || agreedFee <= 0) {
      return { success: false, error: 'Enter a total agreed fee greater than zero.' }
    }

    const invoiceId = `invoice_${matterId}`

    const existingPayments = await db
      .select()
      .from(payment)
      .where(and(eq(payment.invoiceId, invoiceId), eq(payment.organizationId, organizationId)))

    const alreadyPaid = existingPayments.reduce((sum, pmt) => sum + pmt.amount, 0)
    if (agreedFee < alreadyPaid) {
      return {
        success: false,
        error: `The agreed fee cannot be lower than the ${(alreadyPaid / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })} already paid.`,
      }
    }

    await db
      .update(case_)
      .set({ agreedFee, updatedAt: new Date() })
      .where(
        and(
          eq(case_.id, matterId),
          eq(case_.organizationId, organizationId),
          eq(case_.userId, userId)
        )
      )

    // Re-read the row to confirm the value was persisted.
    const verifyRows = await db
      .select({ agreedFee: case_.agreedFee })
      .from(case_)
      .where(and(eq(case_.id, matterId), eq(case_.organizationId, organizationId)))

    if (verifyRows[0]?.agreedFee !== agreedFee) {
      return { success: false, error: 'The agreed fee could not be saved. Please try again.' }
    }

    // Keep any existing invoice for this matter aligned with the new agreed fee.
    await db
      .update(invoice)
      .set({
        amount: agreedFee,
        total: agreedFee,
        status: alreadyPaid >= agreedFee ? 'paid' : alreadyPaid > 0 ? 'partial' : 'sent',
        updatedAt: new Date(),
      })
      .where(and(eq(invoice.id, invoiceId), eq(invoice.organizationId, organizationId)))

    revalidatePath(`/org/${organizationId}/cases/${matterId}`)

    return { success: true, agreedFee, balance: Math.max(0, agreedFee - alreadyPaid) }
  } catch (error) {
    console.error('[v0] Update agreed fee error:', error)
    const message = error instanceof Error ? error.message : String(error)

    if (/agreedFee/i.test(message) && /does not exist|column/i.test(message)) {
      return {
        success: false,
        error:
          'The "agreedFee" column is missing from this database. Run db/migrations/003-matter-billing.sql against the database this app is connected to, then try again.',
      }
    }

    return { success: false, error: `Failed to update the agreed fee: ${message}` }
  }
}

export async function logMatterPayment(
  organizationId: string,
  matterId: string,
  data: { amount: number; paymentMethod: string; referenceNumber?: string; notes?: string }
) {
  const userId = await getUserId()

  try {
    const matterRows = await db
      .select()
      .from(case_)
      .where(
        and(
          eq(case_.id, matterId),
          eq(case_.organizationId, organizationId),
          eq(case_.userId, userId)
        )
      )

    const matter = matterRows[0]
    if (!matter) return { success: false, error: 'Matter not found' }

    const amount = Math.round(Number(data.amount))
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Enter a payment amount greater than zero.' }
    }

    const reference = (data.referenceNumber || '').trim()
    if (!reference) {
      return { success: false, error: 'A payment reference number is required.' }
    }

    const agreedFee = matter.agreedFee || 0
    if (agreedFee <= 0) {
      return { success: false, error: 'Set a total agreed fee for this matter before logging payments.' }
    }

    const invoiceId = `invoice_${matterId}`

    await db
      .insert(invoice)
      .values({
        id: invoiceId,
        organizationId,
        clientId: matter.clientId,
        caseId: matterId,
        invoiceNumber: `INV-${matterId.slice(-8).toUpperCase()}`,
        amount: agreedFee,
        total: agreedFee,
        issueDate: new Date(),
        status: 'sent',
        description: matter.title,
        createdBy: userId,
      })
      .onConflictDoNothing()

    // Keep the invoice aligned with the current agreed fee for the matter type.
    await db
      .update(invoice)
      .set({ amount: agreedFee, total: agreedFee, updatedAt: new Date() })
      .where(and(eq(invoice.id, invoiceId), eq(invoice.organizationId, organizationId)))

    const existingPayments = await db
      .select()
      .from(payment)
      .where(and(eq(payment.invoiceId, invoiceId), eq(payment.organizationId, organizationId)))

    const alreadyPaid = existingPayments.reduce((sum, pmt) => sum + pmt.amount, 0)
    const outstanding = agreedFee - alreadyPaid

    if (outstanding <= 0) {
      return { success: false, error: 'This matter is already fully paid.' }
    }

    if (amount > outstanding) {
      return {
        success: false,
        error: `Payment exceeds the outstanding balance. The maximum you can record is ${(outstanding / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}.`,
      }
    }

    const duplicateReference = existingPayments.some(
      (pmt) => (pmt.referenceNumber || '').toLowerCase() === reference.toLowerCase()
    )
    if (duplicateReference) {
      return { success: false, error: 'A payment with this reference number has already been recorded.' }
    }

    await db.insert(payment).values({
      id: `payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      organizationId,
      invoiceId,
      clientId: matter.clientId,
      amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: reference,
      status: 'confirmed',
      paymentDate: new Date(),
      confirmedDate: new Date(),
      notes: data.notes?.trim() || null,
      createdBy: userId,
    })

    const paidAfter = alreadyPaid + amount
    await db
      .update(invoice)
      .set({ status: paidAfter >= agreedFee ? 'paid' : 'partial', updatedAt: new Date() })
      .where(and(eq(invoice.id, invoiceId), eq(invoice.organizationId, organizationId)))

    revalidatePath(`/org/${organizationId}/cases/${matterId}`)

    return {
      success: true,
      totalPaid: paidAfter,
      balance: Math.max(0, agreedFee - paidAfter),
    }
  } catch (error) {
    console.error('[v0] Log matter payment error:', error)
    const message = error instanceof Error ? error.message : String(error)

    if (/agreedFee/i.test(message) && /does not exist|column/i.test(message)) {
      return {
        success: false,
        error:
          'The "agreedFee" column is missing from this database. Run db/migrations/003-matter-billing.sql against the database this app is connected to, then try again.',
      }
    }

    return { success: false, error: `Failed to record payment: ${message}` }
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
