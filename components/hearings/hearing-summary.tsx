'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

export function HearingSummary({ transcript }: { transcript: string }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateSummary() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/hearings/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to generate summary')
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={generateSummary} disabled={loading || !transcript.trim()} variant="outline" className="gap-2">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {loading ? 'Generating summary…' : 'Generate AI summary'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {summary && <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6 whitespace-pre-wrap">{summary}</div>}
    </div>
  )
}
