'use client'

import { useState } from 'react'
import { HearingSummary } from './hearing-summary'

export function TranscriptSummaryPanel() {
  const [transcript, setTranscript] = useState('')
  return (
    <div className="space-y-4">
      <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Paste a hearing transcript here…" className="min-h-40 w-full rounded-md border border-input bg-background p-3 text-sm leading-6 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Hearing transcript" />
      <HearingSummary transcript={transcript} />
    </div>
  )
}
