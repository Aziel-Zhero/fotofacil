
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LinkIcon } from "lucide-react";
import { ClientAlbumAccess } from "@/components/client-album-access";

export default function ClientGalleryPage() {
    return (
        <div className="container flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <LinkIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <CardTitle className="font-headline mt-4">Acesse seu Álbum</CardTitle>
                    <CardDescription>
                        Insira o ID do álbum fornecido pelo seu fotógrafo ou utilize o link exclusivo que você recebeu.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <ClientAlbumAccess />
                </CardContent>
            </Card>
        </div>
    )
}
