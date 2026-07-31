'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Search, X } from 'lucide-react'
import CreateClientDrawer from './CreateClientDrawer'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

interface ClientSearchProps {
  onSelect: (client: Client) => void
}

export default function ClientSearch({ onSelect }: ClientSearchProps) {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  useEffect(() => {
    if (search.length > 0) {
      searchClients()
    } else {
      setClients([])
    }
  }, [search])

  const searchClients = async () => {
    setLoading(true)
    try {
      console.log('[v0] ClientSearch - Searching for:', search)
      const response = await fetch(
        `/api/clients/search?q=${encodeURIComponent(search)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        console.error('[v0] ClientSearch - API error:', response.status)
        setClients([])
        return
      }

      const data = await response.json()
      console.log('[v0] ClientSearch - Found clients:', data.clients?.length || 0)
      setClients(Array.isArray(data.clients) ? data.clients : [])
    } catch (error) {
      console.error('[v0] ClientSearch - Network error:', error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    onSelect(client)
    setSearch('')
    setClients([])
  }

  const handleClientCreated = (newClient: Client) => {
    handleSelectClient(newClient)
    setShowCreateDrawer(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search existing clients... (type to search)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {search && (
        <div className="space-y-2">
          {loading && (
            <div className="p-4 text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Searching for clients...
              </div>
            </div>
          )}

          {!loading && clients.length === 0 && search.length > 0 && (
            <div className="p-4 text-sm bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-slate-700">
                No clients found matching <span className="font-semibold">"{search}"</span>
              </p>
              <p className="text-slate-600 text-xs mt-1">Create a new client using the button below.</p>
            </div>
          )}

          {clients.map((client) => (
            <Card
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className="p-4 cursor-pointer hover:bg-blue-50 transition-all border border-slate-200 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{client.name}</p>
                  {client.email && <p className="text-sm text-slate-600">{client.email}</p>}
                  {client.phone && <p className="text-sm text-slate-500">{client.phone}</p>}
                </div>
                <Button size="sm" variant="outline" className="ml-3">
                  Select
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!selectedClient && (
        <Button
          onClick={() => setShowCreateDrawer(true)}
          variant="outline"
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Client
        </Button>
      )}

      {selectedClient && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">{selectedClient.name}</p>
              <p className="text-sm text-green-700">{selectedClient.email}</p>
            </div>
            <button
              onClick={() => {
                setSelectedClient(null)
                onSelect(null)
              }}
              className="text-green-600 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      <CreateClientDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
        onClientCreated={handleClientCreated}
      />
    </div>
  )
}
