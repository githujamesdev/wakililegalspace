'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { document, documentShare } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getDocuments(organizationId: string, caseId?: string) {
  const userId = await getUserId()

  let query = db
    .select()
    .from(document)
    .where(
      and(
        eq(document.organizationId, organizationId),
        eq(document.userId, userId)
      )
    )

  if (caseId) {
    query = query.where(eq(document.caseId, caseId))
  }

  return query.orderBy(desc(document.createdAt))
}

export async function getDocumentById(
  documentId: string,
  organizationId: string
) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(document)
    .where(
      and(
        eq(document.id, documentId),
        eq(document.organizationId, organizationId),
        eq(document.userId, userId)
      )
    )

  return result[0] || null
}

export async function uploadDocument(
  organizationId: string,
  data: {
    title: string
    description?: string
    caseId?: string
    fileUrl: string
    fileName: string
    fileSize: number
    fileType: string
    documentType?: string
    visibility?: string
  }
) {
  const userId = await getUserId()
  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(document).values({
    id,
    organizationId,
    userId,
    title: data.title,
    description: data.description,
    caseId: data.caseId,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileSize: data.fileSize,
    fileType: data.fileType,
    documentType: data.documentType,
    visibility: data.visibility || 'private',
    version: 1,
    isArchived: false,
  })

  revalidatePath(`/org/[slug]/documents`, 'layout')
  return id
}

export async function updateDocument(
  documentId: string,
  organizationId: string,
  data: Partial<typeof document.$inferInsert>
) {
  const userId = await getUserId()

  await db
    .update(document)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(document.id, documentId),
        eq(document.organizationId, organizationId),
        eq(document.userId, userId)
      )
    )

  revalidatePath(`/org/[slug]/documents`, 'layout')
}

export async function shareDocument(
  documentId: string,
  organizationId: string,
  sharedWith: string,
  permission: 'view' | 'edit' | 'comment' = 'view'
) {
  const userId = await getUserId()
  const id = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Verify document ownership
  const doc = await db
    .select()
    .from(document)
    .where(
      and(
        eq(document.id, documentId),
        eq(document.organizationId, organizationId),
        eq(document.userId, userId)
      )
    )

  if (!doc || doc.length === 0) {
    throw new Error('Document not found or access denied')
  }

  await db.insert(documentShare).values({
    id,
    documentId,
    sharedWith,
    sharedBy: userId,
    permission,
  })

  revalidatePath(`/org/[slug]/documents`, 'layout')
  return id
}

export async function deleteDocument(
  documentId: string,
  organizationId: string
) {
  const userId = await getUserId()

  await db
    .delete(document)
    .where(
      and(
        eq(document.id, documentId),
        eq(document.organizationId, organizationId),
        eq(document.userId, userId)
      )
    )

  revalidatePath(`/org/[slug]/documents`, 'layout')
}
