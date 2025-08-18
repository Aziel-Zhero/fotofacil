
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Schema agora EXCLUSIVO para fotógrafos.
const signupSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres'),
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
        // A role agora é fixa, pois esta ação é apenas para fotógrafos
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
    if (error.message.includes('duplicate key value violates unique constraint "photographers_username_key"')) {
        return { error: "Este nome de usuário já está em uso. Por favor, escolha outro." };
    }
    console.error("Supabase signup error:", error);
    return { error: "Ocorreu um erro no servidor ao criar o usuário. Por favor, tente novamente." };
  }
  
  redirect(`/login?message=Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.`);
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
    
    const userRole = user.user_metadata?.role;

    if (userRole === 'photographer') {
        const { data: profile, error: profileError } = await supabase
            .from('photographers')
            .select('id')
            .eq('id', user.id)
            .single();
        
        if (profileError || !profile) {
            await supabase.auth.signOut();
            let errorMessage = 'Não foi possível encontrar seu perfil de fotógrafo. Contate o suporte.';
            if (profileError) {
                console.error("Profile fetch error:", profileError);
                errorMessage = `Erro ao buscar perfil (${profileError.code}). Contate o suporte.`;
            }
            return { error: errorMessage };
        }
        // Redirecionamento para o dashboard do fotógrafo em caso de sucesso
        redirect('/dashboard');
    }
    
    if (userRole === 'client') {
        // Redirecionamento para a galeria do cliente em caso de sucesso
        redirect('/gallery');
    }

    // Se não for nenhum dos roles esperados, desloga e avisa.
    await supabase.auth.signOut();
    return { error: 'Tipo de usuário não reconhecido. O acesso foi negado.' };
}

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
});

export async function forgotPassword(formData: FormData) {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());

    const parsed = forgotPasswordSchema.safeParse(data);

    if (!parsed.success) {
        return { error: 'Email inválido.' };
    }
    
    const { email } = parsed.data;
    const origin = headers().get('origin');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
        console.error('Forgot Password Error:', error);
        return { error: "Não foi possível enviar o link de redefinição de senha. Tente novamente." };
    }

    return { message: 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.' };
}

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

export async function resetPassword(formData: FormData) {
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

    redirect('/login?message=Sua senha foi redefinida com sucesso. Você já pode fazer login.');
}
