'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, FileText, Users, MessageSquare, Calendar } from 'lucide-react'

const mockResults = [
  {
    id: '1',
    type: 'case',
    title: 'Smith v. Johnson',
    description: 'Litigation case - Motion brief and evidence files',
    date: '2024-05-15',
    icon: FileText,
  },
  {
    id: '2',
    type: 'client',
    title: 'John Smith',
    description: 'Individual client - 2 active cases',
    date: '2024-01-10',
    icon: Users,
  },
  {
    id: '3',
    type: 'document',
    title: 'Motion Brief - Smith v. Johnson',
    description: 'Filed on 2024-05-15',
    date: '2024-05-15',
    icon: FileText,
  },
  {
    id: '4',
    type: 'message',
    title: 'Discovery deadline discussion',
    description: 'Team conversation about case discovery phase',
    date: '2024-05-10',
    icon: MessageSquare,
  },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [results, setResults] = useState(mockResults)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length === 0) {
      setResults(mockResults)
    } else {
      setResults(
        mockResults.filter(
          (result) =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase())
        )
      )
    }
  }

  const filteredResults =
    filterType === 'all'
      ? results
      : results.filter((result) => result.type === filterType)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Search</h1>
        <p className="text-muted-foreground mt-2">
          Search across all cases, clients, documents, and communications
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases, clients, documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="case">Cases</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No results found</p>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <result.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {result.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {result.date}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
