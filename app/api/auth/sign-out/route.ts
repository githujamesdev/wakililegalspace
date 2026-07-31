import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('wakili-session')

    return NextResponse.json({
      message: 'Signed out successfully',
    })
  } catch (error) {
    console.error('[v0] Sign out error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
