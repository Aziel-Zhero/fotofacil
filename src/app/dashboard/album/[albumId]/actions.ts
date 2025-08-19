
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { autoImageTagging } from '@/ai/flows/image-tagging';
import { type Photo } from './page';

const uploadPhotoSchema = z.object({
  albumId: z.string().uuid(),
  photoName: z.string(),
  photoDataUri: z.string(),
});

export async function uploadPhoto(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Fotógrafo não autenticado.' };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = uploadPhotoSchema.safeParse(data);

    if (!parsed.success) {
        return { error: 'Dados da foto inválidos.' };
    }

    const { albumId, photoName, photoDataUri } = parsed.data;

    // TODO: Adicionar upload para o Supabase Storage aqui
    // Por enquanto, vamos usar a data URI diretamente como a URL.
    const photoUrl = photoDataUri;

    // Gerar tags com IA
    let tags: string[] = [];
    try {
        const taggingResult = await autoImageTagging({ photoDataUri });
        tags = taggingResult.tags;
    } catch (aiError) {
        console.error("AI Tagging Error:", aiError);
        // Não impede o upload, apenas loga o erro.
    }
    
    // Inserir no banco de dados
    const { data: newPhotoData, error: insertError } = await supabase
        .from('photos')
        .insert({
            album_id: albumId,
            url: photoUrl,
            name: photoName,
            tags: tags,
        })
        .select()
        .single();
    
    if (insertError) {
        console.error("Error inserting photo:", insertError);
        return { error: `Não foi possível salvar a foto: ${insertError.message}` };
    }

    revalidatePath(`/dashboard/album/${albumId}`);
    
    const returnedPhoto: Photo = {
        id: newPhotoData.id,
        url: newPhotoData.url,
        name: newPhotoData.name || 'foto',
        dataAiHint: newPhotoData.tags?.join(' ') || ''
    };

    return { data: returnedPhoto };
}

export async function getAlbumDetails(albumId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Não autenticado', data: null };
    }

    const { data, error } = await supabase
        .from('albums')
        .select('id, name, selection_limit, status')
        .eq('id', albumId)
        .eq('photographer_id', user.id)
        .single();
    
    if (error) {
        return { error: error.message, data: null };
    }

    return { data, error: null };
}

export async function getPhotosForAlbum(albumId: string) {
    const supabase = createClient();
     const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Não autenticado', data: null };
    }

    const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

     if (error) {
        return { error: error.message, data: null };
    }

    return { data, error: null };
}
