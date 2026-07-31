'use server'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userCredential } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword, logAuthEvent } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

// Password strength validation
function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number')
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character (!@#$%^&*)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated via session cookie
    const cookieStore = await cookies()
    const session = cookieStore.get('wakili-session')

    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { userId, currentPassword, newPassword, confirmPassword } = await request.json()

    // Validate input
    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate new password strength
    const strengthCheck = validatePasswordStrength(newPassword)
    if (!strengthCheck.valid) {
      return NextResponse.json(
        {
          message: 'Password does not meet requirements',
          errors: strengthCheck.errors,
        },
        { status: 400 }
      )
    }

    // Prevent reusing temporary/old password
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { message: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Get user credentials
    const creds = await db
      .select()
      .from(userCredential)
      .where(eq(userCredential.userId, userId))
      .limit(1)

    if (creds.length === 0) {
      await logAuthEvent('password-change', 'failed', {
        userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        reason: 'User credentials not found',
      })

      return NextResponse.json(
        { message: 'User credentials not found' },
        { status: 404 }
      )
    }

    const credential = creds[0]

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, credential.password)

    if (!isCurrentPasswordValid) {
      await logAuthEvent('password-change', 'failed', {
        userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        reason: 'Invalid current password',
      })

      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and set isFirstLogin to false
    await db
      .update(userCredential)
      .set({
        password: hashedPassword,
        isFirstLogin: false,
        updatedAt: new Date(),
      })
      .where(eq(userCredential.userId, userId))

    // Log successful password change
    await logAuthEvent('password-change', 'success', {
      userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      message: 'Password changed successfully',
      isFirstLogin: false,
    })
  } catch (error) {
    console.error('[v0] Change password error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
