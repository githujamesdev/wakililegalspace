'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { case_, document, documentShare, organization, user } from '@/lib/db/schema'
import { and, desc, eq, inArray, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
  MAX_FILE_BYTES,
  deleteStoredFile,
  extensionOf,
  isAllowedFile,
  saveFile,
} from '@/lib/documents/storage'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

/**
 * Records are written with either the organization primary key or its slug depending
 * on the caller, so every read has to accept both. Matching on one alone silently
 * hides rows (this is what left the dashboard empty).
 */
async function resolveOrgIds(organizationIdOrSlug: string) {
  const rows = await db
    .select({ id: organization.id, slug: organization.slug })
    .from(organization)
    .where(eq(organization.slug, organizationIdOrSlug))

  const org =
    rows[0] ||
    (
      await db
        .select({ id: organization.id, slug: organization.slug })
        .from(organization)
        .where(eq(organization.id, organizationIdOrSlug))
    )[0]

  const ids = new Set<string>([organizationIdOrSlug])
  if (org?.id) ids.add(org.id)
  if (org?.slug) ids.add(org.slug)

  return Array.from(ids)
}

export type DocumentListItem = {
  id: string
  title: string
  description: string | null
  caseId: string | null
  caseTitle: string | null
  fileName: string
  fileSize: number | null
  fileType: string | null
  documentType: string | null
  visibility: string
  createdAt: Date
  uploadedById: string
  uploadedBy: string
}

/**
 * Documents belong to the firm, not to whoever happened to upload them, so reads are
 * scoped to the organization. Rows marked `private` stay visible only to their owner.
 */
export async function getDocuments(
  organizationIdOrSlug: string,
  options: { caseId?: string; scope?: 'all' | 'case' | 'firm' } = {}
): Promise<DocumentListItem[]> {
  const userId = await getUserId()
  const orgIds = await resolveOrgIds(organizationIdOrSlug)

  const filters = [inArray(document.organizationId, orgIds), eq(document.isArchived, false)]

  if (options.caseId) filters.push(eq(document.caseId, options.caseId))
  else if (options.scope === 'firm') filters.push(isNull(document.caseId))

  const rows = await db
    .select({
      id: document.id,
      title: document.title,
      description: document.description,
      caseId: document.caseId,
      caseTitle: case_.title,
      fileName: document.fileName,
      fileSize: document.fileSize,
      fileType: document.fileType,
      documentType: document.documentType,
      visibility: document.visibility,
      createdAt: document.createdAt,
      uploadedById: document.userId,
      uploaderName: user.name,
    })
    .from(document)
    .leftJoin(case_, eq(case_.id, document.caseId))
    .leftJoin(user, eq(user.id, document.userId))
    .where(and(...filters))
    .orderBy(desc(document.createdAt))

  return rows
    .filter((row) => row.visibility !== 'private' || row.uploadedById === userId)
    .map(({ uploaderName, ...row }) => ({
      ...row,
      uploadedBy: row.uploadedById === userId ? 'You' : uploaderName || 'Unknown',
    }))
}

export async function getDocumentById(documentId: string, organizationIdOrSlug: string) {
  const userId = await getUserId()
  const orgIds = await resolveOrgIds(organizationIdOrSlug)

  const rows = await db
    .select()
    .from(document)
    .where(and(eq(document.id, documentId), inArray(document.organizationId, orgIds)))

  const doc = rows[0]
  if (!doc) return null
  if (doc.visibility === 'private' && doc.userId !== userId) return null

  return doc
}

/**
 * Accepts a FormData payload so the file never has to be base64'd through a JSON
 * boundary. Returns a result object rather than throwing so the dialog can render
 * a message inline.
 */
export async function uploadDocument(organizationIdOrSlug: string, formData: FormData) {
  let userId: string
  try {
    userId = await getUserId()
  } catch {
    return { success: false as const, error: 'You must be signed in to upload documents.' }
  }

  try {
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return { success: false as const, error: 'Choose a file to upload.' }
    }

    if (file.size > MAX_FILE_BYTES) {
      return {
        success: false as const,
        error: `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The limit is 10 MB.`,
      }
    }

    if (!isAllowedFile(file.name)) {
      return {
        success: false as const,
        error: `${extensionOf(file.name) || 'That'} files are not supported. Upload a PDF, Word, Excel, text or image file.`,
      }
    }

    const rawCaseId = String(formData.get('caseId') || '').trim()
    const caseId = rawCaseId && rawCaseId !== 'none' ? rawCaseId : null
    const orgIds = await resolveOrgIds(organizationIdOrSlug)

    // A document may hang off a matter or sit at firm level, but if a matter is named
    // it must be one this organization actually owns.
    let resolvedOrgId = orgIds[0]
    if (caseId) {
      const matter = await db
        .select({ id: case_.id, organizationId: case_.organizationId })
        .from(case_)
        .where(and(eq(case_.id, caseId), inArray(case_.organizationId, orgIds)))

      if (!matter[0]) {
        return { success: false as const, error: 'That matter could not be found in this firm.' }
      }
      resolvedOrgId = matter[0].organizationId
    }

    const title = String(formData.get('title') || '').trim() || file.name
    const description = String(formData.get('description') || '').trim() || null
    const documentType = String(formData.get('documentType') || '').trim() || null
    const visibility = String(formData.get('visibility') || 'team').trim() || 'team'

    const bytes = Buffer.from(await file.arrayBuffer())
    const { storageKey, size } = await saveFile(resolvedOrgId, file.name, bytes)

    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    await db.insert(document).values({
      id,
      organizationId: resolvedOrgId,
      userId,
      caseId,
      title,
      description,
      fileUrl: storageKey,
      fileName: file.name,
      fileSize: size,
      fileType: extensionOf(file.name),
      documentType,
      visibility,
      version: 1,
      isArchived: false,
    })

    revalidatePath('/org/[slug]/documents', 'page')
    revalidatePath('/org/[slug]/cases/[caseId]', 'page')

    return { success: true as const, id, title }
  } catch (error) {
    console.error('[v0] Upload document error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return { success: false as const, error: `Upload failed: ${message}` }
  }
}

export async function updateDocument(
  documentId: string,
  organizationIdOrSlug: string,
  data: Partial<typeof document.$inferInsert>
) {
  const userId = await getUserId()
  const orgIds = await resolveOrgIds(organizationIdOrSlug)

  // Only the uploader may edit metadata; storage fields are never client-writable.
  const { fileUrl, fileName, fileSize, fileType, organizationId, userId: _u, ...safe } = data

  await db
    .update(document)
    .set({ ...safe, updatedAt: new Date() })
    .where(
      and(
        eq(document.id, documentId),
        inArray(document.organizationId, orgIds),
        eq(document.userId, userId)
      )
    )

  revalidatePath('/org/[slug]/documents', 'page')
  revalidatePath('/org/[slug]/cases/[caseId]', 'page')
}

export async function shareDocument(
  documentId: string,
  organizationIdOrSlug: string,
  sharedWith: string,
  permission: 'view' | 'edit' | 'comment' = 'view'
) {
  const userId = await getUserId()
  const orgIds = await resolveOrgIds(organizationIdOrSlug)

  const doc = await db
    .select()
    .from(document)
    .where(and(eq(document.id, documentId), inArray(document.organizationId, orgIds)))

  if (!doc[0]) throw new Error('Document not found or access denied')

  const id = `share_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

  await db.insert(documentShare).values({
    id,
    documentId,
    sharedWith,
    sharedBy: userId,
    permission,
  })

  revalidatePath('/org/[slug]/documents', 'page')
  return id
}

export async function deleteDocument(documentId: string, organizationIdOrSlug: string) {
  try {
    const userId = await getUserId()
    const orgIds = await resolveOrgIds(organizationIdOrSlug)

    const rows = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.id, documentId),
          inArray(document.organizationId, orgIds),
          eq(document.userId, userId)
        )
      )

    const doc = rows[0]
    if (!doc) {
      return { success: false as const, error: 'Only the person who uploaded a document can delete it.' }
    }

    await db.delete(document).where(eq(document.id, documentId))
    await db.delete(documentShare).where(eq(documentShare.documentId, documentId))

    // Remove the bytes only after the row is gone, so a failed delete never leaves
    // a database row pointing at a file that no longer exists.
    if (doc.fileUrl) await deleteStoredFile(doc.fileUrl)

    revalidatePath('/org/[slug]/documents', 'page')
    revalidatePath('/org/[slug]/cases/[caseId]', 'page')

    return { success: true as const }
  } catch (error) {
    console.error('[v0] Delete document error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return { success: false as const, error: `Delete failed: ${message}` }
  }
}

/** Matter options for the upload dialog's "related matter" selector. */
export async function getMatterOptions(organizationIdOrSlug: string) {
  await getUserId()
  const orgIds = await resolveOrgIds(organizationIdOrSlug)

  return db
    .select({ id: case_.id, title: case_.title, caseNumber: case_.caseNumber })
    .from(case_)
    .where(inArray(case_.organizationId, orgIds))
    .orderBy(desc(case_.createdAt))
}
