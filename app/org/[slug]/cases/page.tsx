'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getMatters } from '@/app/actions/matters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Briefcase, ChevronRight, Clock, FileDown, Plus, Search, SlidersHorizontal } from 'lucide-react'

const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
const statusLabel = (status: string) => status.replace('-', ' ')
const statusClass = (status: string) => status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' : status === 'on-hold' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
const priorityClass = (priority: string) => priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'

export default function MattersPage() {
  const { slug } = useParams() as { slug: string }
  const [matters, setMatters] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMatters(slug).then(setMatters).catch(() => setMatters([])).finally(() => setLoading(false))
  }, [slug])

  const filteredMatters = useMemo(() => matters.filter((matter) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query || [matter.title, matter.caseNumber, matter.opponent, matter.courtName].some((value) => value?.toLowerCase().includes(query))
    return matchesSearch && (statusFilter === 'all' || matter.status === statusFilter)
  }), [matters, searchQuery, statusFilter])

  if (loading) return <div className="flex min-h-96 items-center justify-center text-muted-foreground">Loading matters...</div>

  return (
    <main className="min-h-full bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border bg-card px-5 py-4 shadow-sm">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal practice</p><h1 className="text-3xl font-semibold tracking-tight">Matters</h1><p className="text-sm text-muted-foreground">Manage your legal cases and matters</p></div>
        <Link href={`/org/${slug}/cases/new`}><Button><Plus data-icon="inline-start" /> New Matter</Button></Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 border bg-card p-4 shadow-sm lg:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search title, case number, opponent, or court" className="pl-9" /></div>
        <div className="flex gap-2"><SlidersHorizontal className="mt-2.5 size-4 text-muted-foreground" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border-input bg-background px-3 text-sm"><option value="all">All statuses</option><option value="open">Open</option><option value="on-hold">On hold</option><option value="closed">Closed</option></select><Button variant="outline" onClick={() => window.print()}><FileDown data-icon="inline-start" /> Export</Button></div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Total matters" value={matters.length} /><Stat label="Open" value={matters.filter((m) => m.status === 'open').length} /><Stat label="On hold" value={matters.filter((m) => m.status === 'on-hold').length} /><Stat label="Closed" value={matters.filter((m) => m.status === 'closed').length} /></div>

      <Card className="overflow-hidden border-border shadow-sm">
        <div className="hidden grid-cols-[minmax(220px,1.6fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_130px_120px_32px] gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid"><span>Matter</span><span>Opponent</span><span>Court</span><span>Status</span><span>Created</span><span /></div>
        <div className="divide-y">
          {filteredMatters.map((matter) => <Link key={matter.id} href={`/org/${slug}/cases/${matter.id}`} className="grid gap-3 px-5 py-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(220px,1.6fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_130px_120px_32px] md:items-center md:gap-4"><div className="min-w-0"><p className="truncate font-semibold text-foreground">{matter.title}</p><p className="mt-1 truncate font-mono text-xs text-muted-foreground">{matter.caseNumber || 'No case number'}</p><div className="mt-2 md:hidden"><Badge variant="outline" className={statusClass(matter.status)}>{statusLabel(matter.status)}</Badge></div></div><div className="text-sm text-muted-foreground"><span className="mr-2 text-xs font-semibold uppercase text-muted-foreground md:hidden">Opponent:</span>{matter.opponent || '—'}</div><div className="text-sm text-muted-foreground"><span className="mr-2 text-xs font-semibold uppercase text-muted-foreground md:hidden">Court:</span>{matter.courtName || '—'}</div><div className="hidden md:block"><Badge variant="outline" className={statusClass(matter.status)}>{statusLabel(matter.status)}</Badge><Badge variant="outline" className={`ml-2 ${priorityClass(matter.priority)}`}>{matter.priority}</Badge></div><div className="text-sm text-muted-foreground"><span className="mr-2 text-xs font-semibold uppercase text-muted-foreground md:hidden">Created:</span>{formatDate(matter.createdAt)}</div><ChevronRight className="hidden size-4 text-muted-foreground md:block" /></Link>)}
          {!filteredMatters.length && <div className="px-5 py-16 text-center text-muted-foreground">{searchQuery || statusFilter !== 'all' ? 'No matters match your filters.' : 'No matters yet.'}</div>}
        </div>
      </Card>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) { return <Card className="p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></Card> }
