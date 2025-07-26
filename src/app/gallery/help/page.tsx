
import { SupportForm } from "@/components/support-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ClientHelpPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl text-foreground">
      <div className="mb-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold font-headline mt-4">Fale Conosco</h1>
        <p className="text-muted-foreground mt-2">
          Precisa de ajuda com o álbum ou tem alguma sugestão? Preencha o formulário abaixo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Formulário de Suporte</CardTitle>
          <CardDescription>
            Nossa equipe responderá o mais breve possível.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportForm />
        </CardContent>
      </Card>
    </div>
  );
}
