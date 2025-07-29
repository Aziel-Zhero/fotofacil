
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Camera, Users, Calendar, Link2, UserCheck, Loader2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { linkClientToAlbum } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientUserId, setClientUserId] = useState('');

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

  const handleLinkClient = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('albumId', album.id);
    formData.append('clientUserId', clientUserId);

    const result = await linkClientToAlbum(formData);

    if (result?.error) {
        toast({
            title: "Erro ao Vincular Cliente",
            description: result.error,
            variant: "destructive"
        })
    } else {
         toast({
            title: "Cliente Vinculado!",
            description: "O álbum agora está acessível para o cliente.",
        })
        setOpen(false);
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
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
        {!album.clientUserId && (
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Link2 className="mr-2 h-4 w-4" />
                        Vincular Cliente
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Vincular Cliente ao Álbum</DialogTitle>
                        <DialogDescription>
                            Insira o ID de usuário do cliente para dar a ele acesso a este álbum. O cliente pode encontrar este ID em sua página de perfil.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientUserId">ID de Usuário do Cliente</Label>
                            <Input 
                                id="clientUserId" 
                                value={clientUserId}
                                onChange={(e) => setClientUserId(e.target.value)}
                                placeholder="Cole o ID do cliente aqui" 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleLinkClient} disabled={isSubmitting || !clientUserId}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Vincular
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
