
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Camera, Users, Calendar, UserCheck } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlbumCardProps {
  album: {
    id: string;
    name: string;
    photoCount: number;
    status: string;
    client: string;
    createdAt?: string;
    maxPhotos: number;
    clientUserId?: string | null;
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
      case 'Entregue':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  const creationDate = album.createdAt ? new Date(album.createdAt) : null;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-200 bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="font-headline truncate text-textDark">{album.name}</CardTitle>
        <CardDescription className='flex flex-wrap gap-2'>
            <Badge variant={getStatusVariant(album.status)}>{album.status}</Badge>
            {album.clientUserId ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <UserCheck className="mr-1 h-3 w-3" />
                    Cliente Vinculado
                </Badge>
            ) : (
                 <Badge variant="destructive">
                    Pendente de Vínculo
                </Badge>
            )}
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
        {creationDate && isValid(creationDate) && (
            <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Criado em {format(creationDate, "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button asChild className="w-full">
          <Link href={`/dashboard/album/${album.id}`}>Gerenciar Álbum</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
