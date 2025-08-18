
import { AlbumCard } from '@/components/album-card';
import { Send } from 'lucide-react';

const mockSentAlbums = [
  { id: '1', name: 'Casamento Ana e Bruno', photoCount: 850, status: 'Aguardando Seleção', client: 'Ana e Bruno' },
  { id: '4', name: 'Evento Corporativo ACME', photoCount: 400, status: 'Aguardando Seleção', client: 'ACME Inc' },
  { id: '5', name: 'Ensaio de Família Oliveira', photoCount: 250, status: 'Expirado', client: 'Família Oliveira' },
];

export default function DashboardSentPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Álbuns Enviados</h1>
        <p className="text-muted-foreground">Acompanhe o status dos álbuns que você enviou para a seleção dos clientes.</p>
      </div>

      {mockSentAlbums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockSentAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Nenhum álbum enviado ainda</h2>
            <p className="text-muted-foreground mt-2">
                Quando você criar um álbum e o compartilhar, ele aparecerá aqui para acompanhamento.
            </p>
        </div>
      )}
    </div>
  );
}
