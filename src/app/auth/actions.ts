
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const signupSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.'),
  companyName: z.string().min(1, 'Nome da empresa é obrigatório.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
  role: z.enum(['photographer', 'client'], { required_error: 'Função é obrigatória.' }),
});

export async function signup(formData: FormData) {
  const origin = headers().get('origin');
  const supabase = createClient();
  const data = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(data);

  if (!parsed.success) {
    let errorMessages = '';
    parsed.error.issues.forEach(issue => {
      errorMessages += issue.message + '\n';
    });
    return { error: errorMessages.trim() };
  }

  const { email, password, fullName, username, companyName, phone, role } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        fullName,
        username,
        companyName,
        phone
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
        return { error: "Este email já está cadastrado. Tente fazer login." };
    }
    if (error.message.includes('duplicate key value violates unique constraint "photographers_username_key"')) {
        return { error: "Este nome de usuário já está em uso. Por favor, escolha outro." };
    }
    return { error: `Erro no cadastro: ${error.message}` };
  }

  const message = role === 'client' 
    ? 'Cadastro de cliente realizado com sucesso! Verifique seu email para confirmar.'
    : 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.';

  return redirect(`/login?message=${encodeURIComponent(message)}`);
}


const loginSchema = z.object({
    email: z.string().email({ message: 'Email inválido.' }),
    password: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

export async function login(formData: FormData) {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());

    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
        let errorMessages = '';
        parsed.error.issues.forEach(issue => {
            errorMessages += issue.message + '\n';
        });
        return { error: errorMessages.trim() };
    }

    const { email, password } = parsed.data;

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('Email not confirmed')) {
            return { error: "Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada." };
        }
        return { error: "Credenciais inválidas. Por favor, tente novamente." };
    }

    if (!user) {
         return { error: "Usuário não encontrado após o login." };
    }
    
    // Verifica a role do usuário e redireciona
    const userRole = user.user_metadata?.role;

    if (userRole === 'photographer') {
        return redirect('/dashboard');
    } else if (userRole === 'client') {
        return redirect('/gallery');
    } else {
        // Fallback: se não tiver role, desloga e manda pro login com erro
        await supabase.auth.signOut();
        return redirect('/login?error=Função de usuário não definida. Contate o suporte.');
    }
}
