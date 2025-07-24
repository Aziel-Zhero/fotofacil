
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, HardDriveDownload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockDownloadableAlbums = [
    { id: '2', name: 'Retratos Corporativos Q2 - Edição Final', photographer: 'John Smith', date: '20/05/2024'},
    { id: '3', name: 'Sessão Newborn - Baby Leo - Aprovadas', photographer: 'Anna Belle', date: '15/04/2024' },
]

export default function ClientDownloadsPage() {
    return (
        <div className="container">
            <div className="mb-8 mt-8">
                <h1 className="text-3xl font-bold font-headline">Seus Downloads</h1>
                <p className="text-muted-foreground">Aqui estão os álbuns finalizados e prontos para baixar.</p>
            </div>
           
            {mockDownloadableAlbums.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockDownloadableAlbums.map(album => (
                        <Card key={album.id}>
                            <CardHeader>
                                <HardDriveDownload className="w-10 h-10 text-primary mb-2"/>
                                <CardTitle className="font-headline">{album.name}</CardTitle>
                                <CardDescription>Finalizado em {album.date} por {album.photographer}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full">
                                    <Download className="mr-2 h-4 w-4"/>
                                    Baixar Álbum Completo (.zip)
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">Nenhum download disponível</h2>
                    <p className="text-muted-foreground mt-2">
                       Assim que um fotógrafo finalizar a edição de um álbum selecionado por você, <br/> ele aparecerá aqui para download.
                    </p>
                    <Button variant="secondary" asChild className="mt-4">
                       <Link href="/gallery">Voltar para Meus Álbuns</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
