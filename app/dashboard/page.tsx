'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Settings, Plus, Building2 } from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  subscription: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user orgs
        const response = await fetch('/api/organizations')
        if (!response.ok) {
          router.push('/auth/sign-in')
          return
        }
        const data = await response.json()
        setOrganizations(data.organizations || [])
        setUser(data.user)
      } catch (error) {
        console.error('[v0] Failed to fetch data:', error)
        router.push('/auth/sign-in')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
      router.push('/auth/sign-in')
    } catch (error) {
      console.error('[v0] Sign out error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-r-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              W
            </div>
            <span className="font-bold text-lg">Wakili</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'User'}</h1>
          <p className="text-muted-foreground">Select an organization to get started</p>
        </div>

        {organizations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
              <p className="text-muted-foreground mb-4">
                You don't have access to any organizations. Contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/org/${org.slug}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{org.name}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                      {org.subscription}
                    </span>
                  </CardTitle>
                  <CardDescription>Click to enter workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href={`/org/${org.slug}`}>
                      Enter Workspace
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
