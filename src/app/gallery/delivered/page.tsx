
import Folder from "@/components/folder";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const mockDeliveredAlbums = [
    { id: '2', name: 'Retratos Corporativos Q2 - Edição Final', color: '#0077b6' },
    { id: '3', name: 'Sessão Newborn - Baby Leo - Aprovadas', color: '#0096c7' },
]

export default function ClientDeliveredPage() {
    return (
        <div className="container">
            <div className="mb-8 mt-8">
                <h1 className="text-3xl font-bold font-headline text-foreground/90">Álbuns Entregues</h1>
                <p className="text-muted-foreground text-foreground/80">Aqui estão seus álbuns finalizados. Clique em uma pasta para ver as fotos.</p>
            </div>
           
            {mockDeliveredAlbums.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 py-16">
                    {mockDeliveredAlbums.map(album => (
                        <Folder key={album.id} albumName={album.name} color={album.color} size={2} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">Nenhum álbum entregue ainda</h2>
                    <p className="text-muted-foreground mt-2">
                       Assim que um fotógrafo finalizar a edição de um álbum selecionado por você, <br/> ele aparecerá aqui.
                    </p>
                    <Button variant="secondary" asChild className="mt-4">
                       <Link href="/gallery">Voltar para Meus Álbuns</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
