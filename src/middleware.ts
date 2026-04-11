import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const url = new URL(request.url)
  const pathname = url.pathname

  // Protection Level Map
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname)
  // Protected pages are anything under dashboard, settings, contacts, pipelines, etc.
  const isProtectedPage = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/contacts') || 
    pathname.startsWith('/pipelines') || 
    pathname.startsWith('/team-members') || 
    pathname.startsWith('/settings') ||
    pathname.startsWith('/invite')

  // Rule 1: Redirect to /dashboard if already logged in and accessing auth pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rule 2: Redirect to /login if not logged in and accessing protected pages
  if (!session && isProtectedPage && !pathname.startsWith('/invite/accept')) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // NOTE: Rule 3 (Admin check) removed from middleware to prevent blind redirects to /dashboard.
  // Role-based protection should be handled within the Server Components (layouts/pages)
  // using utility functions like requireAdmin().

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
