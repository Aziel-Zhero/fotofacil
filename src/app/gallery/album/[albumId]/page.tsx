
"use client";

import { useState, useEffect } from 'react';
import { Grid3x3, Rows, Square, Send, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoCarousel } from '@/components/photo-carousel';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Photo } from '@/app/dashboard/album/[albumId]/page'; 
import { ClientPhotoGrid } from '@/components/client-photo-grid';
import { PhotoViewerModal } from '@/components/photo-viewer-modal';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export type ViewMode = 'grid' | 'masonry' | 'carousel';

export default function ClientAlbumPage({ params }: { params: { albumId: string } }) {
  const router = useRouter();
  
  // A autenticação agora é gerenciada pelo middleware do Supabase.
  // Se o usuário chegar aqui, ele tem permissão.
  
  // Mock data - em uma aplicação real, seria buscado do Supabase
  const albumName = "Casamento na Toscana"; 
  const photoLimit = 50;
  const [photos, setPhotos] = useState<Photo[]>(
    Array.from({ length: 125 }, (_, i) => ({
        id: i + 1,
        url: `https://placehold.co/400x${i % 2 === 0 ? '400' : '600'}.png`,
        dataAiHint: 'casal de noivos',
        name: `Foto_${String(i + 1).padStart(3, '0')}.jpg`
    }))
  );

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const toggleSelection = (photoId: number) => {
    setSelectedPhotos(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(photoId)) {
            newSelection.delete(photoId);
        } else {
            if (newSelection.size < photoLimit) {
                newSelection.add(photoId);
            } else {
                 toast({
                    title: "Limite Atingido",
                    description: `Você já selecionou o máximo de ${photoLimit} fotos.`,
                    variant: "destructive"
                })
            }
        }
        return newSelection;
    });
  };

  const handleSubmitSelection = () => {
    toast({
        title: "Seleção Enviada com Sucesso!",
        description: "O fotógrafo foi notificado. Em breve, um novo álbum com suas fotos editadas estará disponível para download.",
        duration: 5000,
    });
    setSelectedPhotos(new Set());
  }

  const handleViewPhoto = (photo: Photo) => {
    const photoIndex = photos.findIndex(p => p.id === photo.id);
    if(photoIndex !== -1) {
        setViewingPhotoIndex(photoIndex);
    }
  }

  const handleCloseViewer = () => {
    setViewingPhotoIndex(null);
  }

  const handleNextPhoto = () => {
    if (viewingPhotoIndex !== null) {
      setViewingPhotoIndex((viewingPhotoIndex + 1) % photos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (viewingPhotoIndex !== null) {
      setViewingPhotoIndex((viewingPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  const renderGallery = () => {
    switch (viewMode) {
      case 'carousel':
        return <PhotoCarousel photos={photos} />;
      case 'masonry':
      case 'grid':
      default:
        return <ClientPhotoGrid 
                    photos={photos} 
                    viewMode={viewMode}
                    selectedPhotos={selectedPhotos}
                    onToggleSelection={toggleSelection}
                    onViewPhoto={handleViewPhoto}
                />;
    }
  }

  return (
    <>
        <div className="container mx-auto py-8 mb-24 md:mb-20"> {/* Margin bottom to make space for the footer */}
            <div className="mb-8">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/gallery">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Meus Álbuns
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline text-foreground/90">Álbum: {albumName}</h1>
                <p className="text-muted-foreground">
                    Visualize as {photos.length} fotos e faça sua seleção. Você pode escolher até {photoLimit} fotos.
                </p>
            </div>
            
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold font-headline text-foreground/90">Galeria</h2>
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
                    </div>
                {renderGallery()}
            </div>
        </div>

        {/* Footer com contador e botão */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t shadow-lg z-50">
            <div className="container flex items-center justify-between h-20">
                <div>
                    <p className="text-lg font-bold">
                        <span className="text-primary">{selectedPhotos.size}</span> / {photoLimit}
                    </p>
                    <p className="text-sm text-muted-foreground">fotos selecionadas</p>
                </div>
                <Button 
                    size="lg" 
                    onClick={handleSubmitSelection}
                    disabled={selectedPhotos.size === 0}
                >
                    <Send className="mr-2 h-4 w-4"/>
                    Enviar Seleção
                </Button>
            </div>
        </footer>

        {viewingPhotoIndex !== null && (
            <PhotoViewerModal
                photos={photos}
                currentIndex={viewingPhotoIndex}
                onClose={handleCloseViewer}
                onNext={handleNextPhoto}
                onPrev={handlePrevPhoto}
                selectedPhotos={selectedPhotos}
                onToggleSelection={toggleSelection}
            />
        )}
    </>
  );
}
