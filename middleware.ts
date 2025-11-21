import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // DISABLED: Token check in middleware because we use localStorage (client-side)
  // Auth check is handled by individual pages (admin/page.tsx, dashboard/page.tsx, etc)
  // Middleware can't access localStorage, only cookies
  
  // Just allow all requests and let client-side auth handle it
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
  
  /* ORIGINAL CODE - DISABLED BECAUSE IT CAUSES LOGOUT ON REFRESH
  const token = request.cookies.get('token')?.value

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/fields', '/schedule', '/information']
  const isPublicPath = publicPaths.some(path => pathname === path)
  const isApiRoute = pathname.startsWith('/api/')
  const isStaticFile = pathname.startsWith('/_next/') || pathname.startsWith('/images/') || pathname.startsWith('/sounds/') || pathname.startsWith('/uploads/')

  // Allow public paths, API routes, and static files
  if (isPublicPath || isApiRoute || isStaticFile) {
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }

  // Protected routes (admin, dashboard, booking)
  const protectedPaths = ['/admin', '/dashboard', '/booking']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !token) {
    // Not authenticated, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname) // Save intended destination
    return NextResponse.redirect(url)
  }

  // User is authenticated or accessing allowed paths
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
  */
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|sounds).*)',
  ],
}

