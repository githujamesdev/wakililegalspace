import { getDashboardData } from '@/app/actions/dashboard'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowRight, Bell, Briefcase, Calendar, CheckCircle2, DollarSign, Plus, Zap } from 'lucide-react'

const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const formatTime = (date: Date | null) => date ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(date)) : '—'
const formatDate = (date: Date | null) => date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date)) : 'No date'

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const data = await getDashboardData(slug)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const cards = [
    ['Active matters', data.metrics.activeMatters, Briefcase],
    ["Today's hearings", data.metrics.todaysHearings, Calendar],
    ['Tasks due today', data.metrics.tasksDueToday, CheckCircle2],
    ['Outstanding fees', formatMoney(data.metrics.outstandingFees), DollarSign],
  ] as const

  return <div className="min-h-full bg-muted/40"><header className="border-b bg-card"><div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8"><div><div className="mb-2 text-xs text-muted-foreground">Overview / Dashboard</div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{greeting}, {session.user.name || 'User'}</h1><p className="mt-1 text-sm text-muted-foreground">{new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())}</p></div><Button asChild className="gap-2"><Link href={`/org/Kes{slug}/cases/new`}><Plus data-icon="inline-start" /> New matter</Link></Button></div></header><main className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">
    <div className="mb-6 flex items-center gap-3 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"><Bell className="size-4 shrink-0 text-blue-700" /><span><strong>Practice overview:</strong> Live data from {data.organizationName}.</span><Link href={`/org/Kes{slug}/calendar`} className="ml-auto hidden font-medium text-blue-700 hover:underline sm:block">View calendar</Link></div>
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <Card key={label} className="rounded border shadow-sm"><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div><div className="flex size-10 items-center justify-center rounded bg-muted"><Icon className="size-5 text-primary" /></div></CardContent></Card>)}</section>
    <div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]"><Card className="rounded border shadow-sm"><CardHeader className="flex-row items-center justify-between border-b px-5 py-4"><div><CardTitle className="text-base">Upcoming hearings</CardTitle><p className="mt-1 text-xs text-muted-foreground">Scheduled court appearances</p></div><Button asChild variant="outline" size="sm"><Link href={`/org/Kes{slug}/calendar`}>Full calendar <ArrowRight data-icon="inline-end" /></Link></Button></CardHeader><CardContent className="p-0"><div className="divide-y">{data.upcomingHearings.length ? data.upcomingHearings.map((hearing) => <div key={`Kes{hearing.title}-Kes{hearing.startTime.toISOString()}`} className="flex items-center gap-4 px-5 py-4"><div className="w-20 shrink-0 text-sm font-semibold">{formatTime(hearing.startTime)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{hearing.title}</p><p className="mt-1 text-xs text-muted-foreground">{hearing.location || 'Location not set'}</p></div><Badge>Upcoming</Badge></div>) : <p className="px-5 py-8 text-sm text-muted-foreground">No upcoming hearings.</p>}</div></CardContent></Card><Card className="rounded border shadow-sm"><CardHeader className="border-b px-5 py-4"><CardTitle className="text-base">Upcoming tasks</CardTitle></CardHeader><CardContent className="p-0"><div className="divide-y">{data.upcomingTasks.length ? data.upcomingTasks.map((item) => <div key={item.title} className="flex items-center gap-3 px-5 py-4"><div className="size-2 rounded-full bg-amber-500" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">Due {formatDate(item.dueDate)}</p></div><Badge variant={item.priority === 'high' ? 'destructive' : 'outline'}>{item.priority}</Badge></div>) : <p className="px-5 py-8 text-sm text-muted-foreground">No upcoming tasks.</p>}</div></CardContent></Card></div>
    <Card className="mt-6 rounded border shadow-sm"><CardHeader className="flex-row items-center justify-between border-b px-5 py-4"><div><CardTitle className="text-base">Active matters</CardTitle><p className="mt-1 text-xs text-muted-foreground">Open matters requiring attention</p></div><Button asChild variant="ghost" size="sm"><Link href={`/org/Kes{slug}/cases`}>View all <ArrowRight data-icon="inline-end" /></Link></Button></CardHeader><CardContent className="p-0"><div className="divide-y">{data.activeMatters.length ? data.activeMatters.map((matter) => <div key={matter.id} className="flex items-center gap-4 px-5 py-4"><div className="flex size-9 items-center justify-center rounded bg-muted"><Briefcase className="size-4 text-primary" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{matter.title}</p><p className="mt-1 text-xs text-muted-foreground">{matter.clientName}</p></div><div className="hidden text-right sm:block"><p className="text-xs text-muted-foreground">Target {formatDate(matter.targetDate)}</p></div><Badge>{matter.status}</Badge></div>) : <p className="px-5 py-8 text-sm text-muted-foreground">No active matters.</p>}</div></CardContent></Card>
    <Card className="mt-6 rounded border shadow-sm"><CardHeader className="border-b px-5 py-4"><CardTitle className="flex items-center gap-2 text-base"><Zap className="size-4 text-amber-600" /> Practice insights</CardTitle></CardHeader><CardContent className="grid gap-3 p-5 sm:grid-cols-3"><div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm"><AlertCircle className="mb-2 size-4 text-amber-700" /><strong>{data.metrics.tasksDueToday}</strong> tasks due today.</div><div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm"><Calendar className="mb-2 size-4 text-blue-700" /><strong>{data.metrics.todaysHearings}</strong> hearings today.</div><div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm"><DollarSign className="mb-2 size-4 text-rose-700" /><strong>{formatMoney(data.metrics.outstandingFees)}</strong> overdue fees.</div></CardContent></Card>
  </main></div>
}


// import { auth } from '@/lib/auth'
// import { headers } from 'next/headers'
// import { redirect } from 'next/navigation'
// import Link from 'next/link'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import {
//   AlertCircle,
//   ArrowRight,
//   Bell,
//   Briefcase,
//   Calendar,
//   CheckCircle2,
//   Clock,
//   DollarSign,
//   FileText,
//   Plus,
//   Zap,
// } from 'lucide-react'

// const metricCards = [
//   { label: 'Active matters', value: '12', detail: '+2 this month', note: '7 require attention', icon: Briefcase, tone: 'text-blue-700', iconBg: 'bg-blue-50' },
//   { label: "Today's hearings", value: '3', detail: 'Upcoming today', note: 'Next hearing at 2:00 PM', icon: Calendar, tone: 'text-amber-700', iconBg: 'bg-amber-50' },
//   { label: 'Tasks due today', value: '8', detail: '5 completed', note: '3 pending review', icon: CheckCircle2, tone: 'text-emerald-700', iconBg: 'bg-emerald-50' },
//   { label: 'Outstanding fees', value: 'Kes24,580', detail: '5 invoices', note: '2 invoices overdue', icon: DollarSign, tone: 'text-rose-700', iconBg: 'bg-rose-50' },
// ]

// const hearings = [
//   { time: '10:00 AM', matter: 'Smith v. Jones', court: 'High Court', status: 'Completed' },
//   { time: '2:00 PM', matter: 'ABC Corp Dispute', court: 'District Court', status: 'Upcoming' },
//   { time: '4:30 PM', matter: 'Estate Review', court: 'Probate Court', status: 'Upcoming' },
// ]

// const deadlines = [
//   { date: 'Today', task: 'File motion', priority: 'High' },
//   { date: 'Tomorrow', task: 'Client update call', priority: 'Medium' },
//   { date: 'Jul 23', task: 'Trial preparation', priority: 'High' },
// ]

// export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
//   const { slug } = await params
//   const session = await auth.api.getSession({ headers: await headers() })
//   if (!session?.user) redirect('/sign-in')

//   const userName = session.user.name || 'User'
//   const hour = new Date().getHours()
//   const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
//   const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

//   return (
//     <div className="min-h-full bg-muted/40">
//       <header className="border-b bg-card">
//         <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><span>Overview</span><span>/</span><span>Dashboard</span></div>
//             <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{greeting}, {userName}</h1>
//             <p className="mt-1 text-sm text-muted-foreground">{date}</p>
//           </div>
//           {/* <Button asChild className="w-fit gap-2 bg-primary shadow-sm"><Link href={`/org/Kes{slug}/cases/new`}><Plus data-icon="inline-start" /> New matter</Link></Button> */}
//         </div>
//       </header>

//       <main className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">
//         <div className="mb-6 flex items-center gap-3 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
//           <Bell className="size-4 shrink-0 text-blue-700" />
//           <span><strong>Upcoming hearing:</strong> Smith v. Jones begins at 2:00 PM in District Court.</span>
//           <Link href={`/org/Kes{slug}/calendar`} className="ml-auto hidden font-medium text-blue-700 hover:underline sm:block">View calendar</Link>
//         </div>

//         <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Practice metrics">
//           {metricCards.map((metric) => (
//             <Card key={metric.label} className="rounded border shadow-sm">
//               <CardContent className="flex items-start justify-between p-5">
//                 <div><p className="text-sm font-medium text-muted-foreground">{metric.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{metric.value}</p><p className={`mt-2 text-xs font-medium Kes{metric.tone}`}>{metric.detail}</p><p className="mt-1 text-xs text-muted-foreground">{metric.note}</p></div>
//                 <div className={`flex size-10 items-center justify-center rounded Kes{metric.iconBg}`}><metric.icon className={`size-5 Kes{metric.tone}`} /></div>
//               </CardContent>
//             </Card>
//           ))}
//         </section>

//         <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
//           <Card className="rounded border shadow-sm">
//             <CardHeader className="flex-row items-center justify-between border-b px-5 py-4"><div><CardTitle className="text-base">Today&apos;s hearing schedule</CardTitle><p className="mt-1 text-xs text-muted-foreground">Court appearances and locations for today</p></div><Button asChild variant="outline" size="sm"><Link href={`/org/Kes{slug}/calendar`}>Full calendar <ArrowRight data-icon="inline-end" /></Link></Button></CardHeader>
//             <CardContent className="p-0"><div className="divide-y">{hearings.map((hearing) => <div key={`Kes{hearing.time}-Kes{hearing.matter}`} className="flex items-center gap-4 px-5 py-4"><div className="w-20 shrink-0 text-sm font-semibold text-foreground">{hearing.time}</div><div className="flex size-9 shrink-0 items-center justify-center rounded bg-muted"><Calendar className="size-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{hearing.matter}</p><p className="mt-1 text-xs text-muted-foreground">{hearing.court}</p></div><Badge variant={hearing.status === 'Completed' ? 'secondary' : 'default'}>{hearing.status}</Badge></div>)}</div></CardContent>
//           </Card>

//           <Card className="rounded border shadow-sm">
//             <CardHeader className="border-b px-5 py-4"><CardTitle className="text-base">Upcoming deadlines</CardTitle><p className="mt-1 text-xs text-muted-foreground">Items requiring follow-up</p></CardHeader>
//             <CardContent className="p-0"><div className="divide-y">{deadlines.map((deadline) => <div key={deadline.task} className="flex items-center gap-3 px-5 py-4"><div className={`size-2 rounded-full Kes{deadline.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`} /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{deadline.task}</p><p className="mt-1 text-xs text-muted-foreground">Due {deadline.date}</p></div><Badge variant={deadline.priority === 'High' ? 'destructive' : 'outline'}>{deadline.priority}</Badge></div>)}</div></CardContent>
//           </Card>
//         </div>

//         <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
//           <Card className="rounded border shadow-sm"><CardHeader className="flex-row items-center justify-between border-b px-5 py-4"><div><CardTitle className="text-base">Active matters</CardTitle><p className="mt-1 text-xs text-muted-foreground">Recent activity across your practice</p></div><Button asChild variant="ghost" size="sm"><Link href={`/org/Kes{slug}/cases`}>View all <ArrowRight data-icon="inline-end" /></Link></Button></CardHeader><CardContent className="p-0"><div className="divide-y">{[{ name: 'Smith v. Jones', client: 'John Smith', status: 'Active', date: 'Aug 15, 2026', balance: 'Kes5,200' }, { name: 'ABC Corp Dispute', client: 'ABC Corp', status: 'Active', date: 'Sep 10, 2026', balance: 'Kes8,500' }, { name: 'Estate Review', client: 'Estate of Jane Doe', status: 'Pending', date: 'Jul 30, 2026', balance: 'Kes2,100' }].map((matter) => <div key={matter.name} className="flex items-center gap-4 px-5 py-4"><div className="flex size-9 shrink-0 items-center justify-center rounded bg-blue-50"><Briefcase className="size-4 text-blue-700" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{matter.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{matter.client}</p></div><div className="hidden text-right sm:block"><p className="text-xs text-muted-foreground">{matter.date}</p><p className="mt-1 text-sm font-semibold">{matter.balance}</p></div><Badge variant={matter.status === 'Active' ? 'default' : 'secondary'}>{matter.status}</Badge></div>)}</div></CardContent></Card>

//           <Card className="rounded border shadow-sm"><CardHeader className="border-b px-5 py-4"><CardTitle className="flex items-center gap-2 text-base"><Zap className="size-4 text-amber-600" /> Practice insights</CardTitle><p className="mt-1 text-xs text-muted-foreground">Priorities for today</p></CardHeader><CardContent className="flex flex-col gap-3 p-5"><div className="flex gap-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm"><AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" /><span><strong>3 overdue tasks</strong> need attention today.</span></div><div className="flex gap-3 rounded border border-rose-200 bg-rose-50 p-3 text-sm"><AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-700" /><span><strong>2 matters</strong> require court documents.</span></div><div className="flex gap-3 rounded border border-blue-200 bg-blue-50 p-3 text-sm"><Clock className="mt-0.5 size-4 shrink-0 text-blue-700" /><span>Your next hearing is in 1 hour.</span></div><Button className="mt-2 w-full" variant="outline">Review work plan</Button></CardContent></Card>
//         </div>

//         <Card className="mt-6 rounded border shadow-sm"><CardHeader className="border-b px-5 py-4"><CardTitle className="text-base">Practice activity</CardTitle></CardHeader><CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">{[{ icon: FileText, title: 'Document uploaded', item: 'Smith v. Jones - Court Brief', time: '2 hours ago' }, { icon: Calendar, title: 'Court appearance recorded', item: 'ABC Corp Dispute - Hearing', time: '4 hours ago' }, { icon: DollarSign, title: 'Invoice generated', item: 'Invoice #INV-2026-085', time: '1 day ago' }, { icon: CheckCircle2, title: 'Task completed', item: 'Client intake interview - Smith', time: '1 day ago' }].map((activity) => <div key={activity.title} className="flex gap-3"><div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted"><activity.icon className="size-4 text-muted-foreground" /></div><div className="min-w-0"><p className="text-sm font-medium">{activity.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{activity.item}</p><p className="mt-1 text-xs text-muted-foreground">{activity.time}</p></div></div>)}</CardContent></Card>
//       </main>
//     </div>
//   )
// }
