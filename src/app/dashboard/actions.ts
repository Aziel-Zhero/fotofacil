
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createClientSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
});

export async function createClientByUser(formData: FormData) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Fotógrafo não autenticado. Faça login novamente.' };
    }

    const { data: photographer, error: photographerError } = await supabase
        .from('photographers')
        .select('id')
        .eq('id', user.id)
        .single();
    
    if (photographerError || !photographer) {
        return { error: 'Perfil de fotógrafo não encontrado.' };
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

    const { error: rpcError } = await supabase
        .rpc('create_client', {
            p_full_name: fullName,
            p_email: email,
            p_phone: phone,
        });

    if (rpcError) {
        if (rpcError.code === 'P0001') {
             return { error: rpcError.message };
        }
        if (rpcError.code === '23505') { 
            return { error: 'Um cliente com este email já existe.' };
        }
        console.error("Error creating client via RPC:", rpcError);
        return { error: 'Não foi possível criar o cliente: ' + rpcError.message };
    }
    
    revalidatePath('/dashboard/register-client');
    revalidatePath('/dashboard/clients');
    return { success: true, message: `Cliente "${fullName}" criado com sucesso!` };
  } catch (e: any) {
    console.error('[ServerAction ERROR] createClientByUser:', e);
    return { error: 'Erro interno no servidor ao tentar criar cliente.' };
  }
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
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());

    const { data: { user: photographerUser } } = await supabase.auth.getUser();
    if (!photographerUser) {
      return { error: 'Fotógrafo não autenticado.' };
    }

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
      expirationDate, 
      maxPhotos, 
      extraPhotoCost, 
      giftPhotos 
    } = parsed.data;
    
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientUserId)
      .eq('photographer_id', photographerUser.id)
      .single();

    if (clientError) {
        console.error('Erro ao buscar cliente:', clientError);
        return { error: 'Ocorreu um erro ao verificar o cliente.' };
    }
    if (!clientData) {
        return { error: 'O cliente selecionado não foi encontrado ou não pertence a você.' };
    }
    
    const { error: albumError } = await supabase.from('albums').insert({
      photographer_id: photographerUser.id,
      client_id: clientUserId,
      name: albumName,
      status: 'Aguardando Seleção',
      selection_limit: maxPhotos,
      extra_photo_cost: extraPhotoCost,
      courtesy_photos: giftPhotos,
      expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
    });

    if (albumError) {
      console.error('Erro ao criar álbum:', albumError);
      return { error: 'Erro ao criar álbum: ' + albumError.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/clients');
    
    return { 
      success: true,
      message: `Álbum "${albumName}" criado e vinculado ao cliente!`,
    };
  } catch (e: any) {
    console.error('[ServerAction ERROR] createAlbum:', e);
    return { error: 'Erro interno no servidor ao tentar criar álbum.' };
  }
}

export async function getClientsForPhotographer() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não autenticado', clients: [] };
    }
    
    const { data: clients, error } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .eq('photographer_id', user.id);

    if (error) {
        console.error("Erro ao buscar clientes:", error);
        return { error: 'Não foi possível carregar a lista de clientes.', clients: [] };
    }

    return { clients };
  } catch (e: any) {
    console.error('[ServerAction ERROR] getClientsForPhotographer:', e);
    return { error: 'Erro interno no servidor.', clients: [] };
  }
}

export async function getMonthlyPhotoUsage() {
  try {
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
    const formattedData = data.map((item: any) => ({
        month: monthNames[new Date(item.month).getMonth()],
        photos: item.photo_count
    }));

    return { data: formattedData };
  } catch(e: any) {
    console.error('[ServerAction ERROR] getMonthlyPhotoUsage:', e);
    return { error: 'Erro interno no servidor.', data: [] };
  }
}

const updateClientSchema = z.object({
  clientId: z.string().uuid(),
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
});

export async function updateClient(formData: FormData) {
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Fotógrafo não autenticado. Faça login novamente.' };
    }

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
        console.error("Error updating client:", error);
        if (error.code === '23505') {
            return { error: 'Este e-mail já está em uso por outro cliente.' };
        }
        return { error: 'Não foi possível atualizar o cliente.' };
    }

    revalidatePath('/dashboard/clients');
    return { success: true, message: `Cliente "${fullName}" atualizado com sucesso!` };
  } catch (e: any) {
    console.error('[ServerAction ERROR] updateClient:', e);
    return { error: 'Erro interno no servidor ao atualizar cliente.' };
  }
}

const updateClientPasswordSchema = z.object({
  clientId: z.string().uuid(),
  password: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.'),
});

export async function updateClientPassword(formData: FormData) {
  try {
    const supabase = createClient(true);
    const data = Object.fromEntries(formData.entries());

    const { data: { user: photographerUser } } = await supabase.auth.getUser();
    if (!photographerUser) {
        return { error: 'Fotógrafo não autenticado. Faça login novamente.' };
    }

    const parsed = updateClientPasswordSchema.safeParse(data);
    if (!parsed.success) {
        return { error: 'A senha deve ter pelo menos 8 caracteres.' };
    }

    const { clientId, password } = parsed.data;
    
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('auth_user_id')
      .eq('id', clientId)
      .eq('photographer_id', photographerUser.id)
      .single();

    if (clientError || !client) {
        return { error: 'Cliente não encontrado ou não pertence a você.' };
    }

    if (!client.auth_user_id) {
      return { error: 'Este cliente ainda não ativou a conta e não pode ter a senha alterada.' };
    }

    const { error: updateUserError } = await supabase.auth.admin.updateUserById(
      client.auth_user_id,
      { password: password }
    );

    if (updateUserError) {
      console.error('Error updating client password:', updateUserError);
      return { error: 'Não foi possível atualizar a senha: ' + updateUserError.message };
    }

    return { success: true, message: 'Senha do cliente atualizada com sucesso!' };
  } catch(e: any) {
    console.error('[ServerAction ERROR] updateClientPassword:', e);
    return { error: 'Erro interno no servidor ao alterar senha.' };
  }
}

const updateAlbumSchema = z.object({
  albumId: z.string().uuid(),
  name: z.string().min(1, 'O nome do álbum é obrigatório.'),
  selection_limit: z.coerce.number().min(1, 'O limite de seleção deve ser de pelo menos 1.'),
});

export async function updateAlbum(formData: FormData) {
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData.entries());
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Fotógrafo não autenticado.' };
    }

    const parsed = updateAlbumSchema.safeParse(data);
    if (!parsed.success) {
      return { error: 'Dados inválidos.' };
    }

    const { albumId, ...updateData } = parsed.data;

    const { error } = await supabase
      .from('albums')
      .update(updateData)
      .eq('id', albumId)
      .eq('photographer_id', user.id);

    if (error) {
      console.error("Error updating album:", error);
      return { error: 'Não foi possível atualizar o álbum: ' + error.message };
    }

    revalidatePath(`/dashboard/album/${albumId}`);
    return { success: true, message: 'Álbum atualizado com sucesso!' };
  } catch (e: any) {
    console.error('[ServerAction ERROR] updateAlbum:', e);
    return { error: 'Erro interno no servidor ao atualizar o álbum.' };
  }
}

export async function deleteAlbum(albumId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Fotógrafo não autenticado.' };
    }
    
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('id')
      .eq('id', albumId)
      .eq('photographer_id', user.id)
      .single();

    if (fetchError || !album) {
      return { error: 'Álbum não encontrado ou você não tem permissão para excluí-lo.' };
    }

    const { error: deleteError } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId);

    if (deleteError) {
      console.error("Error deleting album:", deleteError);
      return { error: 'Não foi possível excluir o álbum: ' + deleteError.message };
    }
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    console.error('[ServerAction ERROR] deleteAlbum:', e);
    return { error: 'Erro interno no servidor ao excluir o álbum.' };
  }
}

export async function notifyClient(albumId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Fotógrafo não autenticado.' };
    }

    const { error } = await supabase
      .from('albums')
      .update({ status: 'Aguardando Seleção' })
      .eq('id', albumId)
      .eq('photographer_id', user.id);

    if (error) {
      console.error("Error updating album status:", error);
      return { error: 'Não foi possível atualizar o status do álbum.' };
    }

    revalidatePath(`/dashboard/album/${albumId}`);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/sent');

    return { success: true };
  } catch (e: any) {
    console.error('[ServerAction ERROR] notifyClient:', e);
    return { error: 'Erro interno no servidor ao notificar o cliente.' };
  }
}
