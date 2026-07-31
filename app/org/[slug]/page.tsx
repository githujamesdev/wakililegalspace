import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  Clock,
  DollarSign,
  MessageSquare,
  FileText,
  Plus,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowRight,
  Bell,
  BookOpen,
} from 'lucide-react'



export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const userName = session.user.name || 'User'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const date = formatter.format(new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* HEADER */}
      <div className="border-b bg-white/100 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-950 tracking-tight">
                {greeting} {userName}
              </h1>
              <p className="text-sm text-slate-600 mt-1">{date}</p>
              {/* <p className="text-sm font-medium text-blue-600 mt-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Your next hearing begins in 1 hour
              </p> */}
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex flex-wrap gap-4">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-4">
                <Plus className="w-4 h-4" /> New Matter
              </Button>
              <Button size="sm" variant="outline" className="gap-4">
                <Users className="w-4 h-4" /> New Client
              </Button>
              <Button size="sm" variant="outline" className="gap-4">
                <Calendar className="w-4 h-4" /> Court Attendance
              </Button>
              {/* <Button size="sm" variant="outline" className="gap-4">
                <DollarSign className="w-4 h-4" /> Generate Invoice
              </Button> */}
              <Button size="sm" variant="outline" className="gap-4">
                <FileText className="w-4 h-4" /> Upload Document
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* PRIMARY KPI CARDS - 2 columns */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active Matters Card */}
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center justify-between">
                  Active Matters
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-blue-950">12</div>
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +2 this month
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-3">7 require immediate attention</p>
                <Button size="sm" variant="ghost" className="mt-3 h-8 w-full text-blue-600 hover:text-blue-700">
                  View Matters <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Today's Hearings Card */}
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center justify-between">
                  Today's Hearings
                  <Calendar className="w-5 h-5 text-amber-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-blue-950">3</div>
                  <span className="text-sm text-amber-600 font-medium">Upcoming today</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">Next hearing at 2:00 PM</p>
                <Button size="sm" variant="ghost" className="mt-3 h-8 w-full text-blue-600 hover:text-blue-700">
                  View Calendar <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Tasks Due Today Card */}
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center justify-between">
                  Tasks Due Today
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-blue-950">8</div>
                  <span className="text-sm text-green-600 font-medium">5 completed</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">3 pending - prioritize document review</p>
                <Button size="sm" variant="ghost" className="mt-3 h-8 w-full text-blue-600 hover:text-blue-700">
                  View Tasks <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Outstanding Fees Card */}
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center justify-between">
                  Outstanding Fees
                  <DollarSign className="w-5 h-5 text-red-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-blue-950">Ksh 24,580</div>
                  <span className="text-sm text-red-600 font-medium">5 invoices</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">2 invoices are overdue</p>
                <Button size="sm" variant="ghost" className="mt-3 h-8 w-full text-blue-600 hover:text-blue-700">
                  View Invoices <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Unread Messages Card */}
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center justify-between">
                  Unread Messages
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-blue-950">12</div>
                  <span className="text-sm text-blue-600 font-medium">3 from clients</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">From 8 unique conversations</p>
                <Button size="sm" variant="ghost" className="mt-3 h-8 w-full text-blue-600 hover:text-blue-700">
                  View Messages <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Documents Awaiting Review Card */}
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center justify-between">
                  Documents Awaiting Review
                  <FileText className="w-5 h-5 text-purple-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-blue-950">5</div>
                  <span className="text-sm text-purple-600 font-medium">2 urgent</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">Requires partner approval</p>
                <Button size="sm" variant="ghost" className="mt-3 h-8 w-full text-blue-600 hover:text-blue-700">
                  View Documents <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR - Hearings & Deadlines */}
          <div className="space-y-4">
            {/* Today's Hearings */}
            <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Today's Hearings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { time: '10:00 AM', case: 'Githu J. Ndungu', court: 'High Court' },
                
                ].map((hearing, idx) => (
                  <div key={idx} className="flex gap-3 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
                    <div className="text-xs font-bold text-blue-600 min-w-fit pt-0.5">{hearing.time}</div>
                    <div className="text-xs flex-1">
                      <p className="font-semibold text-slate-900">{hearing.case}</p>
                      <p className="text-slate-500">{hearing.court}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { date: 'Today', task: 'File motion', priority: 'high' },
                  { date: 'Tomorrow', task: 'Client update call', priority: 'medium' },
                  { date: 'Jul 31', task: 'Trial preparation', priority: 'high' },
                ].map((deadline, idx) => (
                  <div key={idx} className="flex gap-3 p-2 rounded-lg bg-slate-50/50 border border-slate-100/50">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${deadline.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="text-xs flex-1">
                      <p className="font-semibold text-slate-900">{deadline.task}</p>
                      <p className="text-slate-500">{deadline.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MAIN CONTENT SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Active Matters - Full Width */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-900">My Active Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Githu James', client: 'Githu James', advocate: 'You', status: 'Active', date: '2026-08-15', balance: 'KSh 5,200' },
                    // { name: 'ABC Corp Dispute', client: 'ABC Corp', advocate: 'Mary Chen', status: 'Active', date: '2026-09-10', balance: '$8,500' },
                    // { name: 'Estate Review', client: 'Estate of Jane Doe', advocate: 'You', status: 'Pending', date: '2026-07-30', balance: '$2,100' },
                  ].map((matter, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">{matter.name}</p>
                        <p className="text-xs text-slate-500">{matter.client}</p>
                      </div>
                      <div className="text-right text-xs space-y-1">
                        <p className="font-medium text-slate-700">{matter.date}</p>
                        <p className="text-red-600 font-semibold">{matter.balance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI INSIGHTS PANEL */}
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm border-blue-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-blue-950 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex gap-2 p-2 rounded bg-white/60 border border-blue-200/50">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700"><span className="font-semibold">3 overdue tasks</span> need your attention today</p>
                </div>
                <div className="flex gap-2 p-2 rounded bg-white/60 border border-blue-200/50">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700"><span className="font-semibold">2 matters</span> require court documents before August 5</p>
                </div>
                <div className="flex gap-2 p-2 rounded bg-white/60 border border-blue-200/50">
                  <Bell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700">Your hearing with <span className="font-semibold">Smith v. Jones</span> is in 1 hour</p>
                </div>
                <div className="flex gap-2 p-2 rounded bg-white/60 border border-blue-200/50">
                  <DollarSign className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700"><span className="font-semibold">2 invoices overdue</span> - send reminders today</p>
                </div>
              </div>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 gap-2 text-xs">
                <BookOpen className="w-3 h-3" />
                Generate Work Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="mt-8">
          <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-slate-900">Recent Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'James uploaded a document', item: 'Smith v. Jones - Court Brief', time: '2 hours ago' },
                  { action: 'Mary attended court appearance', item: 'ABC Corp Dispute - Hearing', time: '4 hours ago' },
                  { action: 'Peter generated an invoice', item: 'Invoice #INV-2026-085', time: '1 day ago' },
                  { action: 'Sarah completed a task', item: 'Client intake interview - Smith', time: '1 day ago' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex gap-4 p-3 rounded-lg border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900"><span className="font-semibold">{activity.action}</span></p>
                      <p className="text-xs text-slate-600 mt-1">{activity.item}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
