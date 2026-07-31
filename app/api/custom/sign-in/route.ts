import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, userCredential } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  verifyPassword,
  lockAccountOnFailedLogin,
  resetLoginAttempts,
  isAccountLocked,
  logAuthEvent,
} from '@/lib/auth-utils'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Custom sign-in route called')
    const { email, password } = await request.json()
    console.log('[v0] Email provided:', email)

    // Validate input
    if (!email || !password) {
      console.log('[v0] Missing email or password')
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('[v0] Querying database for user:', email)
    // Find user by email
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1)
    console.log('[v0] Database query result:', users.length, 'users found')

    if (users.length === 0) {
      await logAuthEvent('login', 'failed', {
        email,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        reason: 'User not found',
      })

      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const userData = users[0]

    // Check if account is locked
    const locked = await isAccountLocked(userData.id)
    if (locked) {
      await logAuthEvent('login', 'failed', {
        userId: userData.id,
        email,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        reason: 'Account locked - too many failed attempts',
      })

      return NextResponse.json(
        { message: 'Account locked. Try again in 30 minutes.' },
        { status: 403 }
      )
    }

    // Get user credentials
    const creds = await db
      .select()
      .from(userCredential)
      .where(eq(userCredential.userId, userData.id))
      .limit(1)

    if (creds.length === 0 || !creds[0].isActive) {
      await logAuthEvent('login', 'failed', {
        userId: userData.id,
        email,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        reason: 'User not active or credentials missing',
      })

      return NextResponse.json(
        { message: 'Account not active or not set up' },
        { status: 403 }
      )
    }

    const credential = creds[0]

    // Verify password
    const isPasswordValid = await verifyPassword(password, credential.password)

    if (!isPasswordValid) {
      await lockAccountOnFailedLogin(userData.id)
      await logAuthEvent('login', 'failed', {
        userId: userData.id,
        email,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        reason: 'Invalid password',
      })

      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Reset failed login attempts
    await resetLoginAttempts(userData.id)

    // Create session cookie
    const sessionToken = crypto.randomUUID()
    const cookieStore = await cookies()
    cookieStore.set('wakili-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    await logAuthEvent('login', 'success', {
      userId: userData.id,
      email,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        isFirstLogin: credential.isFirstLogin,
      },
    })
  } catch (error) {
    console.error('[v0] Sign in error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[v0] Error details:', errorMessage)
    return NextResponse.json(
      { message: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
