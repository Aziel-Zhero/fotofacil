
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LinkIcon } from "lucide-react";

export default function ClientGalleryPage() {
    return (
        <div className="container flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <LinkIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <CardTitle className="font-headline mt-4">Acesse seu Álbum</CardTitle>
                    <CardDescription>
                        Por favor, utilize o link exclusivo fornecido pelo seu fotógrafo para acessar e selecionar suas fotos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Se você não recebeu um link, entre em contato com seu fotógrafo.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
