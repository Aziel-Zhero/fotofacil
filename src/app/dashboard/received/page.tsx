
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { GalleryThumbnails } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// A RPC retornará objetos com esta estrutura.
type SelectedPhoto = {
    id: string;
    url: string;
    name: string | null;
    tags: string[] | null;
    album_name: string | null;
}

export default async function ReceivedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // A lógica de busca agora é simplificada para uma única chamada de RPC.
  const { data: photos, error } = await supabase
    .rpc('get_selected_photos_for_photographer', { p_photographer_id: user.id });

  if (error) {
    console.error('Error fetching received photos:', error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-destructive">Erro ao carregar as fotos recebidas.</h1>
        <p className="text-muted-foreground">Por favor, tente novamente mais tarde.</p>
        <pre className="mt-4 text-xs bg-muted p-2 rounded">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
  
  const formattedPhotos: SelectedPhoto[] = photos || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Fotos Recebidas para Edição</h1>
        <p className="text-muted-foreground">
          Aqui estão todas as fotos que seus clientes selecionaram, prontas para o seu toque final.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galeria de Selecionadas ({formattedPhotos.length})</CardTitle>
          <CardDescription>
            Visualize as imagens escolhidas pelos seus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formattedPhotos.length > 0 ? (
             <TooltipProvider delayDuration={200}>
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                    {formattedPhotos.map((photo) => (
                         <Tooltip key={photo.id}>
                            <TooltipTrigger asChild>
                                <div className="relative group mb-4 break-inside-avoid">
                                    <Image
                                        src={photo.url}
                                        alt={photo.name || 'Foto selecionada'}
                                        width={400}
                                        height={600}
                                        className="rounded-md object-cover w-full h-auto transition-transform duration-200 group-hover:scale-105"
                                        data-ai-hint={photo.tags?.join(' ') || ''}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-md">
                                      <p className="text-white text-xs font-semibold truncate">{photo.album_name}</p>
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Álbum: {photo.album_name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
             </TooltipProvider>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30 border-border">
                <GalleryThumbnails className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-textDark">Nenhuma foto recebida</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                   Quando um cliente finalizar a seleção de um álbum, as fotos escolhidas aparecerão aqui.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
