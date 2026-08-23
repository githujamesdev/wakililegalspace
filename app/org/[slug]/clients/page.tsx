'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Users, 
  Building2, 
  TrendingUp, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchOrganizationClients, fetchClientStatistics, createClient } from '@/app/actions/fetch-clients'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ClientsPage() {
  const { slug } = useParams() as { slug: string }
  const [clients, setClients] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  
  // Dialog state
  const [showNewClientDialog, setShowNewClientDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [clientType, setClientType] = useState<'individual' | 'corporate'>('individual')
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    clientType: 'individual',
  })
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load clients and statistics
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [clientsResult, statsResult] = await Promise.all([
          fetchOrganizationClients(slug),
          fetchClientStatistics(slug),
        ])

        if (clientsResult.success) {
          setClients(clientsResult.clients)
        }
        if (statsResult.success) {
          setStatistics(statsResult.statistics)
        }
      } catch (error) {
        console.error('[v0] Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadData()
    }
  }, [slug])

  // Filter clients based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = clients.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.city?.toLowerCase().includes(query)
    )
    setFilteredClients(filtered)
  }, [clients, searchQuery])

  // Handle create client
  const handleCreateClient = async () => {
    try {
      setSubmitting(true)
      const result = await createClient(slug, {
        ...formData,
        clientType,
      })

      if (result.success) {
        setClients([...clients, result.client])
        setShowNewClientDialog(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          city: '',
          country: '',
        })
      }
    } catch (error) {
      console.error('[v0] Error creating client:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClient = (client: any) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      city: client.city,
      country: client.country,
      clientType: client.clientType,
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingClient || !formData.name.trim()) return

    setSubmitting(true)
    try {
      const { updateClient } = await import('@/app/actions/client-actions')
      await updateClient(editingClient.id, slug, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        clientType: formData.clientType,
      })

      setClients(
        clients.map((c) =>
          c.id === editingClient.id
            ? { ...c, ...formData }
            : c
        )
      )
      setShowEditDialog(false)
      setEditingClient(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        clientType: 'individual',
      })
    } catch (error) {
      console.error('[v0] Error updating client:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { deleteClient } = await import('@/app/actions/client-actions')
      await deleteClient(clientId, slug)
      setClients(clients.filter((c) => c.id !== clientId))
    } catch (error) {
      console.error('[v0] Error deleting client:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-muted/40 p-4 sm:p-6 lg:p-8">
        <div className="h-12 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-muted/40 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Clients
          </h1>
          <p className="text-slate-600 mt-2">Manage your client relationships and matters</p>
        </div>
        <Button
          onClick={() => setShowNewClientDialog(true)}
          className="gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Client
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Clients"
          value={statistics?.totalClients || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Individuals"
          value={statistics?.individuals || 0}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Corporate"
          value={statistics?.corporate || 0}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Active"
          value={statistics?.active || 0}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="This Month"
          value={statistics?.newThisMonth || 0}
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(statistics?.outstandingBalance || 0)}
          icon={DollarSign}
          color="red"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone, ID or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
      </div>

  {/* Clients List */}
  <div className="overflow-hidden rounded border border-border bg-card shadow-sm">
  <div className="hidden grid-cols-[minmax(180px,1.3fr)_minmax(220px,1.4fr)_minmax(120px,0.8fr)_100px_140px_44px] gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid"><span>Client</span><span>Contact</span><span>Location</span><span>Matters</span><span>Outstanding</span><span /></div>
  <div className="divide-y">
  {filteredClients.length > 0 ? (
          filteredClients.map((c) => (
            <ClientListRow
              key={c.id}
              client={c}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {searchQuery ? 'No clients match your search' : 'No clients yet. Create one to get started!'}
            </p>
          </div>
        )}
      </div>
      </div>

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] bg-white overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle className="text-3xl font-bold">Add New Client</DialogTitle>
            <DialogDescription className="text-base">
              Create a new client profile in your organization
            </DialogDescription>
          </DialogHeader>

          <div className="px-1">
            <Tabs value={clientType} onValueChange={(value: any) => setClientType(value)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="individual" className="text-base py-3">Individual</TabsTrigger>
                <TabsTrigger value="corporate" className="text-base py-3">Corporate</TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-semibold">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-base font-semibold">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="border-2 border-slate-300 rounded-md px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+254 712 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="text-base font-semibold">National ID</Label>
                    <Input 
                      id="nationalId" 
                      placeholder="ID number" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport" className="text-base font-semibold">Passport</Label>
                    <Input 
                      id="passport" 
                      placeholder="Passport number" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-base font-semibold">Occupation</Label>
                    <Input 
                      id="occupation" 
                      placeholder="Job title" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communication" className="text-base font-semibold">Preferred Communication</Label>
                    <Select>
                      <SelectTrigger className="border-2 border-slate-300 rounded-md px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t-2 pt-6">
                  <h4 className="text-lg font-semibold mb-6 text-slate-900">Address</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <Input 
                      placeholder="Physical Address" 
                      className="col-span-2 border-2 border-slate-300 rounded-md px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" 
                    />
                    <Input 
                      placeholder="Postal Address" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Input
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Input 
                      placeholder="Postal Code" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="corporate" className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-base font-semibold">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="ABC Corporation"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-base font-semibold">Industry</Label>
                    <Input 
                      id="industry" 
                      placeholder="e.g., Technology" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber" className="text-base font-semibold">Registration Number</Label>
                    <Input 
                      id="registrationNumber" 
                      placeholder="Company registration #" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kraPin" className="text-base font-semibold">KRA PIN</Label>
                    <Input 
                      id="kraPin" 
                      placeholder="Tax ID" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-base font-semibold">Contact Person</Label>
                    <Input 
                      id="contactPerson" 
                      placeholder="Name" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="info@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+254 712 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="border-t-2 pt-6">
                  <h4 className="text-lg font-semibold mb-6 text-slate-900">Address</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <Input 
                      placeholder="Physical Address" 
                      className="col-span-2 border-2 border-slate-300 rounded-md px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" 
                    />
                    <Input 
                      placeholder="Postal Address" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Input
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Input 
                      placeholder="Postal Code" 
                      className="h-10 rounded-md border-input bg-background px-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-3 justify-end pt-6 sticky bottom-0 bg-white border-t mt-6">
            <Button variant="outline" onClick={() => setShowNewClientDialog(false)} className="px-6 py-3 text-base">
              Cancel
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={!formData.name || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-base"
            >
              {submitting ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Client</DialogTitle>
            <DialogDescription>
              Update client information for {editingClient?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-semibold">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Client name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="font-semibold">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-2 border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="font-semibold">Phone</Label>
                <Input
                  id="edit-phone"
                  placeholder="+254 712 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-2 border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-city" className="font-semibold">City</Label>
                <Input
                  id="edit-city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-2 border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country" className="font-semibold">Country</Label>
                <Input
                  id="edit-country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="border-2 border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type" className="font-semibold">Client Type</Label>
              <Select value={formData.clientType} onValueChange={(value) => setFormData({ ...formData, clientType: value })}>
                <SelectTrigger id="edit-type" className="border-2 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!formData.name || submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    purple: 'bg-purple-50 text-purple-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
  }

  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">{title}</p>
            <p className="text-2xl font-bold mt-2 text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Client List Row Component
function ClientListRow({ client, onEdit, onDelete }: any) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800'
      case 'inactive':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getClientTypeColor = (type: string) => {
    return type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  }

  const handleDeleteClick = async () => {
    setIsDeleting(true)
    await onDelete(client.id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div className="grid gap-3 bg-card px-5 py-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(180px,1.3fr)_minmax(220px,1.4fr)_minmax(120px,0.8fr)_100px_140px_44px] md:items-center md:gap-4">
        <div className="min-w-0"><p className="truncate font-semibold text-foreground">{client.name}</p><div className="mt-1 flex gap-2"><span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(client.status)}`}>{client.status}</span><span className={`rounded px-2 py-0.5 text-xs font-medium ${getClientTypeColor(client.clientType)}`}>{client.clientType === 'individual' ? 'Individual' : 'Corporate'}</span></div></div>
        <div className="min-w-0 text-sm text-muted-foreground"><p className="truncate">{client.email || '—'}</p><p className="truncate text-xs">{client.phone || 'No phone number'}</p></div>
        <div className="text-sm text-muted-foreground">{client.city || '—'}</div>
        <div><span className="mr-2 text-xs uppercase text-muted-foreground md:hidden">Matters:</span><span className="font-semibold">{client.matterCount || 0}</span></div>
        <div className="font-semibold text-red-600">{formatCurrency(client.outstandingBalance || 0)}</div>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={() => onEdit(client)}><Edit data-icon="inline-start" /> Edit Client</DropdownMenuItem><DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600"><Trash2 data-icon="inline-start" /> Delete Client</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>
      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}><DialogContent><DialogHeader><DialogTitle>Delete Client</DialogTitle><DialogDescription>Are you sure you want to delete <span className="font-semibold">{client.name}</span>? This action cannot be undone.</DialogDescription></DialogHeader><div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteClick} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button></div></DialogContent></Dialog>
      )}
    </>
  )
}
