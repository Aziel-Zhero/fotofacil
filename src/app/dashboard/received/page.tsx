
import { AlbumCard } from '@/components/album-card';
import { Inbox } from 'lucide-react';

const mockReceivedAlbums = [
  { id: '2', name: 'Retratos Corporativos Q2', photoCount: 50, status: 'Seleção Completa', client: 'Innovate Corp' },
  { id: '3', name: 'Sessão Newborn - Baby Leo', photoCount: 80, status: 'Seleção Completa', client: 'Maria da Silva' },
];

export default function DashboardReceivedPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Álbuns Recebidos</h1>
        <p className="text-muted-foreground">Álbuns com a seleção de fotos finalizada pelo cliente, prontos para sua edição.</p>
      </div>

      {mockReceivedAlbums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockReceivedAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Nenhum álbum recebido</h2>
            <p className="text-muted-foreground mt-2">
                Quando um cliente finalizar a seleção de fotos, o álbum aparecerá aqui.
            </p>
        </div>
      )}
    </div>
  );
}
