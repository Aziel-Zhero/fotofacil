
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Como apenas fotógrafos se cadastram, redireciona sempre para o dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Se houver erro ou o código for inválido, redireciona para a página de login com erro.
  return NextResponse.redirect(`${origin}/login?error=Não foi possível autenticar. Por favor, tente novamente.`);
}
