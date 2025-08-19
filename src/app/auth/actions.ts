
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { headers } from 'next/headers';

const signupSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.'),
  companyName: z.string().min(1, 'Nome da empresa é obrigatório.'),
  phone: z.string().min(10, 'Telefone inválido'),
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

  const { email, password, fullName, username, companyName, phone } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'photographer', 
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
    // Verificação genérica para violação de chave única, que provavelmente é o username
    if (error.code === '23505') { 
        return { error: "Este nome de usuário já está em uso. Por favor, escolha outro." };
    }
    console.error("Supabase signup error:", error);
    return { error: "Ocorreu um erro no servidor ao criar o usuário. Por favor, tente novamente." };
  }
  
  return { success: true, redirect: `/login?message=Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.` };
}

const loginSchema = z.object({
    email: z.string().email({ message: 'Email inválido.' }),
    password: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

export async function login(formData: FormData) {
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());

    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.issues.map(i => i.message).join('\n');
      return { error: errors };
    }

    const { email, password } = parsed.data;

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada.' };
      }
      return { error: 'Credenciais inválidas. Tente novamente.' };
    }

    if (!user) {
      return { error: 'Usuário não encontrado após login.' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('photographers')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      console.error('Perfil de fotógrafo não encontrado ou erro:', profileError);
      return { error: 'Perfil de fotógrafo não encontrado. Contate o suporte.' };
    }

    return { success: true, redirect: '/dashboard' };

  } catch(e: any) {
    console.error('[ServerAction ERROR] login:', e);
    return { error: 'Erro interno no servidor ao tentar fazer login.' };
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
});

export async function forgotPassword(formData: FormData) {
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());
    const origin = headers().get('origin');

    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return { error: 'Email inválido.' };
    }
      
    const { email } = parsed.data;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      console.error('Forgot Password Error:', error);
      return { error: "Não foi possível enviar o link de redefinição de senha. Tente novamente." };
    }

    return { message: 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.' };
  } catch(e: any) {
    console.error('[ServerAction ERROR] forgotPassword:', e);
    return { error: 'Erro interno no servidor.' };
  }
}

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

export async function resetPassword(formData: FormData) {
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());

    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return { error: 'A senha deve ter pelo menos 8 caracteres.' };
    }

    const { password } = parsed.data;
    
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error('Reset Password Error:', error);
      return { error: "Não foi possível redefinir a senha. O link pode ter expirado." };
    }

    return { success: true, redirect: '/login?message=Sua senha foi redefinida com sucesso. Você já pode fazer login.' };
  } catch(e: any) {
    console.error('[ServerAction ERROR] resetPassword:', e);
    return { error: 'Erro interno no servidor.' };
  }
}
