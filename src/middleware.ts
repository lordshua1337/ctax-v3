import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Security headers
  supabaseResponse.headers.set('X-Frame-Options', 'SAMEORIGIN')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')

  // Protect portal routes
  if (path.startsWith('/portal') && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Protect admin routes
  if (path.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Redirect logged-in users away from auth page
  if (path === '/auth' && user) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url))
  }

  // Redirect root to dashboard if logged in
  if (path === '/' && user) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
