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
  Briefcase,
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

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export default function CaseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const caseId = params.caseId as string

  const [matter, setMatter] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  // Sample matter data for reference
  const sampleMatter = {
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

      {/* Matter Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents Section */}
          <MatterDocumentsCard slug={slug} caseId={caseId} caseTitle={matter.title} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {matter.client && (
            <Card className="p-4 border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Client
              </h3>
              <p className="font-medium text-slate-900">{matter.client.name}</p>
              {matter.client.email && (
                <p className="text-sm text-slate-600 mt-1">{matter.client.email}</p>
              )}
              {matter.client.phone && (
                <p className="text-sm text-slate-600">{matter.client.phone}</p>
              )}
              <p className="text-xs text-slate-500 mt-2 capitalize">
                {matter.client.clientType}
              </p>
            </Card>
          )}

          <FinancialsCard matter={matter} slug={slug} />

          {/* Opponent Info */}
          {matter.opponent && (
            <Card className="p-4 border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Opposing Party</h3>
              <p className="text-slate-600">{matter.opponent}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
