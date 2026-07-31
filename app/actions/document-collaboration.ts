'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  document,
  documentVersion,
  documentLock,
  documentComment,
  documentActivity,
  documentCollaborator,
} from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Lock document for editing
export async function lockDocument(documentId: string) {
  const userId = await getUserId()

  // Check if already locked by someone else
  const existingLock = await db
    .select()
    .from(documentLock)
    .where(eq(documentLock.documentId, documentId))
    .limit(1)

  if (existingLock.length > 0 && existingLock[0].lockedBy !== userId) {
    throw new Error('Document is locked by another user')
  }

  // Create or update lock
  const lockId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

  await db
    .insert(documentLock)
    .values({
      id: lockId,
      documentId,
      lockedBy: userId,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: documentLock.documentId,
      set: {
        lockedBy: userId,
        expiresAt,
      },
    })

  // Log activity
  await logDocumentActivity(documentId, userId, 'lock', { documentId })

  return { locked: true, expiresAt }
}

// Unlock document
export async function unlockDocument(documentId: string) {
  const userId = await getUserId()

  const lock = await db
    .select()
    .from(documentLock)
    .where(eq(documentLock.documentId, documentId))
    .limit(1)

  if (lock.length > 0 && lock[0].lockedBy !== userId) {
    throw new Error('You do not have permission to unlock this document')
  }

  await db.delete(documentLock).where(eq(documentLock.documentId, documentId))

  await logDocumentActivity(documentId, userId, 'unlock', { documentId })

  revalidatePath(`/org/[slug]/documents/${documentId}`)
  return { unlocked: true }
}

// Create new document version
export async function createDocumentVersion(
  documentId: string,
  fileUrl: string,
  fileName: string,
  fileSize: number,
  changes: string
) {
  const userId = await getUserId()

  // Get current version number
  const lastVersion = await db
    .select()
    .from(documentVersion)
    .where(eq(documentVersion.documentId, documentId))
    .orderBy(desc(documentVersion.versionNumber))
    .limit(1)

  const versionNumber = (lastVersion[0]?.versionNumber || 0) + 1
  const versionId = crypto.randomUUID()

  await db.insert(documentVersion).values({
    id: versionId,
    documentId,
    versionNumber,
    fileUrl,
    fileName,
    fileSize,
    changes,
    changedBy: userId,
  })

  // Update document version
  await db.update(document).set({ version: versionNumber }).where(eq(document.id, documentId))

  // Log activity
  await logDocumentActivity(documentId, userId, 'version-created', {
    versionNumber,
    changes,
  })

  revalidatePath(`/org/[slug]/documents`)
  return { versionId, versionNumber }
}

// Get document version history
export async function getDocumentVersionHistory(documentId: string) {
  const userId = await getUserId()

  const versions = await db
    .select()
    .from(documentVersion)
    .where(eq(documentVersion.documentId, documentId))
    .orderBy(desc(documentVersion.versionNumber))

  return versions
}

// Add comment to document
export async function addDocumentComment(
  documentId: string,
  content: string,
  mentions: string[] = [],
  parentCommentId?: string
) {
  const userId = await getUserId()

  const commentId = crypto.randomUUID()

  await db.insert(documentComment).values({
    id: commentId,
    documentId,
    userId,
    content,
    mentions,
    parentCommentId: parentCommentId || null,
  })

  // Log activity
  await logDocumentActivity(documentId, userId, 'comment', {
    commentId,
    mentions: mentions.length,
  })

  revalidatePath(`/org/[slug]/documents/${documentId}`)
  return { commentId }
}

// Get document comments
export async function getDocumentComments(documentId: string) {
  const comments = await db
    .select()
    .from(documentComment)
    .where(eq(documentComment.documentId, documentId))
    .orderBy(desc(documentComment.createdAt))

  return comments
}

// Resolve comment
export async function resolveComment(commentId: string) {
  const userId = await getUserId()

  const comment = await db
    .select()
    .from(documentComment)
    .where(eq(documentComment.id, commentId))
    .limit(1)

  if (!comment.length) throw new Error('Comment not found')

  await db.update(documentComment).set({ resolved: true }).where(eq(documentComment.id, commentId))

  await logDocumentActivity(comment[0].documentId, userId, 'comment-resolved', { commentId })

  revalidatePath(`/org/[slug]/documents/${comment[0].documentId}`)
  return { resolved: true }
}

// Add collaborator to document
export async function addDocumentCollaborator(
  documentId: string,
  collaboratorUserId: string,
  permission: 'view' | 'edit' | 'comment' | 'manage'
) {
  const userId = await getUserId()

  // Check if user has manage permission
  const collaboratorCheck = await db
    .select()
    .from(documentCollaborator)
    .where(and(eq(documentCollaborator.documentId, documentId), eq(documentCollaborator.userId, userId)))
    .limit(1)

  if (collaboratorCheck.length === 0 || collaboratorCheck[0].permission !== 'manage') {
    throw new Error('You do not have permission to add collaborators')
  }

  const collaboratorId = crypto.randomUUID()

  await db.insert(documentCollaborator).values({
    id: collaboratorId,
    documentId,
    userId: collaboratorUserId,
    permission,
    addedBy: userId,
  })

  await logDocumentActivity(documentId, userId, 'collaborator-added', {
    collaboratorUserId,
    permission,
  })

  revalidatePath(`/org/[slug]/documents/${documentId}`)
  return { collaboratorId }
}

// Get document collaborators
export async function getDocumentCollaborators(documentId: string) {
  const collaborators = await db
    .select()
    .from(documentCollaborator)
    .where(eq(documentCollaborator.documentId, documentId))
    .orderBy(desc(documentCollaborator.addedAt))

  return collaborators
}

// Remove collaborator
export async function removeDocumentCollaborator(documentId: string, collaboratorId: string) {
  const userId = await getUserId()

  // Check manage permission
  const collaboratorCheck = await db
    .select()
    .from(documentCollaborator)
    .where(and(eq(documentCollaborator.documentId, documentId), eq(documentCollaborator.userId, userId)))
    .limit(1)

  if (collaboratorCheck.length === 0 || collaboratorCheck[0].permission !== 'manage') {
    throw new Error('You do not have permission to remove collaborators')
  }

  const toRemove = await db
    .select()
    .from(documentCollaborator)
    .where(eq(documentCollaborator.id, collaboratorId))
    .limit(1)

  if (toRemove.length === 0) throw new Error('Collaborator not found')

  await db.delete(documentCollaborator).where(eq(documentCollaborator.id, collaboratorId))

  await logDocumentActivity(documentId, userId, 'collaborator-removed', {
    removedUserId: toRemove[0].userId,
  })

  revalidatePath(`/org/[slug]/documents/${documentId}`)
}

// Get document activity feed
export async function getDocumentActivityFeed(documentId: string, limit = 50) {
  const activities = await db
    .select()
    .from(documentActivity)
    .where(eq(documentActivity.documentId, documentId))
    .orderBy(desc(documentActivity.createdAt))
    .limit(limit)

  return activities
}

// Helper: Log document activity
async function logDocumentActivity(
  documentId: string,
  userId: string,
  action: string,
  details: Record<string, unknown>
) {
  const activityId = crypto.randomUUID()

  await db.insert(documentActivity).values({
    id: activityId,
    documentId,
    userId,
    action,
    details,
  })
}

// Get document details with all collaboration info
export async function getDocumentDetails(documentId: string) {
  const userId = await getUserId()

  const doc = await db.select().from(document).where(eq(document.id, documentId)).limit(1)

  if (!doc.length) throw new Error('Document not found')

  // Get lock info
  const lock = await db
    .select()
    .from(documentLock)
    .where(eq(documentLock.documentId, documentId))
    .limit(1)

  // Get collaborators
  const collaborators = await db
    .select()
    .from(documentCollaborator)
    .where(eq(documentCollaborator.documentId, documentId))

  // Get recent activity
  const activities = await db
    .select()
    .from(documentActivity)
    .where(eq(documentActivity.documentId, documentId))
    .orderBy(desc(documentActivity.createdAt))
    .limit(10)

  // Log view
  await logDocumentActivity(documentId, userId, 'view', {})

  return {
    document: doc[0],
    lock: lock[0] || null,
    collaborators,
    activities,
  }
}
