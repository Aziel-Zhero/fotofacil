
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createAlbumSchema = z.object({
  name: z.string().min(1, 'O nome do álbum é obrigatório.'),
  clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  expirationDate: z.string().optional(),
  password: z.string().optional(),
  maxPhotos: z.coerce.number().min(1, 'Defina um número máximo de fotos.'),
  extraPhotoCost: z.coerce.number().min(0, 'O valor deve ser zero ou maior.').optional(),
  giftPhotos: z.coerce.number().min(0, 'O valor deve ser zero ou maior.').optional(),
  clientUserId: z.string().uuid('ID de usuário do cliente inválido e obrigatório.'),
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  const { name, clientName, expirationDate, password, maxPhotos, extraPhotoCost, giftPhotos, clientUserId } = parsed.data;

  // 1. Verificar se o clientUserId existe na nova tabela 'profiles' e tem a role 'client'
  const { data: clientProfile, error: clientError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', clientUserId)
    .eq('role', 'client') 
    .single();

  if (clientError || !clientProfile) {
      console.error('Erro ao buscar perfil do cliente:', clientError);
      return { error: 'O ID fornecido não pertence a um cliente válido. Verifique se o cliente está cadastrado e se o ID está correto.' };
  }
  
  // 2. Inserir o álbum
  const { error: albumError } = await supabase.from('albums').insert({
    photographer_id: user.id,
    client_user_id: clientUserId,
    name,
    status: 'Aguardando Seleção',
    selection_limit: maxPhotos,
    extra_photo_cost: extraPhotoCost,
    courtesy_photos: giftPhotos,
    access_password: password || null,
    expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
  });

   if (albumError) {
    console.error('Erro ao criar álbum:', albumError);
    if (albumError.message.includes('foreign key constraint')) {
        return { error: 'O ID do cliente fornecido não é válido. Verifique se o cliente está cadastrado.' };
    }
    return { error: `Erro ao criar álbum: ${albumError.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
