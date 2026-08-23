import Link from 'next/link'
import { CalendarDays, ChevronRight, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDashboardData } from '@/app/actions/dashboard'
import { TranscriptSummaryPanel } from '@/components/hearings/transcript-summary-panel'

function formatDate(value: Date | string | null) {
  if (!value) return 'Date to be confirmed'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default async function HearingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getDashboardData(slug)

  return (
    <main className="min-h-full bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex items-center justify-between border-b bg-card px-5 py-4 shadow-sm">
        <div><p className="text-sm text-muted-foreground">Calendar / Hearings</p><h1 className="text-2xl font-semibold tracking-tight">Hearings</h1></div>
        <Button asChild><Link href={`/org/${slug}/calendar`}>Open calendar</Link></Button>
      </div>
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-muted-foreground">Upcoming hearings</p><p className="mt-2 text-3xl font-semibold">{data.upcomingHearings.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Today</p><p className="mt-2 text-3xl font-semibold">{data.metrics.todaysHearings}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Reminders</p><p className="mt-2 text-3xl font-semibold">Enabled</p></Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="overflow-hidden">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Upcoming schedule</h2></div>
        <div className="divide-y">{data.upcomingHearings.length ? data.upcomingHearings.map((hearing) => <div key={`${hearing.title}-${hearing.startTime}`} className="flex items-center justify-between gap-4 px-5 py-4"><div className="flex min-w-0 items-start gap-3"><div className="rounded-md bg-primary/10 p-2 text-primary"><CalendarDays className="size-4" /></div><div className="min-w-0"><p className="truncate font-medium">{hearing.title}</p><p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="size-3.5" />{formatDate(hearing.startTime)}</p>{hearing.location && <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-3.5" />{hearing.location}</p>}</div></div>{hearing.caseId && <Button asChild variant="ghost" size="icon"><Link href={`/org/${slug}/cases/${hearing.caseId}`} aria-label={`Open ${hearing.title}`}><ChevronRight className="size-4" /></Link></Button>}</div>) : <div className="px-5 py-12 text-center text-sm text-muted-foreground">No upcoming hearings scheduled.</div>}</div>
      </Card>
      <Card className="p-5"><div className="mb-4"><h2 className="font-semibold">AI hearing summary</h2><p className="mt-1 text-sm text-muted-foreground">Paste transcript notes to create an objective working summary.</p></div><TranscriptSummaryPanel /></Card>
      </div>
    </main>
  )
}
