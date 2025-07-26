

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
                <h1 className="text-3xl font-bold font-headline text-stone-300">Álbuns Entregues</h1>
                <p className="text-stone-300/80">Aqui estão seus álbuns finalizados. Clique em uma pasta para ver as fotos.</p>
            </div>
           
            {mockDeliveredAlbums.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 py-16">
                    {mockDeliveredAlbums.map(album => (
                        <Link key={album.id} href={`/gallery/delivered/${album.id}`}>
                            <Folder albumName={album.name} color={album.color} size={1.5} />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg border-stone-300/20">
                    <h2 className="text-xl font-semibold text-stone-300">Nenhum álbum entregue ainda</h2>
                    <p className="text-stone-300/80 mt-2">
                       Assim que um fotógrafo finalizar a edição de um álbum selecionado por você, <br/> ele aparecerá aqui.
                    </p>
                    <Button variant="secondary" asChild className="mt-4">
                       <Link href="/gallery">Voltar para Seleção de Fotos</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
