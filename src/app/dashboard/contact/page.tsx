
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    const email = "eduarda.blue03@gmail.com";
    const subject = encodeURIComponent("Contato via Plataforma FotoFácil");
    const body = encodeURIComponent(
`Olá, equipe FotoFácil,

Estou entrando em contato para:
( ) Relatar um problema
( ) Sugerir uma melhoria

Descrição:
[Por favor, detalhe aqui o motivo do seu contato]

---
Assinatura
Nome: [Seu Nome]
Email da conta: [Seu Email]
`
    );

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
                        Estamos aqui para ajudar. Clique no botão abaixo para abrir seu aplicativo de e-mail e nos enviar sua mensagem.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                        Seu e-mail será enviado para: <span className="font-semibold text-foreground">{email}</span>
                    </p>
                    <Button asChild size="lg">
                        <a href={`mailto:${email}?subject=${subject}&body=${body}`}>
                           <Mail className="mr-2 h-4 w-4" />
                           Enviar Email
                        </a>
                    </Button>
                    <p className="mt-4 text-xs text-muted-foreground">
                        Para agilizar o atendimento, por favor, preencha os campos no corpo do e-mail.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
