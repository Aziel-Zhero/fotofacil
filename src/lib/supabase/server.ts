
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Esta é a forma correta e recomendada para inicializar o cliente Supabase
// em Server Components no Next.js App Router.
// O Next.js gerencia automaticamente o carregamento das variáveis de ambiente
// a partir de .env.local, então não precisamos de pacotes como 'dotenv'.

export function createClient(isAdmin = false) {
  const cookieStore = cookies()

  // As variáveis de ambiente são lidas diretamente do processo do Node.js,
  // que é preenchido pelo Next.js.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = isAdmin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    // Isso ajuda a depurar mais facilmente se as variáveis não forem carregadas.
    throw new Error('Supabase URL and/or key not provided. Check your .env.local file.');
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // O método `set` pode ser chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware que atualiza
            // as sessões de usuário.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // O método `delete` pode ser chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware que atualiza
            // as sessões de usuário.
          }
        },
      },
      // Se for admin, desativa a RLS.
      // CUIDADO: Usar apenas em Server Actions onde o acesso é controlado.
      ...(isAdmin
        ? {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        : {}),
    }
  );
}
