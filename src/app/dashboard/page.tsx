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

  const { data: albums, error } = await supabase
    .from('albums')
    .select(`
      id,
      name,
      status,
      created_at,
      selection_limit,
      photos(count),
      clients(name)
    `)
    .eq('photographer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching albums:", error);
    // Handle error appropriately
  }

  const isProfileComplete = user.user_metadata?.companyName; 

  const formattedAlbums = albums?.map(album => ({
    id: album.id,
    name: album.name,
    photoCount: album.photos[0]?.count || 0,
    maxPhotos: album.selection_limit,
    status: album.status,
    client: (album.clients as { name: string })?.name || 'Cliente não encontrado',
    createdAt: album.created_at,
  })) || [];

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
