
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

  // 1. Verificar se o clientUserId existe na tabela auth.users.
  //    Como não podemos consultar auth.users diretamente por razões de segurança,
  //    uma abordagem é tentar buscar um perfil público ou qualquer outra tabela
  //    que tenha o user_id como chave estrangeira.
  //    Por enquanto, vamos confiar que o ID é válido se a inserção não falhar
  //    com erro de chave estrangeira, assumindo que a RLS está configurada corretamente.
  //    Uma validação mais robusta poderia ser feita com uma função no DB.


  // 2. Inserir o cliente (ou encontrar um existente)
  let { data: client, error: clientError } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', clientName)
    .eq('role', 'client')
    .single();

  if (clientError && clientError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Erro ao buscar cliente:', clientError);
      return { error: 'Erro ao verificar cliente existente.' };
  }
  
  if (!client) {
      // Se o cliente não existe, não devemos criá-lo aqui,
      // ele deve ser criado através do fluxo de cadastro.
      // Apenas usamos o clientUserId fornecido.
      // O `clientName` do formulário é mais para referência do fotógrafo.
  }

  // 3. Inserir o álbum
  const { error: albumError } = await supabase.from('albums').insert({
    photographer_id: user.id,
    client_user_id: clientUserId, // Associar o ID do usuário cliente
    name,
    status: 'Aguardando Seleção', // Status já começa pronto para o cliente
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

const linkClientSchema = z.object({
    albumId: z.string().uuid(),
    clientUserId: z.string().uuid('ID de usuário do cliente inválido.'),
});


export async function linkClientToAlbum(formData: FormData) {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());

    const parsed = linkClientSchema.safeParse(data);

    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join('\n') };
    }

    const { albumId, clientUserId } = parsed.data;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não autenticado.' };
    }

    // Opcional: Verificar se o clientUserId existe na tabela auth.users com o role 'client'
    // Esta verificação pode ser complexa sem acesso direto à tabela auth.users.
    // Uma alternativa é confiar que o fotógrafo inseriu o ID correto.

    const { error } = await supabase
        .from('albums')
        .update({ client_user_id: clientUserId, status: 'Aguardando Seleção' })
        .eq('id', albumId)
        .eq('photographer_id', user.id);

    if (error) {
        console.error('Erro ao vincular cliente ao álbum:', error);
        return { error: `Não foi possível vincular o cliente: ${error.message}` };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
