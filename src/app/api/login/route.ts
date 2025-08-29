
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email({ message: 'Email inválido.' }),
    password: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map(i => i.message).join('\n');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json({ error: 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Credenciais inválidas. Tente novamente.' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado após login.' }, { status: 404 });
    }

    // Lógica de redirecionamento baseada no role do usuário
    const userRole = user.user_metadata.role;

    if (userRole === 'photographer') {
      return NextResponse.json({ success: true, redirect: '/dashboard' });
    } else if (userRole === 'client') {
      return NextResponse.json({ success: true, redirect: '/gallery' });
    } else {
      // Fallback: se não tiver role, desloga e manda pro login
      await supabase.auth.signOut();
      return NextResponse.json({ error: 'Tipo de usuário desconhecido. Contate o suporte.' }, { status: 403 });
    }

  } catch(e: any) {
    console.error('[API Route ERROR] /api/login:', e);
    return NextResponse.json({ error: 'Erro interno no servidor ao tentar fazer login.' }, { status: 500 });
  }
}
