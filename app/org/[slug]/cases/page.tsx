'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getMatters } from '@/app/actions/matters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Briefcase,
  AlertCircle,
  ChevronRight,
  Calendar,
  Users,
  FileText,
  Zap,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

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

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default function MattersPage() {
  const params = useParams()
  const slug = params.slug as string

  const [matters, setMatters] = useState<any[]>([])
  const [filteredMatters, setFilteredMatters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchMatters = async () => {
      try {
        const data = await getMatters(slug)
        setMatters(data)
        setFilteredMatters(data)
      } catch (error) {
        console.error('[v0] Error fetching matters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatters()
  }, [slug])

  useEffect(() => {
    const filtered = matters.filter(
      (matter) =>
        matter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matter.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matter.opponent?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMatters(filtered)
  }, [searchQuery, matters])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500">Loading matters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Matters</h1>
          <p className="text-slate-600 mt-1">Manage your legal cases and matters</p>
        </div>
        <Link href={`/org/${slug}/cases/new`} onClick={() => console.log('[v0] New Matter button clicked, navigating to:', `/org/${slug}/cases/new`)}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Matter
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search by title, case number, or opponent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-slate-300"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Total Matters</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{matters.length}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Open</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {matters.filter((m) => m.status === 'open').length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium">On Hold</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {matters.filter((m) => m.status === 'on-hold').length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Closed</p>
          <p className="text-2xl font-bold text-slate-600 mt-2">
            {matters.filter((m) => m.status === 'closed').length}
          </p>
        </Card>
      </div>

      {/* Matters List */}
      {filteredMatters.length > 0 ? (
        <div className="space-y-3">
          {filteredMatters.map((matter) => {
            const statusIcon = matter.status === 'open' 
              ? <Zap className="w-4 h-4" /> 
              : matter.status === 'on-hold' 
              ? <Clock className="w-4 h-4" />
              : <CheckCircle2 className="w-4 h-4" />
            
            return (
            <Link key={matter.id} href={`/org/${slug}/cases/${matter.id}`}>
              <Card className="p-5 border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Icon and Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <div className={`p-2.5 rounded-lg ${matter.status === 'open' ? 'bg-blue-100' : matter.status === 'on-hold' ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                          <Briefcase className={`w-5 h-5 ${matter.status === 'open' ? 'text-blue-600' : matter.status === 'on-hold' ? 'text-yellow-600' : 'text-slate-600'}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate text-base">
                          {matter.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className={`text-xs font-medium flex items-center gap-1 ${getStatusColor(matter.status)}`}>
                            {statusIcon}
                            {matter.status.replace('-', ' ')}
                          </Badge>
                          <Badge className={`text-xs font-medium ${getPriorityColor(matter.priority)}`}>
                            {matter.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Details Grid */}
                  <div className="hidden md:grid md:grid-cols-3 gap-6 flex-1">
                    {matter.caseNumber && (
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-1">Case Number</p>
                        <p className="text-sm text-slate-900 font-mono">{matter.caseNumber}</p>
                      </div>
                    )}
                    {matter.opponent && (
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-1">Opponent</p>
                        <p className="text-sm text-slate-900 truncate">{matter.opponent}</p>
                      </div>
                    )}
                    {matter.courtName && (
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-1">Court</p>
                        <p className="text-sm text-slate-900">{matter.courtName}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Date and Arrow */}
                  <div className="flex items-start gap-4 flex-shrink-0">
                    <div className="text-right hidden lg:block pt-1">
                      <p className="text-xs text-slate-500 font-semibold">Created</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{formatDate(matter.createdAt)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Card>
            </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-12 border border-slate-200">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium mb-2">
              {searchQuery
                ? 'No matters match your search'
                : 'No matters yet'}
            </p>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Start by creating your first legal matter'}
            </p>
            {!searchQuery && (
              <Link href={`/org/${slug}/cases/new`} onClick={(e) => {
                console.log('[v0] New Matter button clicked')
              }}>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Matter
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
