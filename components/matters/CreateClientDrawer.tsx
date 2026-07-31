'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, User, Mail, Phone } from 'lucide-react'
import { createClient } from '@/app/actions/clients'
import { useParams } from 'next/navigation'

interface CreateClientDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientCreated: (client: any) => void
}

export default function CreateClientDrawer({
  open,
  onOpenChange,
  onClientCreated,
}: CreateClientDrawerProps) {
  const params = useParams()
  const slug = params.slug as string

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    clientType: 'individual',
    taxId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createClient({
        ...formData,
      })

      if (result.success) {
        onClientCreated(result.client)
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          clientType: 'individual',
          taxId: '',
        })
        onOpenChange(false)
      } else {
        alert(result.error || 'Failed to create client')
      }
    } catch (error) {
      console.error('[v0] Client creation error:', error)
      alert('An error occurred while creating the client')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200">
        <DialogHeader className="pb-4">
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Add New Client
            </DialogTitle>
            <DialogDescription className="text-base text-slate-600">
              Create a new client in your system. Only the name and email are required.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CLIENT TYPE */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <Label htmlFor="clientType" className="font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Client Type
            </Label>
            <Select
              value={formData.clientType}
              onValueChange={(value) =>
                setFormData({ ...formData, clientType: value })
              }
            >
              <SelectTrigger id="clientType" className="mt-3 border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">
                  <span className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Individual / Person
                  </span>
                </SelectItem>
                <SelectItem value="corporate">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    Corporate / Business
                  </span>
                </SelectItem>
                <SelectItem value="government">Government / Agency</SelectItem>
                <SelectItem value="ngo">NGO / Non-Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* NAME */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <Label htmlFor="name" className="font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Full Name / Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              required
              placeholder="John Doe or Acme Corporation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-3 border-slate-300"
            />
          </div>

          {/* EMAIL & PHONE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <Label htmlFor="email" className="font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-3 border-slate-300"
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <Label htmlFor="phone" className="font-semibold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="+254 708 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-3 border-slate-300"
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <Label htmlFor="address" className="font-semibold text-slate-900">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Main Street, Suite 100"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-3 border-slate-300"
            />
          </div>

          {/* CITY, STATE, ZIP */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <Label htmlFor="city" className="font-semibold text-slate-900">City</Label>
              <Input
                id="city"
                placeholder="Nairobi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-3 border-slate-300"
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <Label htmlFor="state" className="font-semibold text-slate-900">State / Province</Label>
              <Input
                id="state"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-3 border-slate-300"
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <Label htmlFor="zipCode" className="font-semibold text-slate-900">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="00100"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="mt-3 border-slate-300"
              />
            </div>
          </div>

          {/* COUNTRY */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <Label htmlFor="country" className="font-semibold text-slate-900">Country</Label>
            <Input
              id="country"
              placeholder="Kenya"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="mt-3 border-slate-300"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.email}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
            >
              {isLoading ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
