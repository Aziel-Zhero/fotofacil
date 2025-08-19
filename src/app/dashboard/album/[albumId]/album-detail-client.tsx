
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploader } from "@/components/photo-uploader";
import { PhotoGrid } from "@/components/photo-grid";
import { ArrowLeft, Grid3x3, ImageIcon, Rows, Square, Send, Settings, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoCarousel } from '@/components/photo-carousel';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getAlbumDetails, getPhotosForAlbum } from './actions';
import { deleteAlbum, notifyClient } from '../../actions';
import { type Photo } from './page';

export type ViewMode = 'grid' | 'masonry' | 'carousel';

export interface AlbumData {
    id: string;
    name: string;
    selection_limit: number;
    status: string;
}

export function AlbumDetailClient({ albumId }: { albumId: string }) {
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchAlbumData = async () => {
      setLoading(true);
      const [albumResult, photosResult] = await Promise.all([
        getAlbumDetails(albumId),
        getPhotosForAlbum(albumId)
      ]);

      if (albumResult.error || !albumResult.data) {
        toast({ title: "Erro", description: albumResult.error || "Álbum não encontrado", variant: "destructive" });
      } else {
        setAlbum(albumResult.data);
      }

      if (photosResult.error || !photosResult.data) {
        toast({ title: "Erro ao buscar fotos", description: photosResult.error, variant: "destructive" });
      } else {
        setPhotos(photosResult.data.map((p: any) => ({
          id: p.id,
          url: p.url,
          name: p.name || 'foto',
          dataAiHint: p.tags?.join(' ') || ''
        })));
      }
      setLoading(false);
    };

    if (albumId) {
        fetchAlbumData();
    }
  }, [albumId, toast]);


  const addPhoto = (newPhoto: Photo) => {
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
  };

  const handleNotifyClient = async () => {
    if (!album) return;
    const result = await notifyClient(album.id);
    if (result?.success) {
      toast({
         title: "Cliente Notificado!",
         description: "Um e-mail foi enviado ao cliente avisando que o álbum está pronto para seleção."
     });
      if(album) {
       setAlbum({...album, status: 'Aguardando Seleção'});
      }
    } else {
      toast({
        title: "Erro ao notificar",
        description: result.error,
        variant: "destructive"
      });
    }
  }

  const handleDeleteAlbum = async () => {
    const result = await deleteAlbum(albumId);
    if (result?.error) {
      toast({
        title: "Erro ao excluir álbum",
        description: result.error,
        variant: "destructive"
      });
    } else if (result?.success) {
      toast({
        title: "Álbum excluído",
        description: "O álbum foi excluído com sucesso.",
      });
      router.push('/dashboard');
    }
  }

  const renderGallery = () => {
    if (loading) {
       return (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30 border-border">
                <ImageIcon className="h-12 w-12 text-muted-foreground animate-pulse mb-4" />
                <h2 className="text-xl font-semibold text-textDark">Carregando fotos...</h2>
            </div>
        )
    }
    if (photos.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30 border-border">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-textDark">Nenhuma foto enviada</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                   Use o componente acima para começar a enviar as fotos para este álbum.
                </p>
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
            <Button variant="ghost" asChild className="mb-4 text-textDark">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Álbuns
                </Link>
            </Button>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-textDark">Gerenciar Álbum: {album?.name || "Carregando..."}</h1>
                    <p className="text-muted-foreground">Faça upload de novas fotos e veja a galeria atual.</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={!album}>
                        <Settings className="mr-2 h-4 w-4" />
                        Ações
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuSeparator />
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onSelect={(e) => e.preventDefault()}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Álbum
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o álbum e todas as suas fotos do servidor.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteAlbum} className="bg-destructive hover:bg-destructive/90">
                                Sim, Excluir Álbum
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
            </div>
        </div>
        
        <div className="space-y-12">
            <div>
              <h2 className="text-xl font-bold font-headline mb-4 text-textDark">Enviar Fotos</h2>
              <PhotoUploader onUploadComplete={addPhoto} albumId={albumId} />
            </div>

            {photos.length > 0 && album?.status === 'Pendente' && (
                 <Alert>
                    <Send className="h-4 w-4" />
                    <AlertTitle className="font-headline">Tudo pronto para o cliente?</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                       Quando terminar de enviar as fotos, notifique seu cliente para que ele possa começar a seleção.
                       <Button onClick={handleNotifyClient}>
                         <Send className="mr-2 h-4 w-4" />
                         Notificar Cliente para Seleção
                       </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold font-headline text-textDark">Galeria ({photos.length} fotos)</h2>
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
