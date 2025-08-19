
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PhotoUploader } from "@/components/photo-uploader";
import { PhotoGrid } from "@/components/photo-grid";
import { ArrowLeft, Grid3x3, Rows, Square, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoCarousel } from '@/components/photo-carousel';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getAlbumDetails, notifyClient } from '../../actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export type ViewMode = 'grid' | 'masonry' | 'carousel';

export interface Photo {
  id: number;
  url: string;
  name: string;
  created_at: string;
}

interface Album {
    id: string;
    name: string;
    status: string;
    // Adicione outras propriedades do álbum que você precisar
}

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = Array.isArray(params.albumId) ? params.albumId[0] : params.albumId;
  const { toast } = useToast();
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isNotifying, setIsNotifying] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
        if (!albumId) return;
        setIsLoading(true);
        const result = await getAlbumDetails(albumId);
        if (result.error) {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        } else {
            setAlbum(result.album as Album);
            setPhotos(result.photos || []);
        }
        setIsLoading(false);
    }
    fetchDetails();
  }, [albumId, toast]);

  const handleNotifyClient = async () => {
    if (!albumId) return;
    setIsNotifying(true);
    const result = await notifyClient(albumId);
    if(result.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
    } else {
        toast({ title: "Sucesso!", description: result.message });
        if(album) {
            setAlbum({...album, status: 'Aguardando Seleção'});
        }
    }
    setIsNotifying(false);
  }

  const renderGallery = () => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({length: 10}).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
            </div>
        )
    }

    switch (viewMode) {
      case 'carousel':
        return <PhotoCarousel photos={photos} />;
      case 'masonry':
        return <PhotoGrid photos={photos} viewMode="masonry"/>;
      case 'grid':
      default:
        return <PhotoGrid photos={photos} viewMode="grid"/>;
    }
  }

  return (
    <div className="container mx-auto py-8">
        <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Meus Álbuns
                </Link>
            </Button>
            {isLoading ? (
                <>
                    <Skeleton className="h-9 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                </>
            ) : (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline text-textDark">
                            Gerenciar Álbum: {album?.name}
                        </h1>
                        <p className="text-muted-foreground">Faça upload de novas fotos, veja a galeria e envie para o cliente.</p>
                    </div>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-12">
                {album?.status === 'Pendente' && albumId && (
                     <div>
                        <PhotoUploader albumId={albumId} />
                    </div>
                )}
                
                {photos.length > 0 && album?.status === 'Pendente' && (
                     <Alert>
                        <Send className="h-4 w-4" />
                        <AlertTitle className="font-headline">Tudo pronto para o cliente?</AlertTitle>
                        <AlertDescription className="flex flex-col gap-4 items-start">
                           <span>Quando terminar de enviar as fotos, notifique seu cliente para que ele possa começar a seleção.</span>
                            <Button onClick={handleNotifyClient} disabled={isNotifying}>
                                {isNotifying && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                <Send className="mr-2 h-4 w-4" />
                                Notificar Cliente
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
           
            <div id="gallery-section" className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold font-headline text-textDark">Galeria</h2>
                        {album?.status && <Badge>{album.status}</Badge>}
                    </div>
                    {photos.length > 0 && (
                        <ToggleGroup type="single" value={viewMode} onValueChange={(value: ViewMode) => value && setViewMode(value)} aria-label="Modo de Visualização">
                            <ToggleGroupItem value="grid" aria-label="Grade">
                                <Grid3x3 className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="masonry" aria-label="Masonry">
                                <Rows className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="carousel" aria-label="Carrossel">
                                <Square className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    )}
                 </div>
                {renderGallery()}
            </div>
        </div>
    </div>
  );
}
