import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { document } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { mimeFor, readStoredFile } from '@/lib/documents/storage'

/**
 * Authenticated document download.
 *
 * Files are stored outside /public precisely so they cannot be fetched by guessing a
 * URL — every read goes through this route, which checks the session first and only
 * then streams the bytes off disk.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const rows = await db.select().from(document).where(eq(document.id, id))
    const doc = rows[0]

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Private documents stay with their uploader.
    if (doc.visibility === 'private' && doc.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let bytes: Buffer
    try {
      bytes = await readStoredFile(doc.fileUrl)
    } catch (error) {
      console.error('[v0] Document file missing on disk:', doc.fileUrl, error)
      return NextResponse.json(
        { error: 'The stored file is no longer available on this server.' },
        { status: 410 }
      )
    }

    const disposition = request.nextUrl.searchParams.get('download') === '1'
      ? 'attachment'
      : 'inline'

    // Encode the filename so non-ASCII names survive the header round trip.
    const asciiName = doc.fileName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '')

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': mimeFor(doc.fileName),
        'Content-Length': String(bytes.byteLength),
        'Content-Disposition': `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
        // Never let a shared cache hold on to firm documents.
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[v0] Document download error:', error)
    return NextResponse.json({ error: 'Failed to read the document' }, { status: 500 })
  }
}
