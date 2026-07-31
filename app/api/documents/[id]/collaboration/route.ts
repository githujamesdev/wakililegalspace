import { NextRequest, NextResponse } from 'next/server'
import {
  lockDocument,
  unlockDocument,
  addDocumentComment,
  addDocumentCollaborator,
  getDocumentDetails,
} from '@/app/actions/document-collaboration'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id
    const details = await getDocumentDetails(documentId)
    return NextResponse.json(details)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id
    const body = await req.json()
    const { action, ...data } = body

    switch (action) {
      case 'lock':
        return NextResponse.json(await lockDocument(documentId))

      case 'unlock':
        return NextResponse.json(await unlockDocument(documentId))

      case 'comment':
        return NextResponse.json(
          await addDocumentComment(documentId, data.content, data.mentions, data.parentCommentId)
        )

      case 'add-collaborator':
        return NextResponse.json(
          await addDocumentCollaborator(documentId, data.userId, data.permission)
        )

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
