
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Photo } from '@/app/dashboard/album/[albumId]/page';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
    photos: Photo[];
    viewMode: 'grid' | 'masonry';
}

export function PhotoGrid({ photos, viewMode }: PhotoGridProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground">Nenhuma foto enviada ainda.</p>
            <p className="text-sm text-muted-foreground">Use o uploader acima para adicionar fotos a este álbum.</p>
          </div>
        ) : (
          <TooltipProvider delayDuration={200}>
             <div className={cn(
                "gap-4",
                viewMode === 'grid' && "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
                viewMode === 'masonry' && "columns-2 md:columns-3 lg:columns-4 xl:columns-5"
             )}>
                {photos.map((photo, index) => (
                    <Tooltip key={photo.id}>
                        <TooltipTrigger asChild>
                            <div className="relative group mb-4 break-inside-avoid">
                                <Image
                                src={photo.url}
                                alt={photo.name || `Foto ${photo.id}`}
                                width={400}
                                height={viewMode === 'grid' ? 400 : 600}
                                className={cn(
                                    "rounded-md object-cover w-full",
                                    viewMode === 'grid' && "aspect-square",
                                    "transition-transform duration-200 group-hover:scale-105"
                                )}
                                />
                                <Badge className="absolute top-2 left-2">
                                    {String(index + 1).padStart(3, '0')}
                                </Badge>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-0 border-0 bg-transparent shadow-xl">
                             <Image
                                src={photo.url}
                                alt={`Pré-visualização ${photo.id}`}
                                width={300}
                                height={300}
                                className="rounded-md object-contain"
                              />
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
