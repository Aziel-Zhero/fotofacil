
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Schema agora acomoda ambos os roles. Username e companyName são opcionais aqui,
// mas a lógica de negócio garantirá sua presença quando necessário.
const signupSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
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
  if (role === 'client') {
    // Para clientes, geramos um username e usamos um companyName padrão.
    username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
    companyName = 'Cliente';
  } else if (role === 'photographer') {
    // Para fotógrafos, validamos se os campos foram fornecidos.
    if (!username || username.length < 3) {
      return { error: "O nome de usuário deve ter pelo menos 3 caracteres." };
    }
    if (!companyName || companyName.length < 1) {
      return { error: "Nome da empresa é obrigatório." };
    }
  }


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
    if (error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
        return { error: "Este nome de usuário já está em uso. Por favor, escolha outro." };
    }
    console.error("Supabase signup error:", error.message);
    return { error: "Erro no banco de dados ao salvar novo usuário. Verifique os logs." };
  }

  const message = role === 'client' 
    ? 'Cadastro de cliente realizado com sucesso! Verifique seu email para confirmar.'
    : 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.';

  // A função redirect() lança uma exceção, então deve ser chamada fora do retorno.
  redirect(`/login?message=${encodeURIComponent(message)}`);
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
        redirect('/dashboard');
    } else if (userRole === 'client') {
        redirect('/gallery');
    } else {
        // Fallback: se não tiver role, desloga e manda pro login com erro
        await supabase.auth.signOut();
        redirect('/login?error=Função de usuário não definida. Contate o suporte.');
    }
}
