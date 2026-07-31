import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized', clients: [] }, { status: 401 })
    }

    const searchQuery = request.nextUrl.searchParams.get('q') || ''
    const userId = session.user.id

    console.log('[v0] Client Search API - userId:', userId, 'search:', searchQuery)

    // Query from database - Note: column name is 'userid' (lowercase)
    const result = await pool.query(
      `SELECT id, name, email, phone, name, city 
       FROM public."client" 
       WHERE  (name ILIKE $1)
       LIMIT 50`,
      [`%${searchQuery}%`]
    )

    const clients = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
    }))

    console.log('[v0] Client Search API - Found', clients.length, 'clients')

    return NextResponse.json({ clients }, { status: 200 })
  } catch (error) {
    console.error('[v0] Client search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search clients', clients: [] },
      { status: 500 }
    )
  }
}
