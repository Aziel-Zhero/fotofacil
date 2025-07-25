
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockClientAlbums = [
    { id: '1', name: 'Casamento na Toscana', photographer: 'Anna Belle' },
    { id: '4', name: 'Fotos de Família no Outono', photographer: 'John Smith' },
]

export default function ClientGalleryPage() {
    return (
        <div className="container">
            <div className="flex justify-between items-center mb-4 mt-8">
                 <div>
                    <h1 className="text-3xl font-bold font-headline mb-2">Seus Álbuns Compartilhados</h1>
                    <p className="text-foreground/80">Aqui estão os álbuns compartilhados com você. Clique em um para iniciar sua seleção.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/gallery/downloads">
                        <Download className="mr-2 h-4 w-4" />
                        Ver Downloads
                    </Link>
                </Button>
            </div>


            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {mockClientAlbums.map(album => (
                    <Card key={album.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <ImageIcon className="w-10 h-10 text-primary mb-2"/>
                            <CardTitle className="font-headline">{album.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">De: {album.photographer}</p>
                            <Link href={`/gallery/album/${album.id}`} className="text-primary font-semibold mt-4 inline-block">Ver Álbum &rarr;</Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
