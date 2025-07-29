
import { AlbumCard } from '@/components/album-card';
import { Button } from '@/components/ui/button';
import { CreateAlbumDialog } from '@/components/create-album-dialog';
import { PlusCircle, GalleryVertical } from 'lucide-react';
import { ProfileCompletionDialog } from '@/components/profile-completion-dialog';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch albums first
  const { data: albums, error: albumsError } = await supabase
    .from('albums')
    .select('*')
    .eq('photographer_id', user.id)
    .order('created_at', { ascending: false });

  if (albumsError) {
    console.error("Error fetching albums:", albumsError);
    // You could return an error message to the user here
    return <div>Error loading albums.</div>;
  }
  
  const getClientName = async (clientUserId: string | null) => {
    if (!clientUserId) return 'Cliente não vinculado';
    const { data, error } = await supabase.from('profiles').select('full_name').eq('id', clientUserId).single();
    if (error) return 'Cliente não encontrado';
    return data.full_name;
  };

  const getPhotoCount = async (albumId: string) => {
    const { count, error } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('album_id', albumId);
    if (error) return 0;
    return count;
  }

  const formattedAlbums = await Promise.all(albums?.map(async (album) => ({
    id: album.id,
    name: album.name,
    photoCount: await getPhotoCount(album.id),
    maxPhotos: album.selection_limit,
    status: album.status,
    client: await getClientName(album.client_user_id),
    createdAt: album.created_at,
    clientUserId: album.client_user_id
  })) || []);
  
  const isProfileComplete = user.user_metadata?.companyName;

  return (
    <div className="container mx-auto py-8">

      <div className="flex justify-between items-center mb-8 mt-12">
        <div>
          <h1 className="text-3xl font-bold font-headline text-textDark">Seus Álbuns</h1>
          <p className="text-muted-foreground">Gerencie seus projetos e seleções de clientes.</p>
        </div>
        <CreateAlbumDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Álbum
          </Button>
        </CreateAlbumDialog>
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
            <h2 className="text-xl font-semibold text-textDark">Nenhum álbum criado ainda</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
               Clique em "Criar Álbum" para começar a organizar seu primeiro projeto e compartilhá-lo com seu cliente.
            </p>
        </div>
      )}
      
      {!isProfileComplete && (
        <ProfileCompletionDialog user={user} />
      )}
    </div>
  );
}
