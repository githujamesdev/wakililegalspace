import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { client, organization } from '@/lib/db/schema'
import { and, eq, or, ilike } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized', clients: [] }, { status: 401 })
    }

    const searchQuery = request.nextUrl.searchParams.get('q')?.trim() || ''
    const organizationSlug = request.nextUrl.searchParams.get('organization')?.trim()

    if (!organizationSlug) {
      return NextResponse.json({ error: 'Organization is required', clients: [] }, { status: 400 })
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, organizationSlug),
      columns: { id: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found', clients: [] }, { status: 404 })
    }

    const searchPattern = `%${searchQuery}%`
    const clients = await db
      .select({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.physicalAddress,
        city: client.city,
      })
      .from(client)
      .where(and(
        eq(client.organizationId, org.id),
        or(
          ilike(client.name, searchPattern),
          ilike(client.email, searchPattern),
          ilike(client.phone, searchPattern)
        )
      ))
      .limit(50)

    return NextResponse.json({ clients }, { status: 200 })
  } catch (error) {
    console.error('[v0] Client search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search clients', clients: [] },
      { status: 500 }
    )
  }
}



// import { auth } from '@/lib/auth'
// import { pool } from '@/lib/db'
// import { headers } from 'next/headers'
// import { NextRequest, NextResponse } from 'next/server'

// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth.api.getSession({ headers: await headers() })

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized', clients: [] }, { status: 401 })
//     }

//     const searchQuery = request.nextUrl.searchParams.get('q') || ''
//     const userId = session.user.id

//     console.log('[v0] Client Search API - userId:', userId, 'search:', searchQuery)

//     // Query from database - Note: column name is 'userid' (lowercase)
//     const result = await pool.query(
//       `SELECT id, name, email, phone, name, city 
//        FROM public."client" 
//        WHERE  (name ILIKE $1)
//        LIMIT 50`,
//       [`%${searchQuery}%`]
//     )

//     const clients = result.rows.map((row: any) => ({
//       id: row.id,
//       name: row.name,
//       email: row.email,
//       phone: row.phone,
//       address: row.address,
//       city: row.city,
//     }))

//     console.log('[v0] Client Search API - Found', clients.length, 'clients')

//     return NextResponse.json({ clients }, { status: 200 })
//   } catch (error) {
//     console.error('[v0] Client search API error:', error)
//     return NextResponse.json(
//       { error: 'Failed to search clients', clients: [] },
//       { status: 500 }
//     )
//   }
// }
