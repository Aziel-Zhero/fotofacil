import { PhotoUploader } from "@/components/photo-uploader";
import { PhotoGrid } from "@/components/photo-grid";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AlbumDetailPage({ params }: { params: { albumId: string } }) {
  const albumName = "Casamento na Toscana"; // Mock data

  return (
    <div className="container mx-auto py-8">
        <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Álbuns
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">Gerenciar Álbum: {albumName}</h1>
            <p className="text-muted-foreground">Faça upload de novas fotos e veja a galeria atual.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h2 className="text-xl font-bold font-headline mb-4">Enviar Fotos</h2>
                <PhotoUploader />
            </div>
            <div className="lg:col-span-2">
                 <h2 className="text-xl font-bold font-headline mb-4">Galeria</h2>
                <PhotoGrid />
            </div>
        </div>
    </div>
  );
}
