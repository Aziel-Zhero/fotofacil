
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
  phone: z.string().min(1, 'Telefone é obrigatório.'),
});

export async function clientSignup(formData: FormData) {
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

  const { email, password, fullName, username, phone } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'client',
        fullName,
        username,
        phone,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
        return { error: "Este email já está cadastrado. Tente fazer login." };
    }
    if (error.message.includes('duplicate key value violates unique constraint "clients_username_key"')) {
        return { error: "Este nome de usuário já está em uso. Por favor, escolha outro." };
    }
    return { error: `Erro no cadastro: ${error.message}` };
  }

  return redirect('/login?message=Cadastro de cliente realizado com sucesso! Verifique seu email para confirmar.');
}
