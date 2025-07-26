import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Camera, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlbumCardProps {
  album: {
    id: string;
    name: string;
    photoCount: number;
    status: string;
    client: string;
    createdAt: string;
    maxPhotos: number;
  };
}

export function AlbumCard({ album }: AlbumCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Aguardando Seleção':
        return 'default';
      case 'Seleção Completa':
        return 'secondary';
      case 'Expirado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline truncate">{album.name}</CardTitle>
        <CardDescription>
            <Badge variant={getStatusVariant(album.status)}>{album.status}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{album.client}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Camera className="mr-2 h-4 w-4" />
          <span>{album.photoCount} de {album.maxPhotos} fotos</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Criado em {format(new Date(album.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/album/${album.id}`}>Gerenciar Álbum</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
