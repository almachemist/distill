import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isValidUrl(u: string | null | undefined): u is string {
  return typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))
}

export async function proxy(request: NextRequest) {
  const existingReqId = request.headers.get('x-request-id') || ''
  const reqId = existingReqId || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
  const headers = new Headers(request.headers)
  headers.set('x-request-id', reqId)

  // For API routes, only propagate x-request-id and do not apply auth redirects
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api')) {
    const resp = NextResponse.next({
      request: { headers },
    })
    resp.headers.set('x-request-id', reqId)
    return resp
  }

  let supabaseResponse = NextResponse.next({
    request: { headers },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = isValidUrl(url) && typeof key === 'string'
    ? createServerClient(
        url,
        key,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              )
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )
    : null

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/reset-password']
  const isPublicRoute = pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))

  // Check authentication
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null

  // Redirect to login if accessing protected route without auth
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (user && pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  supabaseResponse.headers.set('x-request-id', reqId)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/:path*',
  ],
}
