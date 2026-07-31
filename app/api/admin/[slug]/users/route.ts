import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, userCredential, userRole, organization } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, generateTemporaryPassword } from '@/lib/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { email, name, role } = await request.json()

    // Validate input
    if (!email || !name || !role) {
      return NextResponse.json(
        { message: 'Email, name, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Get organization
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, params.slug))
      .limit(1)

    if (org.length === 0) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization_id = org[0].id

    // Create user
    const userId = crypto.randomUUID()
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    await db.insert(user).values({
      id: userId,
      email,
      name,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create user credentials
    await db.insert(userCredential).values({
      id: crypto.randomUUID(),
      userId,
      password: hashedPassword,
      isActive: true,
      isFirstLogin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Get or create role
    // For now, we'll use a basic role assignment
    const roleMap: Record<string, string> = {
      admin: 'admin-role',
      manager: 'manager-role',
      attorney: 'attorney-role',
      paralegal: 'paralegal-role',
      support: 'support-role',
    }

    // TODO: Link to actual roles from database
    // For now, create a temporary role link
    await db.insert(userRole).values({
      id: crypto.randomUUID(),
      userId,
      roleId: roleMap[role],
      organizationId: organization_id,
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        name,
        role,
      },
      temporaryPassword,
    })
  } catch (error) {
    console.error('[v0] Create user error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get organization
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, params.slug))
      .limit(1)

    if (org.length === 0) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get users in organization
    // TODO: Implement proper user listing for organization
    const users = await db.select().from(user).limit(50)

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
      })),
    })
  } catch (error) {
    console.error('[v0] Get users error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
