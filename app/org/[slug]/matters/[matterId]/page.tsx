'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Briefcase,
  Clock,
  FileText,
  Calendar,
  CheckSquare,
  DollarSign,
  MessageSquare,
  Zap,
  Plus,
  MoreVertical,
  ArrowRight,
} from 'lucide-react'

export default function MatterWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string; matterId: string }>
}) {
  const [activeTab, setActiveTab] = useState('overview')

  // Sample matter data
  const matter = {
    id: 'matter_1',
    title: 'Smith v. Jones',
    client: 'John Smith',
    status: 'Active',
    priority: 'High',
    balance: 5200,
    advocate: 'You',
    partner: 'Sarah Johnson',
    nextCourtDate: '2026-08-15',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* HEADER */}
      <div className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-950">{matter.title}</h1>
              <p className="text-sm text-slate-600 mt-1">Client: {matter.client}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <MoreVertical className="w-4 h-4" />
              Options
            </Button>
          </div>

          {/* MATTER QUICK STATS */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-slate-600">Status</p>
              <p className="font-semibold text-blue-900 mt-1">{matter.status}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-slate-600">Priority</p>
              <p className="font-semibold text-amber-900 mt-1">{matter.priority}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs text-slate-600">Outstanding Balance</p>
              <p className="font-semibold text-green-900 mt-1">₦{matter.balance.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-xs text-slate-600">Next Court Date</p>
              <p className="font-semibold text-purple-900 mt-1">{matter.nextCourtDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS & CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-13 mb-8 bg-slate-100 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="court" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Court Attendances
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Receipts
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Audit
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-2 space-y-6">
                {/* Matter Status Card */}
                <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Matter Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Assigned Advocate</p>
                        <p className="font-semibold text-slate-900">{matter.advocate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Partner</p>
                        <p className="font-semibold text-slate-900">{matter.partner}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Open Tasks */}
                <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base">Open Tasks</CardTitle>
                    <Button size="sm" variant="ghost" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: 'File motion for summary judgment', due: '2026-07-25', priority: 'high' },
                        { title: 'Prepare witness testimony', due: '2026-08-10', priority: 'medium' },
                        { title: 'Review discovery documents', due: '2026-08-05', priority: 'medium' },
                      ].map((task, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                          <input type="checkbox" className="w-4 h-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{task.title}</p>
                            <p className="text-xs text-slate-500">Due: {task.due}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {task.priority}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Documents */}
                <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base">Recent Documents</CardTitle>
                    <Button size="sm" variant="ghost" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Upload
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Court Brief - Final.pdf', date: '2026-07-20' },
                        { name: 'Discovery Responses.docx', date: '2026-07-18' },
                        { name: 'Client Agreement.pdf', date: '2026-07-15' },
                      ].map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                            <p className="text-xs text-slate-500">{doc.date}</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* Recent Payments */}
                <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { amount: 2000, date: '2026-07-20', status: 'Paid' },
                      { amount: 1500, date: '2026-07-10', status: 'Paid' },
                      { amount: 1000, date: '2026-06-30', status: 'Paid' },
                    ].map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">₦{payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{payment.date}</p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Communications */}
                <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Communications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { from: 'Client', message: 'Sent hearing date', date: '2026-07-20' },
                      { from: 'Partner', message: 'Reviewed documents', date: '2026-07-18' },
                    ].map((msg, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{msg.from}</p>
                          <p className="text-xs text-slate-500">{msg.date}</p>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{msg.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Summary */}
                <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm border-blue-200/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      AI Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="p-3 rounded bg-white/60 border border-blue-200">
                      <p className="text-slate-700">
                        <span className="font-semibold">Next action:</span> File motion by July 25
                      </p>
                    </div>
                    <div className="p-3 rounded bg-white/60 border border-blue-200">
                      <p className="text-slate-700">
                        <span className="font-semibold">Risk alert:</span> Witness availability confirmation needed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* OTHER TABS - PLACEHOLDER */}
          {['timeline', 'court', 'tasks', 'calendar', 'documents', 'invoices', 'payments', 'receipts', 'communications', 'billing', 'ai', 'audit'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="capitalize">{tab}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Content for {tab} tab will be implemented here</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
