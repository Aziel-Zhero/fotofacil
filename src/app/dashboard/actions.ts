
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

    const { data: newClient, error: rpcError } = await supabase
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
        return { error: `Não foi possível criar o cliente: ${rpcError.message}` };
    }
    
    revalidatePath('/dashboard/register-client');
    revalidatePath('/dashboard/clients');
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
    clientUserId, // Este é o ID da tabela 'clients'
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

  // Verificar se o cliente selecionado realmente existe e pertence a este fotógrafo.
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientUserId)
    .eq('photographer_id', photographerUser.id) // Garante segurança
    .single();

  if (clientError || !clientData) {
      return { error: `O cliente selecionado não foi encontrado ou não pertence a você.` };
  }
  
  // Inserir o novo álbum.
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
    return { error: `Erro ao criar álbum: ${albumError.message}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/clients');
  
  return { 
    success: true,
    message: `Álbum "${albumName}" criado e vinculado ao cliente!`,
  };
}


// Função para buscar os clientes de um fotógrafo (usado no diálogo)
export async function getClientsForPhotographer() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não autenticado' };
    }
    
    // Busca na tabela 'clients' os clientes que pertencem ao fotógrafo logado.
    const { data: clients, error } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .eq('photographer_id', user.id);

    if (error) {
        console.error("Erro ao buscar clientes:", error);
        return { error: 'Não foi possível carregar a lista de clientes.' };
    }

    return { clients };
}


// Função para buscar os dados de uso de fotos dos últimos 6 meses.
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

    // Formata os dados para o gráfico
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const formattedData = data.map(item => ({
        month: monthNames[new Date(item.month).getMonth()],
        photos: item.photo_count
    }));

    return { data: formattedData };
}

export async function resetClientPassword(clientId: string) {
    const supabase = createClient(true); 

    const { data: client, error: clientError } = await supabase.from('clients')
        .select('auth_user_id, email')
        .eq('id', clientId)
        .single();
    
    if (clientError || !client) {
        return { error: "Cliente não encontrado." };
    }
    
    if (!client.auth_user_id) {
        return { error: "Este cliente ainda não ativou uma conta de login e não pode ter a senha redefinida." };
    }
    
    if (!client.email) {
        return { error: "Cliente não possui um email cadastrado para o envio da redefinição." };
    }

    const { error } = await supabase.auth.admin.resetPasswordForEmail(client.email);

    if (error) {
        console.error("Admin reset password error:", error);
        return { error: `Erro do servidor ao redefinir a senha: ${error.message}` };
    }
    
    revalidatePath('/dashboard/clients');
    return { success: true, message: `Um e-mail para redefinição de senha foi enviado para ${client.email}.` };
}

const updateClientSchema = z.object({
  clientId: z.string().uuid(),
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
});

export async function updateClient(formData: FormData) {
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
        .eq('photographer_id', user.id); // Security check

    if (error) {
        console.error("Error updating client:", error);
        if (error.code === '23505') { // unique_violation on email
            return { error: 'Este e-mail já está em uso por outro cliente.' };
        }
        return { error: 'Não foi possível atualizar o cliente.' };
    }

    revalidatePath('/dashboard/clients');
    return { success: true, message: `Cliente "${fullName}" atualizado com sucesso!` };
}
