
import { AlbumCard } from '@/components/album-card';
import { CheckCircle } from 'lucide-react';

const mockDeliveredAlbums = [
  { id: '10', name: 'Aniversário de 1 Ano - Laura', photoCount: 150, status: 'Entregue', client: 'Família Souza' },
  { id: '11', name: 'Ensaio Gestante - Carla', photoCount: 75, status: 'Entregue', client: 'Carla e Pedro' },
];

export default function DashboardDeliveredPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Álbuns Entregues</h1>
        <p className="text-muted-foreground">Aqui está o histórico de todos os seus projetos finalizados e disponíveis para download pelo cliente.</p>
      </div>

      {mockDeliveredAlbums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockDeliveredAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Nenhum álbum foi entregue ainda</h2>
            <p className="text-muted-foreground mt-2">
                Quando você enviar as fotos editadas para um cliente, o álbum aparecerá aqui.
            </p>
        </div>
      )}
    </div>
  );
}
