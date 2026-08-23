import { generateText, gateway } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const transcript = typeof body?.transcript === 'string' ? body.transcript.trim() : ''
  if (!transcript || transcript.length > 20000) return NextResponse.json({ error: 'Transcript is required and must be under 20,000 characters' }, { status: 400 })

  const result = await generateText({
    model: gateway('openai/o4-mini'),
    system: 'You are a legal practice assistant. Summarize hearing transcripts objectively. Do not provide legal advice. Return concise markdown with sections: Summary, Key points, Action items, Dates and deadlines.',
    prompt: transcript,
  })

  return NextResponse.json({ summary: result.text })
}
