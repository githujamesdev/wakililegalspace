'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Session {
  id: string
  email: string
  name: string
  isFirstLogin: boolean
}

export function useSession() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setSession(data.session)
        } else {
          setSession(null)
          router.push('/auth/sign-in')
        }
      } catch (error) {
        console.error('[v0] Session check error:', error)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  return { session, loading }
}
