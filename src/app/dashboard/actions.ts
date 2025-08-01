
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Gera uma senha segura aleatória
function generateSecurePassword() {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
    let retVal = "";
    const crypto = require('crypto');
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(crypto.randomBytes(1)[0] / 256 * n));
    }
    return retVal;
}

const createAlbumSchema = z.object({
  albumName: z.string().min(1, 'O nome do álbum é obrigatório.'),
  // Dados do cliente para criar a conta
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

  // Admin client para poder criar usuários
  const supabaseAdmin = createClient(true);
  
  let clientUserId: string;
  let clientGeneratedPassword: string | null = null;

  // 1. Verificar se o cliente já existe na tabela de perfis
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', clientEmail)
    .single();

  if (existingProfile) {
    clientUserId = existingProfile.id;
  } else {
    // 2. Se o cliente não existe, cria um novo usuário no Auth
    clientGeneratedPassword = generateSecurePassword();
    const username = clientEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 10000);

    const { data: newClientUser, error: creationError } = await supabaseAdmin.auth.admin.createUser({
        email: clientEmail,
        password: clientGeneratedPassword,
        email_confirm: true, // O cliente não precisa confirmar o e-mail
        user_metadata: {
            role: 'client',
            fullName: clientFullName,
            phone: clientPhone,
            username: username, // Gerado para cumprir o schema do gatilho
            companyName: 'N/A'  // Padrão para cumprir o schema do gatilho
        }
    });

    if (creationError) {
        console.error("Erro ao criar cliente:", creationError);
        return { error: `Erro ao criar o cliente: ${creationError.message}` };
    }
    clientUserId = newClientUser.user.id;
  }

  // 3. Inserir o novo álbum
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
    return { error: `Erro ao criar álbum: ${albumError.message}` };
  }

  revalidatePath('/dashboard');
  return { 
    success: true,
    message: `Álbum "${albumName}" criado!`,
    // Retorna os dados do cliente se um novo foi criado
    newClientData: clientGeneratedPassword ? { email: clientEmail, password: clientGeneratedPassword } : null
  };
}
