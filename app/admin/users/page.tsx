'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { fetchOrganizationUsers, addOrganizationMember } from '@/app/actions/fetch-organization-users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Trash2, Search, Mail, Phone, Briefcase, Calendar, Filter, ChevronDown, Shield, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  department?: string
  jobTitle?: string
  image?: string
  createdAt: string
  employmentStatus?: string
  lastLogin?: string
  role?: string
}

export default function TeamMembersPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showNewMemberDialog, setShowNewMemberDialog] = useState(false)
  const [newMemberLoading, setNewMemberLoading] = useState(false)
  const [newMemberData, setNewMemberData] = useState({ name: '', email: '', role: 'member' })

  // Statistics
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.employmentStatus === 'active').length
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'owner').length
  const recentUsers = users.slice(0, 3)

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const result = await fetchOrganizationUsers(slug)
        if (result.success) {
          const formattedUsers = result.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            role: u.role,
            createdAt: u.createdAt,
            employmentStatus: 'active',
            lastLogin: u.lastLogin,
          }))
          setUsers(formattedUsers)
          setError('')
        } else {
          setError(result.error || 'Failed to load team members')
        }
      } catch (err) {
        console.error('[v0] Error loading users:', err)
        setError('Failed to load team members')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadUsers()
    }
  }, [slug])

  const handleAddNewMember = async () => {
    try {
      setNewMemberLoading(true)
      const result = await addOrganizationMember(
        slug,
        newMemberData.email,
        newMemberData.name,
        newMemberData.role
      )
      
      if (result.success) {
        const newUser: User = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          image: result.user.image,
          role: result.user.role,
          createdAt: new Date().toISOString(),
          employmentStatus: 'active',
        }
        setUsers([...users, newUser])
        setShowNewMemberDialog(false)
        setNewMemberData({ name: '', email: '', role: 'member' })
        setError('')
      } else {
        setError(result.error || 'Failed to add member')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setNewMemberLoading(false)
    }
  }

  const handleRemove = (userId: string) => {
    // TODO: Call server action to remove user
    setUsers(users.filter(u => u.id !== userId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Team Members
            </h1>
            <p className="text-slate-600 mt-1">Manage your organization&apos;s team and permissions</p>
          </div>
          <Button
            onClick={() => setShowNewMemberDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg hover:shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Member
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users Card */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Active team members</p>
            </CardContent>
          </Card>

          {/* Active Users Card */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
                <span>Active Now</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          {/* Admins Card */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
                <span>Administrators</span>
                <Shield className="w-4 h-4 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{adminUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Admin or owner role</p>
            </CardContent>
          </Card>

          {/* Recent Additions Card */}
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
                <span>This Month</span>
                <Calendar className="w-4 h-4 text-cyan-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600">{recentUsers.length}</div>
              <p className="text-xs text-slate-500 mt-1">Recently added</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 bg-white border border-slate-300 text-slate-900 rounded-md focus:border-blue-500 focus:ring-blue-200 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Members Table */}
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent bg-slate-50">
                <TableHead className="text-slate-700 font-semibold">Member</TableHead>
                <TableHead className="text-slate-700 font-semibold">Department</TableHead>
                <TableHead className="text-slate-700 font-semibold">Role</TableHead>
                <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                <TableHead className="text-slate-700 font-semibold">Last Active</TableHead>
                <TableHead className="text-slate-700 font-semibold w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-200 hover:bg-blue-50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-slate-900 font-medium">{user.name}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {user.department || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'owner' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}
                        className={
                          user.role === 'owner'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }
                      >
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-700">{user.employmentStatus === 'active' ? 'Active' : 'Inactive'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(user.lastLogin), 'MMM d, HH:mm')}
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-400" />
                      <p className="text-slate-600">No team members found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Error Alert */}
        {error && (
          <Card className="bg-red-50 border-red-300">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Member Dialog */}
      <Dialog open={showNewMemberDialog} onOpenChange={setShowNewMemberDialog}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl">Add New Member</DialogTitle>
            <DialogDescription className="text-slate-600">
              Add a new system user to your organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Full Name</label>
              <Input
                placeholder="John Doe"
                value={newMemberData.name}
                onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={newMemberData.email}
                onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Role</label>
              <select
                value={newMemberData.role}
                onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value })}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-200"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowNewMemberDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewMember}
              disabled={newMemberLoading || !newMemberData.name || !newMemberData.email}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {newMemberLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
