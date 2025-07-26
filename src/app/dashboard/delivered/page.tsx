
import { AlbumCard } from '@/components/album-card';

const mockDeliveredAlbums = [
  { id: '2', name: 'Retratos Corporativos Q2', photoCount: 50, status: 'Entregue', client: 'Innovate Corp' },
  { id: '3', name: 'Sessão Newborn - Baby Leo', photoCount: 80, status: 'Entregue', client: 'Maria da Silva' },
];

export default function DashboardDeliveredPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Álbuns Entregues</h1>
        <p className="text-muted-foreground">Aqui está um histórico de todos os seus projetos finalizados e entregues.</p>
      </div>

      {mockDeliveredAlbums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockDeliveredAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">Nenhum álbum entregue ainda</h2>
            <p className="text-muted-foreground mt-2">
                Quando um álbum tiver sua seleção finalizada pelo cliente, ele aparecerá aqui.
            </p>
        </div>
      )}
    </div>
  );
}
