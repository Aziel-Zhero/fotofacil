import Image from 'next/image';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: `https://placehold.co/400x400.png`,
    dataAiHint: 'casal de noivos'
}));

export function PhotoGrid() {
  return (
    <Card>
      <CardContent className="p-4">
        {mockPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground">Nenhuma foto enviada ainda.</p>
            <p className="text-sm text-muted-foreground">Use o uploader para adicionar fotos a este álbum.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockPhotos.map((photo, index) => (
              <div key={photo.id} className="relative group">
                <Image
                  src={photo.url}
                  alt={`Foto ${String(index + 1).padStart(3, '0')}`}
                  width={400}
                  height={400}
                  className="rounded-md object-cover aspect-square transition-transform group-hover:scale-105"
                  data-ai-hint={photo.dataAiHint}
                />
                <Badge className="absolute top-2 left-2">
                  {String(index + 1).padStart(3, '0')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
