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
        <Link href={`/org/${slug}/matters/new`}>
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
          {filteredMatters.map((matter) => (
            <Link key={matter.id} href={`/org/${slug}/matters/${matter.id}`}>
              <Card className="p-4 border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  {/* Left: Title and Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {matter.title}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge className={`text-xs ${getStatusColor(matter.status)}`}>
                            {matter.status}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(matter.priority)}`}>
                            {matter.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 min-w-0 px-6 hidden md:block">
                    <div className="space-y-1">
                      {matter.caseNumber && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Case:</span> {matter.caseNumber}
                        </div>
                      )}
                      {matter.opponent && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Opponent:</span> {matter.opponent}
                        </div>
                      )}
                      {matter.courtName && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Court:</span> {matter.courtName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Metadata */}
                  <div className="flex items-center gap-8 flex-shrink-0">
                    <div className="text-right hidden lg:block">
                      <p className="text-xs text-slate-500 font-medium">Created</p>
                      <p className="text-sm text-slate-900">{formatDate(matter.createdAt)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">
            {searchQuery
              ? 'No matters match your search'
              : 'No matters yet. Create one to get started!'}
          </p>
          {!searchQuery && (
            <Link href={`/org/${slug}/matters/new`}>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Matter
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
