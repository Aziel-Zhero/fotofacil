
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// A configuração de variáveis de ambiente não é necessária aqui,
// pois o Next.js as disponibiliza no ambiente Edge.
// O erro anterior era devido à falta de valores no arquivo .env

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    // Isso pode acontecer se as variáveis de ambiente não estiverem definidas corretamente.
    // Retornamos uma resposta de erro para depuração.
    return new NextResponse(
      "Supabase URL and Key are required. Check your .env file and project settings.",
      { status: 500 }
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Define routes that are accessible only when logged out
  const guestRoutes = ['/login', '/register', '/register/photographer', '/register/client'];
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/gallery'];

  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    // If no user is logged in and they are trying to access a protected route,
    // redirect them to the login page.
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && guestRoutes.some(route => pathname.startsWith(route))) {
    // If a user is logged in and they are trying to access a guest route,
    // redirect them to their respective dashboard.
    const userRole = user.user_metadata?.role;
    if (userRole === 'photographer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (userRole === 'client') {
      return NextResponse.redirect(new URL('/gallery', request.url));
    }
    // Fallback if role is not defined
    return NextResponse.redirect(new URL('/', request.url));
  }

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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
