
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Unificado e flexível. O username e companyName são opcionais no schema,
// mas a lógica abaixo garante que eles existam quando necessário.
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
  // Isso garante que o objeto raw_user_meta_data sempre terá os campos que o gatilho espera.
  if (role === 'client') {
    // Para clientes, geramos um username único e usamos um companyName padrão.
    // Isso é necessário porque a tabela 'profiles' tem uma restrição UNIQUE no username.
    username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 10000);
    companyName = 'N/A'; // Define um padrão para não ser nulo
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
    // Este erro agora deve ser pego pela validação no `profiles`
    if (error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
        return { error: "Este nome de usuário já está em uso. Por favor, escolha outro." };
    }
    console.error("Supabase signup error:", error);
    // Mensagem de erro genérica para o usuário
    return { error: "Ocorreu um erro no servidor ao criar o usuário. Por favor, tente novamente." };
  }

  // Não usamos mais 'return redirect', retornamos um objeto de sucesso
  // E o redirecionamento acontece no lado do cliente ou com redirect() fora do return
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
    
    // Agora a 'role' está nos metadados do usuário e será usada para redirecionar.
    const userRole = user.user_metadata?.role;

    if (userRole === 'photographer') {
        redirect('/dashboard');
    } else if (userRole === 'client') {
        redirect('/gallery');
    } else {
        // Fallback: se não tiver role, desloga e manda pro login com erro.
        // Isso pode acontecer se o trigger falhar, o que não deve mais ocorrer.
        await supabase.auth.signOut();
        redirect('/login?error=Função de usuário não definida. Contate o suporte.');
    }
}
