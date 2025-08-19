
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SupportForm } from "@/components/support-form";


export default function ContactPage() {
    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-8">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/help">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a Central de Ajuda
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="font-headline text-2xl mt-4">Fale Conosco</CardTitle>
                    <CardDescription>
                       Tem alguma dúvida ou sugestão? Preencha o formulário abaixo e nossa equipe responderá em breve.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <SupportForm />
                </CardContent>
            </Card>
        </div>
    );
}
