
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GalleryVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data, em um app real, isso viria do banco de dados após o login
const mockClientAlbums = [
    { id: '1', name: 'Casamento na Toscana', status: 'Aguardando Seleção' },
    { id: '4', name: 'Aniversário Julia 5 anos', status: 'Aguardando Seleção' },
];

export default function ClientGalleryPage() {
    return (
        <div className="container">
             <div className="mb-8 mt-8">
                <h1 className="text-3xl font-bold font-headline text-stone-300">Meus Álbuns</h1>
                <p className="text-stone-300/80">Aqui estão os álbuns que seu fotógrafo compartilhou com você. Clique para selecionar suas fotos.</p>
            </div>

            {mockClientAlbums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockClientAlbums.map(album => (
                        <Card key={album.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="font-headline">{album.name}</CardTitle>
                                <CardDescription>{album.status}</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Button asChild className="w-full">
                                   <Link href={`/gallery/album/${album.id}`}>
                                        Ver e Selecionar Fotos
                                   </Link>
                               </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30 border-border">
                    <GalleryVertical className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold text-textDark">Nenhum álbum compartilhado ainda</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                       Assim que seu fotógrafo compartilhar um álbum com você, ele aparecerá aqui.
                    </p>
                </div>
            )}
        </div>
    )
}
