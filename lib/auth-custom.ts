import bcryptjs from 'bcryptjs'
import { db } from './db'
import { userCredential, user as userTable, authAuditLog } from './db/schema'
import { eq } from 'drizzle-orm'

const SALT_ROUNDS = 10
const TEMP_PASSWORD_LENGTH = 12

/**
 * Hash a password using bcryptjs
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against its hash
 * @param password Plain text password
 * @param hash Hashed password from database
 * @returns Boolean indicating if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

/**
 * Generate a temporary random password
 * @returns 12-character random password
 */
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 * @param password Password to validate
 * @returns Boolean and message
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain number' }
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, message: 'Password must contain special character (!@#$%^&*)' }
  }
  return { valid: true, message: 'Password is strong' }
}

/**
 * Authenticate user by email and password
 * @param email User email
 * @param password Plain text password
 * @param ipAddress Optional IP address for audit logging
 * @returns User object if authenticated, null otherwise
 */
export async function authenticateUser(
  email: string,
  password: string,
  ipAddress?: string
) {
  try {
    // Find user by email
    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1)

    if (!users.length) {
      // Log failed login
      await logAuthAudit({
        email,
        action: 'failed-login',
        ipAddress,
        status: 'failed',
        reason: 'User not found',
      })
      return null
    }

    const foundUser = users[0]

    // Get user credentials
    const credentials = await db
      .select()
      .from(userCredential)
      .where(eq(userCredential.userId, foundUser.id))
      .limit(1)

    if (!credentials.length || !credentials[0].isActive) {
      await logAuthAudit({
        userId: foundUser.id,
        email,
        action: 'failed-login',
        ipAddress,
        status: 'failed',
        reason: 'User credentials not found or inactive',
      })
      return null
    }

    const cred = credentials[0]

    // Check if account is locked
    if (cred.lockedUntil && cred.lockedUntil > new Date()) {
      await logAuthAudit({
        userId: foundUser.id,
        email,
        action: 'failed-login',
        ipAddress,
        status: 'failed',
        reason: 'Account locked due to failed login attempts',
      })
      return null
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, cred.password)

    if (!isPasswordValid) {
      const failedAttempts = (cred.failedLoginAttempts || 0) + 1
      
      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        await db
          .update(userCredential)
          .set({
            failedLoginAttempts: failedAttempts,
            lockedUntil: lockUntil,
          })
          .where(eq(userCredential.userId, foundUser.id))

        await logAuthAudit({
          userId: foundUser.id,
          email,
          action: 'failed-login',
          ipAddress,
          status: 'failed',
          reason: 'Account locked after 5 failed attempts',
        })
        return null
      }

      // Update failed attempts
      await db
        .update(userCredential)
        .set({ failedLoginAttempts: failedAttempts })
        .where(eq(userCredential.userId, foundUser.id))

      await logAuthAudit({
        userId: foundUser.id,
        email,
        action: 'failed-login',
        ipAddress,
        status: 'failed',
        reason: `Invalid password (attempt ${failedAttempts}/5)`,
      })
      return null
    }

    // Reset failed attempts on successful login
    await db
      .update(userCredential)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(userCredential.userId, foundUser.id))

    // Log successful login
    await logAuthAudit({
      userId: foundUser.id,
      email,
      action: 'login',
      ipAddress,
      status: 'success',
    })

    return foundUser
  } catch (error) {
    console.error('[v0] Authentication error:', error)
    return null
  }
}

/**
 * Log authentication audit events
 */
export async function logAuthAudit({
  userId,
  email,
  action,
  ipAddress,
  status,
  reason,
}: {
  userId?: string
  email?: string
  action: string
  ipAddress?: string
  status: string
  reason?: string
}) {
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.insert(authAuditLog).values({
      id,
      userId,
      email,
      action,
      ipAddress,
      status,
      reason,
    })
  } catch (error) {
    console.error('[v0] Failed to log auth audit:', error)
  }
}

