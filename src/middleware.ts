
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Criar uma resposta inicial que pode ser modificada
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Modifica os cookies na resposta existente, em vez de criar uma nova.
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Modifica os cookies na resposta existente para remover.
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const { pathname } = request.nextUrl;

  // Rotas que não exigem autenticação
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/register/photographer',
    '/forgot-password',
    '/reset-password',
    '/gallery/access' 
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route) && (route !== '/' || pathname === '/'));

  // Se o usuário estiver logado
  if (user) {
    const userRole = user.user_metadata?.role;
    
    // Se logado e em rota pública (exceto home), redireciona para o painel correto
    if (isPublicRoute && pathname !== '/') {
      if (userRole === 'photographer') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (userRole === 'client') {
        return NextResponse.redirect(new URL('/gallery', request.url));
      }
    }

    // Se fotógrafo tentando acessar área de cliente
    if (userRole === 'photographer' && pathname.startsWith('/gallery')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Se cliente tentando acessar área de fotógrafo
    if (userRole === 'client' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/gallery', request.url));
    }

  } else { // Se não estiver logado
    // E tentando acessar uma rota protegida
    if (!isPublicRoute) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'Você precisa estar logado para acessar esta página.')
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Retorna a resposta (possivelmente com cookies atualizados)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
