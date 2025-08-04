
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Gera uma senha segura aleatória para o novo cliente
function generateSecurePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
    let retVal = "";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        retVal += charset[array[i] % charset.length];
    }
    return retVal;
}

// Schema atualizado para refletir o novo formulário
const createAlbumSchema = z.object({
  albumName: z.string().min(1, 'O nome do álbum é obrigatório.'),
  clientFullName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  clientEmail: z.string().email('O e-mail do cliente é inválido.'),
  clientPhone: z.string().optional(),
  expirationDate: z.string().optional(),
  maxPhotos: z.coerce.number().min(1, 'Defina um número máximo de fotos.'),
  extraPhotoCost: z.coerce.number().min(0, 'O valor deve ser zero ou maior.').optional(),
  giftPhotos: z.coerce.number().min(0, 'O valor deve ser zero ou maior.').optional(),
});


export async function createAlbum(formData: FormData) {
  const supabase = createClient();
  const data = Object.fromEntries(formData.entries());

  const parsed = createAlbumSchema.safeParse(data);

  if (!parsed.success) {
    let errorMessages = '';
    parsed.error.issues.forEach(issue => {
      errorMessages += issue.message + '\n';
    });
    return { error: errorMessages.trim() };
  }
  
  const { 
    albumName, 
    clientFullName, 
    clientEmail, 
    clientPhone, 
    expirationDate, 
    maxPhotos, 
    extraPhotoCost, 
    giftPhotos 
  } = parsed.data;
  
  const { data: { user: photographerUser } } = await supabase.auth.getUser();

  if (!photographerUser) {
    return { error: 'Fotógrafo não autenticado.' };
  }

  // Admin client para poder criar usuários sem que eles precisem confirmar e-mail.
  const supabaseAdmin = createClient(true);
  
  let clientUserId: string | null = null;
  let clientGeneratedPassword: string | null = null;

  // 1. Verificar se o cliente já existe na tabela de perfis pelo e-mail
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', clientEmail)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("Erro ao verificar perfil existente:", profileError);
    return { error: 'Erro ao verificar cliente existente.' };
  }

  if (existingProfile) {
    // Cliente já existe. Verifica se não é um fotógrafo.
    if (existingProfile.role === 'photographer') {
        return { error: 'Este e-mail já pertence a uma conta de fotógrafo. Por favor, use um e-mail diferente para o cliente.' };
    }
    clientUserId = existingProfile.id;
  } else {
    // 2. Se o cliente não existe, cria um novo usuário no Auth.
    clientGeneratedPassword = generateSecurePassword();
    const username = clientEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 10000);

    const { data: newClientAuth, error: creationError } = await supabaseAdmin.auth.admin.createUser({
        email: clientEmail,
        password: clientGeneratedPassword,
        email_confirm: true,
        user_metadata: {
            role: 'client',
            fullName: clientFullName,
            phone: clientPhone || '',
            username: username,
            companyName: 'N/A'
        }
    });

    if (creationError) {
        console.error("Erro ao criar cliente:", creationError);
        if (creationError.message.includes('User already exists')) {
             return { error: 'Um usuário com este e-mail já existe no sistema de autenticação, mas não em perfis. Contate o suporte.' };
        }
        return { error: `Erro ao criar o usuário do cliente: ${creationError.message}` };
    }
    clientUserId = newClientAuth.user.id;
  }

  // Garante que temos um ID de cliente antes de prosseguir
  if (!clientUserId) {
    return { error: 'Não foi possível obter o ID do cliente para criar o álbum.' };
  }

  // 3. Inserir o novo álbum, agora com o ID do cliente garantido.
  const { error: albumError } = await supabase.from('albums').insert({
    photographer_id: photographerUser.id,
    client_user_id: clientUserId,
    name: albumName,
    status: 'Aguardando Seleção',
    selection_limit: maxPhotos,
    extra_photo_cost: extraPhotoCost,
    courtesy_photos: giftPhotos,
    expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
  });

   if (albumError) {
    console.error('Erro ao criar álbum:', albumError);
    // Tenta remover o usuário recém-criado se a criação do álbum falhar
    if (clientGeneratedPassword && clientUserId) {
        await supabaseAdmin.auth.admin.deleteUser(clientUserId);
    }
    return { error: `Erro ao criar álbum: ${albumError.message}` };
  }

  revalidatePath('/dashboard');
  
  // Retorna sucesso e os dados de login do novo cliente, se um foi criado.
  return { 
    success: true,
    message: `Álbum "${albumName}" criado!`,
    newClientData: clientGeneratedPassword ? { email: clientEmail, password: clientGeneratedPassword } : null
  };
}
