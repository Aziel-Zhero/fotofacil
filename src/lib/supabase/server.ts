
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config } from 'dotenv';

// Garante que as variáveis de ambiente sejam carregadas antes de qualquer outra coisa.
config();

export function createClient(isAdmin = false) {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = isAdmin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be provided.');
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
            // O método `set` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware atualizando
            // as sessões do usuário.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // O método `delete` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware atualizando
            // as sessões do usuário.
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
  )
}
