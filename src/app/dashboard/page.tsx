import { AlbumCard } from '@/components/album-card';
import { Button } from '@/components/ui/button';
import { CreateAlbumDialog } from '@/components/create-album-dialog';
import { PlusCircle } from 'lucide-react';
import { ProfileCompletionDialog } from '@/components/profile-completion-dialog';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const mockAlbums = [
  { id: '1', name: 'Casamento na Toscana', photoCount: 125, status: 'Aguardando Seleção', client: 'Os Silva', createdAt: '2024-07-28T00:00:00', maxPhotos: 210 },
  { id: '2', name: 'Retratos Corporativos Q2', photoCount: 50, status: 'Seleção Completa', client: 'Innovate Corp', createdAt: '2024-07-25T00:00:00', maxPhotos: 120 },
  { id: '3', name: 'Sessão Newborn - Baby Leo', photoCount: 80, status: 'Expirado', client: 'Maria da Silva', createdAt: '2024-06-15T00:00:00', maxPhotos: 120 },
  { id: '4', name: 'Fotos de Família no Outono', photoCount: 200, status: 'Aguardando Seleção', client: 'A Família Williams', createdAt: '2024-07-29T00:00:00', maxPhotos: 210 },
];


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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
      
      {!isProfileComplete && (
        <ProfileCompletionDialog user={user} />
      )}
    </div>
  );
}
