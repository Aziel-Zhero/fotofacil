
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Photo } from '@/app/dashboard/album/[albumId]/page';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would be fetched based on params.albumId
const mockAlbumData = {
    name: "Retratos Corporativos Q2 - Edição Final",
    photos: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        url: `https://placehold.co/600x${i % 2 === 0 ? '400' : '500'}.png`,
        dataAiHint: 'retrato corporativo',
        name: `Retrato_Corp_${String(i + 1).padStart(3, '0')}.jpg`
    }))
};

export default function DeliveredAlbumPage({ params }: { params: { albumId: string } }) {
  const { name, photos } = mockAlbumData;
  const { toast } = useToast();

  const handleDownloadAll = () => {
    // This is a mock download. A real implementation would involve
    // zipping files on a server and providing a download link.
    toast({
        title: "Download Iniciado",
        description: `O download de ${name}.zip começará em breve.`,
    });
  }

  return (
    <div className="container mx-auto py-8">
        <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 text-stone-300 hover:bg-stone-700">
                <Link href="/gallery/delivered">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Álbuns Entregues
                </Link>
            </Button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-stone-300">Álbum: {name}</h1>
                    <p className="text-stone-300/80">Estas são as suas fotos finalizadas. Faça o download para o seu dispositivo.</p>
                </div>
                <Button size="lg" onClick={handleDownloadAll}>
                    <Download className="mr-2 h-5 w-5" />
                    Download de Todas as Fotos
                </Button>
            </div>
        </div>
        
        <Card>
            <CardContent className="p-4">
            {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground">Nenhuma foto disponível neste álbum.</p>
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className="relative group mb-4 break-inside-avoid">
                            <Image
                                src={photo.url}
                                alt={photo.name}
                                width={600}
                                height={400}
                                className="rounded-md object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={photo.dataAiHint}
                            />
                        </div>
                    ))}
                </div>
            )}
            </CardContent>
        </Card>
    </div>
  );
}
