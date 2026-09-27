'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getMatterWithDetails } from '@/app/actions/matters'
import { FinancialsCard } from '@/components/matters/FinancialsCard'
import { MatterDocumentsCard } from '@/components/documents/MatterDocumentsCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft,
  User,
  AlertCircle,
  Loader,
} from 'lucide-react'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800'
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800'
    case 'closed':
      return 'bg-slate-100 text-slate-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-orange-100 text-orange-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export default function CaseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const caseId = params.caseId as string

  const [matter, setMatter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchMatter = async () => {
      try {
        const data = await getMatterWithDetails(caseId, slug)
        setMatter(data)
      } catch (error) {
        console.error('[v0] Error fetching matter:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatter()
  }, [caseId, slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!matter) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Matter not found</p>
      </div>
    )
  }

  const caseTabs = [
    { label: 'Overview', id: 'overview' },
    { label: 'Documents', id: 'documents' },
    { label: 'Financials', id: 'financials' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/org/${slug}/cases`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{matter.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge className={`text-xs ${getStatusColor(matter.status)}`}>
              {matter.status}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(matter.priority)}`}>
              {matter.priority}
            </Badge>
          </div>
        </div>
      </div>

      <nav aria-label="Case sections" className="overflow-x-auto rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm">
        <div className="flex min-w-max items-center gap-1">
          {caseTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`border-b-2 px-3 py-3 text-xs font-medium transition-colors ${activeTab === tab.id ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:border-emerald-300 hover:text-slate-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === 'overview' && (
        <>
      {/* Matter Info */}
      <div id="overview" className="grid grid-cols-1 md:grid-cols-4 gap-4 scroll-mt-6">
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Case Number</p>
          <p className="text-sm font-mono text-slate-900">{matter.caseNumber}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Type</p>
          <p className="text-sm text-slate-900 capitalize">{matter.caseType}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Court</p>
          <p className="text-sm text-slate-900">{matter.courtName || 'N/A'}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Judge</p>
          <p className="text-sm text-slate-900">{matter.judge || 'N/A'}</p>
        </Card>
      </div>

      {/* Description */}
      {matter.description && (
        <Card className="p-4 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
          <p className="text-slate-600">{matter.description}</p>
        </Card>
      )}
        </>
      )}

      {activeTab === 'documents' && (
        <section id="documents" className="scroll-mt-6">
          <MatterDocumentsCard slug={slug} caseId={caseId} caseTitle={matter.title} />
        </section>
      )}

      {activeTab === 'financials' && (
        <section id="financials" className="scroll-mt-6">
          <FinancialsCard matter={matter} slug={slug} />
        </section>
      )}

      {activeTab === 'overview' && matter.client && (
        <Card className="border-slate-200 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <User className="h-4 w-4 text-emerald-700" />
            Case Parties
          </h3>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <p><span className="font-medium">Client:</span> {matter.client.name}</p>
            {matter.opponent && <p><span className="font-medium">Opposing party:</span> {matter.opponent}</p>}
            {matter.client.email && <p><span className="font-medium">Email:</span> {matter.client.email}</p>}
            {matter.client.phone && <p><span className="font-medium">Phone:</span> {matter.client.phone}</p>}
          </div>
        </Card>
      )}
    </div>
  )
}
