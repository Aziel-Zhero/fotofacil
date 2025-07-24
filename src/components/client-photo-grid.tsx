
"use client";

import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Photo } from '@/app/dashboard/album/[albumId]/page';
import { cn } from '@/lib/utils';
import { Checkbox } from './ui/checkbox';
import { Eye, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface ClientPhotoGridProps {
    photos: Photo[];
    viewMode: 'grid' | 'masonry';
    selectedPhotos: Set<number>;
    onToggleSelection: (id: number) => void;
    onViewPhoto: (photo: Photo) => void;
}

export function ClientPhotoGrid({ photos, viewMode, selectedPhotos, onToggleSelection, onViewPhoto }: ClientPhotoGridProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground">Nenhuma foto disponível neste álbum.</p>
          </div>
        ) : (
          <div className={cn(
              "gap-4",
              viewMode === 'grid' && "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
              viewMode === 'masonry' && "columns-2 md:columns-3 lg:columns-4 xl:columns-5"
          )}>
            {photos.map((photo) => {
              const isSelected = selectedPhotos.has(photo.id);
              return (
                <div key={photo.id} className="relative group mb-4 break-inside-avoid" onClick={() => onToggleSelection(photo.id)}>
                    <Image
                        src={photo.url}
                        alt={photo.name}
                        width={400}
                        height={viewMode === 'grid' ? 400 : 600}
                        className={cn(
                            "rounded-md object-cover w-full cursor-pointer transition-all duration-300",
                            viewMode === 'grid' && "aspect-square",
                            isSelected && "transform scale-95 opacity-70"
                        )}
                        data-ai-hint={photo.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-md cursor-pointer">
                       <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-white hover:bg-white/20 h-14 w-14 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation(); // Evita que o clique no botão selecione a imagem
                                onViewPhoto(photo);
                            }}
                        >
                           <Eye className="h-7 w-7" />
                       </Button>
                    </div>
                    {isSelected && (
                        <div className="absolute top-3 right-3 text-white bg-primary rounded-full h-7 w-7 flex items-center justify-center">
                            <CheckCircle2 className="h-7 w-7" />
                        </div>
                    )}
                     <div 
                        className={cn(
                            "absolute top-3 left-3 h-7 w-7 bg-background/80 rounded-full border-2 border-white flex items-center justify-center transition-all",
                            isSelected && "border-primary bg-primary"
                        )}
                    >
                         <CheckCircle2 className={cn("h-5 w-5 text-white transition-opacity", !isSelected && "opacity-0")} />
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
