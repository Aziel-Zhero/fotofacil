import { AlbumCard } from '@/components/album-card';
import { Button } from '@/components/ui/button';
import { CreateAlbumDialog } from '@/components/create-album-dialog';
import { PlusCircle, GalleryVertical } from 'lucide-react';
import { ProfileCompletionDialog } from '@/components/profile-completion-dialog';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Mock de dados removido para exibir um estado real
const mockAlbums: any[] = [];


export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Verificar se o perfil está completo. Em um app real, você teria uma coluna como `profile_complete`
  const isProfileComplete = user.user_metadata?.companyName; // Usando companyName como indicador

  return (
    <div className="container mx-auto py-8">

      <div className="flex justify-between items-center mb-8 mt-12">
        <div>
          <h1 className="text-3xl font-bold font-headline">Seus Álbuns</h1>
          <p className="text-muted-foreground">Gerencie seus projetos e seleções de clientes.</p>
        </div>
        <CreateAlbumDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Álbum
          </Button>
        </CreateAlbumDialog>
      </div>
        
      {mockAlbums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
            ))}
        </div>
        ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <GalleryVertical className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Nenhum álbum criado ainda</h2>
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
