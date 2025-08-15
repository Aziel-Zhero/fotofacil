
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const guestRoutes = ['/login', '/register', '/register/photographer', '/forgot-password', '/reset-password'];
  const protectedPhotographerRoutes = ['/dashboard'];
  const protectedClientRoutes = ['/gallery'];
  const publicRoutes = ['/'];

  // Se a rota for pública, permite o acesso.
  if (publicRoutes.includes(pathname)) {
    return response;
  }
  
  // Se o usuário não estiver logado...
  if (!user) {
    // E tentar acessar qualquer rota protegida
    if (protectedPhotographerRoutes.some(p => pathname.startsWith(p)) || protectedClientRoutes.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/login?error=Você precisa estar logado para acessar esta página.', request.url))
    }
  }

  // Se o usuário estiver logado...
  if (user) {
    // E tentar acessar uma rota de convidado (login/registro), redireciona para o dashboard apropriado.
    if (guestRoutes.some(p => pathname.startsWith(p))) {
      const userRole = user.user_metadata?.role;
      if (userRole === 'photographer') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (userRole === 'client') {
        // Redireciona para a página de álbuns do cliente, que é a home dele.
        return NextResponse.redirect(new URL('/gallery', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url)); // Fallback
    }

    // Lógica para garantir que cada perfil acesse apenas sua área.
    const userRole = user.user_metadata?.role;
    if (userRole === 'client' && protectedPhotographerRoutes.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/gallery', request.url));
    }
    if (userRole === 'photographer' && protectedClientRoutes.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response
}
