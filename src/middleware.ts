import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Check if we need to update the request cookies
            request.cookies.set(name, value);
          });
          
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Only apply custom role validation if the user is authenticated
  if (session?.user) {
    // Check if the user has a client role embedded via metadata or cookies
    // (If relying on a cookie for active_role or verifying user_metadata)
    const isClient = session.user.user_metadata?.role === 'client' || request.cookies.get('active_role')?.value === 'client';

    if (isClient) {
      // PRD Logic: If role === 'client' and path does not start with /portal or /learn: redirect to /portal/dashboard
      if (!pathname.startsWith('/portal') && !pathname.startsWith('/learn') && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
        return NextResponse.redirect(new URL('/portal/dashboard', request.url));
      }
    } else {
      // If NOT a client but trying to access client-only routes
      if (pathname.startsWith('/portal')) {
         return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return supabaseResponse;
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
};
