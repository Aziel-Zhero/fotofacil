
"use client";

import { useState } from 'react';
import { PhotoGrid } from "@/components/photo-grid";
import { ArrowLeft, Grid3x3, Rows, Square } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoCarousel } from '@/components/photo-carousel';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Photo } from '@/app/dashboard/album/[albumId]/page'; // Re-using type

export type ViewMode = 'grid' | 'masonry' | 'carousel';

export default function ClientAlbumPage({ params }: { params: { albumId: string } }) {
  const albumName = "Casamento na Toscana"; // Mock data
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [photos, setPhotos] = useState<Photo[]>(
    Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        url: `https://placehold.co/400x${i % 2 === 0 ? '400' : '600'}.png`,
        dataAiHint: 'casal de noivos',
        name: `Foto_${String(i + 1).padStart(3, '0')}.jpg`
    }))
  );

  const renderGallery = () => {
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
                <Link href="/gallery">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Meus Álbuns
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">Álbum: {albumName}</h1>
            <p className="text-muted-foreground">Visualize as fotos e faça sua seleção.</p>
        </div>
        
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold font-headline">Galeria</h2>
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
  );
}
