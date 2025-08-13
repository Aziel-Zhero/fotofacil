
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Unificado e flexível. O username e companyName são opcionais no schema,
// mas a lógica abaixo garante que eles existam quando necessário.
const signupSchema = z.object({
  email: z.string().email('Email inválido.'),
  // A senha é opcional no schema geral, mas obrigatória para fotógrafos
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').optional(),
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  username: z.string().optional(),
  companyName: z.string().optional(),
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

  let { email, password, fullName, username, companyName, phone, role } = parsed.data;

  // Lógica de negócio para garantir os dados necessários para o trigger do DB.
  // Isso garante que o objeto raw_user_meta_data sempre terá os campos que o gatilho espera.
  if (role === 'client') {
    // Para clientes, geramos um username único e usamos um companyName padrão.
    // Isso é necessário porque a tabela 'photographers' tem uma restrição UNIQUE no username.
    username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 10000);
    companyName = 'N/A'; // Define um padrão para não ser nulo
    
    // Gera uma senha segura e aleatória para o cliente, que ele trocará no primeiro acesso.
    password = Math.random().toString(36).slice(-12);

  } else if (role === 'photographer') {
    // Para fotógrafos, validamos se os campos foram fornecidos.
     if (!password) {
      return { error: "A senha é obrigatória para fotógrafos." };
    }
    if (!username || username.length < 3) {
      return { error: "O nome de usuário deve ter pelo menos 3 caracteres." };
    }
    if (!companyName || companyName.length < 1) {
      return { error: "Nome da empresa é obrigatório." };
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password: password!,
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
    console.error("Supabase signup error:", error);
    return { error: "Ocorreu um erro no servidor ao criar o usuário. Por favor, tente novamente." };
  }

  // Se o cadastro foi feito por um fotógrafo logado (criando um cliente), 
  // não redirecionamos, apenas retornamos sucesso.
  const { data: { user: loggedInUser } } = await supabase.auth.getUser();
  if (loggedInUser && role === 'client') {
      return { success: true };
  }

  // Se foi um cadastro de um novo usuário (fotógrafo ou cliente por conta própria), redirecionamos.
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
    
    // A role agora está nos metadados do usuário e será usada para redirecionar.
    const userRole = user.user_metadata?.role;

    // Busca o perfil para ter certeza que o trigger funcionou
    const profileTable = userRole === 'photographer' ? 'photographers' : 'clients';
    const { data: profile, error: profileError } = await supabase
      .from(profileTable)
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      await supabase.auth.signOut();
      let errorMessage = 'Não foi possível encontrar seu perfil. Contate o suporte.';
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        errorMessage = `Erro ao buscar perfil (${profileError.code}). Contate o suporte.`;
      }
       return redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    if (userRole === 'photographer') {
        redirect('/dashboard');
    } else if (userRole === 'client') {
        redirect('/gallery');
    } else {
        await supabase.auth.signOut();
        redirect('/login?error=Função de usuário não definida. Contate o suporte.');
    }
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
