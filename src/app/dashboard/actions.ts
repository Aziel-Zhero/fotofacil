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

  const { name, clientName, expirationDate, password, maxPhotos, extraPhotoCost, giftPhotos } = parsed.data;

  // 1. Inserir o cliente (ou encontrar um existente)
  let { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('name', clientName)
    .eq('photographer_id', user.id)
    .single();

  if (clientError && clientError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Erro ao buscar cliente:', clientError);
      return { error: 'Erro ao verificar cliente existente.' };
  }
  
  if (!client) {
      const { data: newClient, error: newClientError } = await supabase
          .from('clients')
          .insert({
              photographer_id: user.id,
              name: clientName,
          })
          .select('id')
          .single();

      if (newClientError) {
          console.error('Erro ao criar cliente:', newClientError);
          return { error: 'Erro ao criar novo cliente.' };
      }
      client = newClient;
  }

  // 2. Inserir o álbum
  const { error: albumError } = await supabase.from('albums').insert({
    photographer_id: user.id,
    client_id: client.id,
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
    return { error: `Erro ao criar álbum: ${albumError.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
