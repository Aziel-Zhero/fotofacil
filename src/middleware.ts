
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse(
      'Supabase URL and Key are required. Check your .env file and project settings.',
      { status: 500 }
    );
  }

  // Ignora métodos que não sejam GET ou HEAD (POST, PUT, etc. causam erro com Server Actions/fetch)
  if (!['GET', 'HEAD'].includes(request.method)) {
    return response;
  }

  const { pathname } = request.nextUrl;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set(name, '', {
          ...options,
          maxAge: 0,
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas abertas apenas para visitantes (não logados)
  const guestRoutes = [
    '/login',
    '/register',
    '/register/photographer',
    '/forgot-password',
    '/reset-password',
  ];

  // Rotas protegidas (somente usuários logados)
  const protectedRoutes = ['/dashboard', '/gallery'];

  // Redirecionamento se não estiver logado e acessar rota protegida
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(
      new URL('/login?error=Você precisa estar logado para acessar esta página.', request.url)
    );
  }

  // Se estiver logado, mas tentando acessar rota de visitante
  if (user && guestRoutes.some(route => pathname.startsWith(route))) {
    const userRole = user.user_metadata?.role;

    if (userRole === 'photographer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (userRole === 'client') {
      return NextResponse.redirect(new URL('/gallery', request.url));
    }

    return NextResponse.redirect(new URL('/', request.url)); // fallback
  }

  // Corrige usuários na rota errada
  if (user) {
    const userRole = user.user_metadata?.role;

    if (userRole === 'client' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/gallery', request.url));
    }

    if (userRole === 'photographer' && pathname.startsWith('/gallery')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth
     * - api
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|api).*)',
  ],
};
