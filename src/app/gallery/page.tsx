
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GalleryVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ClientGalleryPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login?error=Você precisa fazer login para ver seus álbuns.');
    }

    if (user.user_metadata.role !== 'client') {
        return redirect('/dashboard');
    }

    const { data: albums, error } = await supabase
        .from('albums')
        .select(`
            id,
            name,
            status,
            profiles (full_name)
        `)
        .eq('client_user_id', user.id);

    if (error) {
        console.error("Erro ao buscar álbuns do cliente:", error);
        return (
             <div className="text-center py-16">
                <h2 className="text-xl font-semibold text-destructive">Erro ao carregar seus álbuns</h2>
                <p className="text-muted-foreground mt-2">
                    Não foi possível buscar seus dados. Por favor, tente novamente mais tarde.
                </p>
             </div>
        )
    }


    return (
        <div className="container">
             <div className="mb-8 mt-8">
                <h1 className="text-3xl font-bold font-headline text-stone-300">Meus Álbuns</h1>
                <p className="text-stone-300/80">Aqui estão os álbuns que seu fotógrafo compartilhou com você. Clique para selecionar suas fotos.</p>
            </div>

            {albums && albums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map(album => (
                        <Card key={album.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="font-headline">{album.name}</CardTitle>
                                <CardDescription>Status: {album.status}</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Button asChild className="w-full">
                                   <Link href={`/gallery/album/${album.id}`}>
                                        Ver e Selecionar Fotos
                                   </Link>
                               </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30 border-border">
                    <GalleryVertical className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold text-textDark">Nenhum álbum compartilhado ainda</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                       Assim que seu fotógrafo compartilhar um álbum com você, ele aparecerá aqui.
                    </p>
                </div>
            )}
        </div>
    )
}
