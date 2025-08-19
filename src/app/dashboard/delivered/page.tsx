
import { AlbumCard } from '@/components/album-card';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GalleryVertical } from 'lucide-react';

export default async function DashboardDeliveredPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Busca álbuns com status "Entregue" para o fotógrafo logado
  const { data: albums, error: albumsError } = await supabase
    .from('albums')
    .select('*, clients(full_name)')
    .eq('photographer_id', user.id)
    .eq('status', 'Entregue') // Filtra apenas pelos entregues
    .order('created_at', { ascending: false });

  if (albumsError) {
    console.error("Error fetching delivered albums:", albumsError);
    return <div>Erro ao carregar álbuns entregues.</div>;
  }

  // Função para contar as fotos por álbum
  const getPhotoCount = async (albumId: string) => {
    const { count, error } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('album_id', albumId);
    if (error) return 0;
    return count;
  }

  // Formata os álbuns com a contagem de fotos
  const formattedAlbums = await Promise.all(albums?.map(async (album: any) => ({
    id: album.id,
    name: album.name,
    photoCount: await getPhotoCount(album.id),
    maxPhotos: album.selection_limit,
    status: album.status,
    client: album.clients?.full_name || 'Cliente não vinculado',
    createdAt: album.created_at,
    clientUserId: album.client_id || null,
  })) || []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Álbuns Entregues</h1>
        <p className="text-muted-foreground">Aqui está um histórico de todos os seus projetos finalizados e entregues.</p>
      </div>

      {formattedAlbums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {formattedAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30 border-border">
            <GalleryVertical className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-textDark">Nenhum álbum entregue ainda</h2>
            <p className="text-muted-foreground mt-2">
                Quando um álbum tiver sua seleção finalizada pelo cliente, ele aparecerá aqui.
            </p>
        </div>
      )}
    </div>
  );
}
