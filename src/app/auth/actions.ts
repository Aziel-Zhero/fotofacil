
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const signupSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.'),
  companyName: z.string().min(1, 'Nome da empresa é obrigatório.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
});

export async function signup(formData: FormData) {
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

  // Etapa 1: Criar o usuário na autenticação
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Note: O 'data' aqui é apenas para metadados, não o usamos mais para o gatilho.
      // Poderia ser útil para outras coisas no futuro.
      data: {
        fullName: fullName,
        username: username,
      },
      emailRedirectTo: `/auth/callback`,
    },
  });

  if (authError) {
    if (authError.message.includes("User already registered")) {
        return { error: "Este email já está cadastrado. Tente fazer login." };
    }
    return { error: `Erro no cadastro: ${authError.message}` };
  }
  
  if (!authData.user) {
    return { error: "Ocorreu um erro: o usuário não foi criado na autenticação." };
  }

  // Etapa 2: Inserir o perfil do fotógrafo na tabela `photographers`
  const { error: profileError } = await supabase
    .from('photographers')
    .insert({ 
        user_id: authData.user.id,
        full_name: fullName,
        email: email,
        username: username,
        company_name: companyName,
        phone: phone,
     });

    if (profileError) {
        // Se a inserção do perfil falhar, devemos idealmente excluir o usuário recém-criado
        // para evitar contas órfãs.
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        if (profileError.message.includes("photographers_username_key")) {
             return { error: "Este nome de usuário já está em uso. Por favor, escolha outro." };
        }
        if (profileError.message.includes("photographers_email_key")) {
             return { error: "Este email já está cadastrado na tabela de perfis. Tente fazer login." };
        }
        return { error: `Erro ao salvar perfil: ${profileError.message}` };
    }


  // Redireciona o usuário para a página de login com uma mensagem de sucesso.
  return redirect('/login?message=Cadastro realizado com sucesso! Por favor, faça o login.');
}
