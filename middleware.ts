import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/sign-in',
  '/auth/first-login',
  '/api/auth/sign-in',
  '/api/auth/sign-out',
  '/api/auth/me',
  '/api/auth/change-password',
  '/api/custom/sign-in',
]

// Admin routes that require admin role
const adminRoutes = ['/admin']

// Module route mapping
const moduleRouteMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/org/[slug]/time-tracking': 'time-tracking',
  '/org/[slug]/cases': 'cases',
  '/org/[slug]/clients': 'clients',
  '/org/[slug]/documents': 'documents',
  '/org/[slug]/messaging': 'messaging',
  '/org/[slug]/calendar': 'calendar',
  '/org/[slug]/tasks': 'tasks',
  '/org/[slug]/search': 'search',
  '/org/[slug]/settings': 'settings',
  '/org/[slug]/security': 'security',
  '/admin/users': 'user-management',  // ← NEW
}

// Extract module name from pathname
function getModuleFromPathname(pathname: string): string | null {
  for (const [route, module] of Object.entries(moduleRouteMap)) {
    if (pathname.startsWith(route.replace('[slug]', '').replace(/\/$/, ''))) {
      return module
    }
  }
  return null
}

// Check if user is admin (via session cookie comparison - simplified)
async function isUserAdmin(request: NextRequest): Promise<boolean> {
  // TODO: Implement proper admin check by:
  // 1. Decoding session token
  // 2. Querying database for user's roles
  // 3. Checking if user has admin role
  // For now, return false - this should be implemented in production
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('wakili-session')

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    // If user is already authenticated and trying to access sign-in, redirect to dashboard
    if ((pathname === '/auth/sign-in' || pathname === '/sign-in') && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect other routes - check if authenticated
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/sign-in'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Allow first-login route for users with session
  if (pathname === '/auth/first-login') {
    return NextResponse.next()
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    // TODO: Verify user is admin
    // For now, allow if session exists
    // In production:
    // 1. Check if user has admin role
    // 2. Redirect to /unauthorized if not admin
    return NextResponse.next()
  }

  // Check module-based routes
  const module = getModuleFromPathname(pathname)
  if (module) {
    // TODO: Verify user has permission for this module
    // For now, allow if session exists
    // In production:
    // 1. Extract organizationId from pathname
    // 2. Query getUserPermissions(userId, organizationId)
    // 3. Check if module is in accessible modules
    // 4. Redirect to /unauthorized if no access
    return NextResponse.next()
  }

  // Allow other authenticated routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
