import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('wakili-session')

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Fetch real organizations from database based on authenticated user
    // For now, return mock data
    const organizations = [
      {
        id: '1',
        name: 'Demo Law Firm',
        slug: 'demo-firm',
        subscription: 'professional',
      },
    ]

    const user = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@wakili.local',
    }

    return NextResponse.json({
      organizations,
      user,
    })
  } catch (error) {
    console.error('[v0] Organizations error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
