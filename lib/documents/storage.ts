import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { del, get, put } from '@vercel/blob'

export const STORAGE_ROOT =
  process.env.DOCUMENT_STORAGE_DIR || path.join(process.cwd(), '.data', 'documents')

export const MAX_FILE_BYTES = 10 * 1024 * 1024

const ALLOWED: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  rtf: 'application/rtf',
  csv: 'text/csv',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
}

export const ACCEPTED_EXTENSIONS = Object.keys(ALLOWED)
export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')

export function extensionOf(fileName: string) {
  return path.extname(fileName).replace('.', '').toLowerCase()
}

export function isAllowedFile(fileName: string) {
  return Boolean(ALLOWED[extensionOf(fileName)])
}

export function mimeFor(fileName: string) {
  return ALLOWED[extensionOf(fileName)] || 'application/octet-stream'
}

export function formatBytes(bytes: number | null | undefined) {
  const size = Number(bytes)
  if (!Number.isFinite(size) || size <= 0) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function sanitizeFileName(fileName: string) {
  const base = path.basename(fileName || 'document')
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, 120)
  return cleaned || 'document'
}

export function resolveStoredPath(storageKey: string) {
  const absolute = path.resolve(STORAGE_ROOT, storageKey)
  const root = path.resolve(STORAGE_ROOT)
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    throw new Error('Refusing to access a path outside the document storage root')
  }
  return absolute
}

const isVercelRuntime = () => process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV)
const usesBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)
const blobKey = (key: string) => `documents/${key}`

function assertStorageAvailable() {
  if (isVercelRuntime() && !usesBlob()) {
    throw new Error(
      'Document storage is not configured for this deployment. Connect Vercel Blob and redeploy so BLOB_READ_WRITE_TOKEN is available.'
    )
  }
}

export async function saveFile(
  organizationId: string,
  fileName: string,
  bytes: Buffer
): Promise<{ storageKey: string; checksum: string; size: number }> {
  const now = new Date()
  const safeOrg = sanitizeFileName(organizationId)
  const key = path.posix.join(
    safeOrg,
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
    `${randomUUID()}__${sanitizeFileName(fileName)}`
  )

  const checksum = createHash('sha256').update(bytes).digest('hex')
  const contentType = mimeFor(fileName)

  assertStorageAvailable()

  if (usesBlob()) {
    const blob = await put(blobKey(key), bytes, {
      access: 'private',
      contentType,
      addRandomSuffix: false,
    })
    return { storageKey: `blob:${blob.pathname}`, checksum, size: bytes.byteLength }
  }

  const absolute = resolveStoredPath(key)
  await mkdir(path.dirname(absolute), { recursive: true })
  await writeFile(absolute, bytes)
  return { storageKey: `local:${key}`, checksum, size: bytes.byteLength }
}

export async function readStoredFile(storageKey: string) {
  if (storageKey.startsWith('blob:')) {
    const result = await get(storageKey.slice(5), { access: 'private' })
    if (!result || result.statusCode === 304) throw new Error('Document not found')
    return Buffer.from(await new Response(result.stream).arrayBuffer())
  }
  return readFile(resolveStoredPath(storageKey.replace(/^local:/, '')))
}

export async function deleteStoredFile(storageKey: string) {
  try {
    if (storageKey.startsWith('blob:')) {
      await del(storageKey.slice(5))
    } else {
      await unlink(resolveStoredPath(storageKey.replace(/^local:/, '')))
    }
    return true
  } catch {
    return false
  }
}


// import { createHash, randomUUID } from 'node:crypto'
// import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
// import path from 'node:path'

// /**
//  * Local filesystem document storage.
//  *
//  * Files are written under STORAGE_ROOT using an org-scoped, date-partitioned key:
//  *   <organizationId>/<yyyy>/<mm>/<uuid>__<safe-name>
//  *
//  * The key (not an absolute path) is what gets persisted in document.fileUrl, so the
//  * storage root can move between environments without rewriting database rows.
//  *
//  * NOTE: files live on the server's disk. A redeploy or a move to serverless will not
//  * carry them across — migrate to object storage before deploying to Vercel.
//  */
// export const STORAGE_ROOT =
//   process.env.DOCUMENT_STORAGE_DIR || path.join(process.cwd(), '.data', 'documents')

// export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

// /** Extension -> mime. Only these are accepted; anything else is rejected outright. */
// const ALLOWED: Record<string, string> = {
//   pdf: 'application/pdf',
//   doc: 'application/msword',
//   docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   xls: 'application/vnd.ms-excel',
//   xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   txt: 'text/plain',
//   rtf: 'application/rtf',
//   csv: 'text/csv',
//   jpg: 'image/jpeg',
//   jpeg: 'image/jpeg',
//   png: 'image/png',
//   webp: 'image/webp',
//   tif: 'image/tiff',
//   tiff: 'image/tiff',
// }

// export const ACCEPTED_EXTENSIONS = Object.keys(ALLOWED)
// export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')

// export function extensionOf(fileName: string) {
//   return path.extname(fileName).replace('.', '').toLowerCase()
// }

// export function isAllowedFile(fileName: string) {
//   return Boolean(ALLOWED[extensionOf(fileName)])
// }

// export function mimeFor(fileName: string) {
//   return ALLOWED[extensionOf(fileName)] || 'application/octet-stream'
// }

// export function formatBytes(bytes: number | null | undefined) {
//   const size = Number(bytes)
//   if (!Number.isFinite(size) || size <= 0) return '—'
//   if (size < 1024) return `${size} B`
//   if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
//   return `${(size / (1024 * 1024)).toFixed(1)} MB`
// }

// /**
//  * Strip directory components and anything that could escape the storage root or
//  * upset the filesystem, while keeping the name recognisable to the user.
//  */
// export function sanitizeFileName(fileName: string) {
//   const base = path.basename(fileName || 'document')
//   const cleaned = base
//     .replace(/[^a-zA-Z0-9._-]+/g, '-')
//     .replace(/-{2,}/g, '-')
//     .replace(/^[-.]+/, '')
//     .slice(0, 120)

//   return cleaned || 'document'
// }

// /** Resolve a stored key to an absolute path, refusing anything outside the root. */
// export function resolveStoredPath(storageKey: string) {
//   const absolute = path.resolve(STORAGE_ROOT, storageKey)
//   const root = path.resolve(STORAGE_ROOT)

//   if (absolute !== root && !absolute.startsWith(root + path.sep)) {
//     throw new Error('Refusing to access a path outside the document storage root')
//   }

//   return absolute
// }

// export async function saveFile(
//   organizationId: string,
//   fileName: string,
//   bytes: Buffer
// ): Promise<{ storageKey: string; checksum: string; size: number }> {
//   const now = new Date()
//   const safeOrg = sanitizeFileName(organizationId)
//   const year = String(now.getFullYear())
//   const month = String(now.getMonth() + 1).padStart(2, '0')

//   const storageKey = path.posix.join(
//     safeOrg,
//     year,
//     month,
//     `${randomUUID()}__${sanitizeFileName(fileName)}`
//   )

//   const absolute = resolveStoredPath(storageKey)
//   await mkdir(path.dirname(absolute), { recursive: true })
//   await writeFile(absolute, bytes)

//   return {
//     storageKey,
//     checksum: createHash('sha256').update(bytes).digest('hex'),
//     size: bytes.byteLength,
//   }
// }

// export async function readStoredFile(storageKey: string) {
//   return readFile(resolveStoredPath(storageKey))
// }

// /** Best-effort delete: a missing file should not block removing the database row. */
// export async function deleteStoredFile(storageKey: string) {
//   try {
//     await unlink(resolveStoredPath(storageKey))
//     return true
//   } catch {
//     return false
//   }
// }
