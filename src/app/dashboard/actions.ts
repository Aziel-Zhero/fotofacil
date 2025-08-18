
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Photo } from './album/[albumId]/page';

const createClientSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
});

export async function createClientByUser(formData: FormData) {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Fotógrafo não autenticado. Faça login novamente.' };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = createClientSchema.safeParse(data);

    if (!parsed.success) {
        let errorMessages = '';
        parsed.error.issues.forEach(issue => {
            errorMessages += issue.message + '\n';
        });
        return { error: errorMessages.trim() };
    }

    const { fullName, email, phone } = parsed.data;
    
    // Chamando a função RPC para criar o cliente.
    // O createClient(true) usa a service_role key para ter permissão.
    const { data: newClient, error } = await createClient(true)
        .rpc('create_client', {
            p_full_name: fullName,
            p_email: email,
            p_phone: phone,
        });

    if (error) {
        if (error.code === '23505') { 
            return { error: 'Um cliente com este email já existe.' };
        }
        console.error("Error creating client via RPC:", error);
        return { error: `Não foi possível criar o cliente: ${error.message}` };
    }
    
    revalidatePath('/dashboard/register-client');
    return { success: true, message: `Cliente "${fullName}" criado com sucesso!` };
}


const createAlbumSchema = z.object({
  albumName: z.string().min(1, 'O nome do álbum é obrigatório.'),
  clientUserId: z.string().uuid('Selecione um cliente válido.'),
  pixKey: z.string().optional(),
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
    clientUserId, 
    pixKey,
    expirationDate, 
    maxPhotos, 
    extraPhotoCost, 
    giftPhotos 
  } = parsed.data;
  
  const { data: { user: photographerUser } } = await supabase.auth.getUser();

  if (!photographerUser) {
    return { error: 'Fotógrafo não autenticado.' };
  }
  
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientUserId)
    .eq('photographer_id', photographerUser.id) 
    .single();

  if (clientError || !clientData) {
      return { error: `O cliente selecionado não foi encontrado ou não pertence a você.` };
  }
  
  const { error: albumError } = await supabase.from('albums').insert({
    photographer_id: photographerUser.id,
    client_id: clientUserId,
    name: albumName,
    status: 'Pendente', // Novo status inicial
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
    message: `Álbum "${albumName}" criado e vinculado ao cliente!`,
  };
}


export async function getClientsForPhotographer() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não autenticado', clients: [] };
    }
    
    const { data: clients, error } = await supabase
        .from('clients')
        .select('id, full_name, email, phone')
        .eq('photographer_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar clientes:", error);
        return { error: 'Não foi possível carregar a lista de clientes.', clients: [] };
    }

    return { clients: clients || [] };
}

const updateClientSchema = z.object({
    clientId: z.string().uuid(),
    fullName: z.string().min(1, 'Nome completo é obrigatório.'),
    email: z.string().email('Email inválido.'),
    phone: z.string().min(1, 'Telefone é obrigatório.'),
});

export async function updateClient(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Fotógrafo não autenticado.' };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updateClientSchema.safeParse(data);

    if (!parsed.success) {
        return { error: 'Dados inválidos.' };
    }

    const { clientId, fullName, email, phone } = parsed.data;

    const { error } = await supabase
        .from('clients')
        .update({ full_name: fullName, email, phone })
        .eq('id', clientId)
        .eq('photographer_id', user.id);

    if (error) {
        console.error("Erro ao atualizar cliente:", error);
        return { error: 'Não foi possível atualizar o cliente.' };
    }

    revalidatePath('/dashboard/clients');
    return { success: true, message: 'Cliente atualizado com sucesso!' };
}

export async function getMonthlyPhotoUsage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não autenticado', data: [] };
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await supabase.rpc('get_monthly_photo_usage', {
        p_photographer_id: user.id,
        p_start_date: sixMonthsAgo.toISOString()
    });

    if (error) {
        console.error("Erro ao buscar uso mensal:", error);
        return { error: "Não foi possível carregar os dados do gráfico.", data: [] };
    }

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const formattedData = (data || []).map(item => ({
        month: monthNames[new Date(item.month).getMonth()],
        photos: item.photo_count
    }));

    return { data: formattedData };
}


export async function getAlbumDetails(albumId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };
    
    const { data: album, error } = await supabase
        .from('albums')
        .select('*, clients (full_name)')
        .eq('id', albumId)
        .eq('photographer_id', user.id)
        .single();
        
    if (error) return { error: 'Álbum não encontrado ou sem permissão.' };
    
    const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

    if (photosError) return { error: 'Erro ao buscar fotos.' };

    return { album, photos: (photos as Photo[]) || [] };
}


export async function uploadPhotos(albumId: string, files: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    const photoFiles = files.getAll('photos') as File[];
    if (!photoFiles.length) return { error: 'Nenhum arquivo enviado.' };

    const photoEntries = [];

    for (const file of photoFiles) {
        const filePath = `${user.id}/${albumId}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from('album-photos').upload(filePath, file);

        if (uploadError) {
            console.error('Erro no upload:', uploadError);
            return { error: `Falha ao enviar ${file.name}.` };
        }

        const { data: { publicUrl } } = supabase.storage.from('album-photos').getPublicUrl(filePath);
        
        photoEntries.push({
            album_id: albumId,
            photographer_id: user.id,
            url: publicUrl,
            name: file.name
        });
    }

    const { error: insertError } = await supabase.from('photos').insert(photoEntries);

    if (insertError) {
        console.error('Erro ao inserir no BD:', insertError);
        return { error: 'Falha ao salvar fotos no banco de dados.' };
    }

    revalidatePath(`/dashboard/album/${albumId}`);
    return { success: true };
}


export async function notifyClient(albumId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    const { error } = await supabase
        .from('albums')
        .update({ status: 'Aguardando Seleção' })
        .eq('id', albumId)
        .eq('photographer_id', user.id);

    if (error) {
        console.error('Erro ao notificar cliente:', error);
        return { error: 'Não foi possível atualizar o status do álbum.' };
    }

    revalidatePath(`/dashboard/album/${albumId}`);
    revalidatePath('/dashboard');
    return { success: true, message: 'Cliente notificado! O álbum agora está aguardando a seleção.' };
}


export async function getAlbumsForDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não autenticado.', albums: [] };
    }

    // Tenta primeiro a consulta otimizada com a VIEW.
    const { data: albumsFromView, error: viewError } = await supabase
        .from('albums_with_counts')
        .select('*')
        .eq('photographer_id', user.id)
        .order('created_at', { ascending: false });

    if (!viewError) {
        // Sucesso com a VIEW! Retorna os dados formatados.
        const formattedAlbums = albumsFromView.map((album: any) => ({
            id: album.id,
            name: album.name,
            photoCount: album.photo_count,
            maxPhotos: album.selection_limit,
            status: album.status,
            client: album.client_name || 'Cliente não vinculado',
            createdAt: album.created_at,
            clientUserId: album.client_id || null,
        }));
        return { albums: formattedAlbums, error: null };
    }
    
    // Se a VIEW falhou (provavelmente porque não existe), registra o erro e tenta o método antigo.
    console.warn("Could not fetch from 'albums_with_counts' view. Falling back to unoptimized query. Please run the SQL migration script. Error: ", viewError.message);

    // Fallback: Consulta antiga e ineficiente (N+1)
    const { data: albums, error: albumsError } = await supabase
        .from('albums')
        .select('*, clients(full_name)')
        .eq('photographer_id', user.id)
        .order('created_at', { ascending: false });

    if (albumsError) {
        console.error('Error fetching albums (fallback):', albumsError);
        return { error: 'Falha grave ao carregar os dados dos álbuns.', albums: [] };
    }

    // Mapeamento manual dos dados, já que a consulta de fallback é diferente
    const formattedAlbumsWithFallback = await Promise.all(
        (albums || []).map(async (album: any) => {
            const { count, error: countError } = await supabase
                .from('photos')
                .select('id', { count: 'exact', head: true })
                .eq('album_id', album.id);

            return {
                id: album.id,
                name: album.name,
                photoCount: countError ? 0 : count,
                maxPhotos: album.selection_limit,
                status: album.status,
                client: album.clients?.full_name || 'Cliente não vinculado',
                createdAt: album.created_at,
                clientUserId: album.client_id || null,
            };
        })
    );

    return { 
        albums: formattedAlbumsWithFallback, 
        error: "Atenção: A aplicação está operando em modo de baixa performance. Execute o script SQL no painel do Supabase para otimizar o carregamento."
    };
}
