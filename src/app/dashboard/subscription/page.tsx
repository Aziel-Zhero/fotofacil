import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
       <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Assinatura</h1>
            <p className="text-muted-foreground">Gerencie seu plano e explore os benefícios.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="border-primary border-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-headline text-2xl">Plano Pro</CardTitle>
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Star/>
                            <span>ATIVO</span>
                        </div>
                    </div>
                    <CardDescription>
                        Você tem acesso total a todos os recursos da plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-4xl font-bold">R$ 49,90<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Álbuns ilimitados</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Upload de fotos ilimitado</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Marcação com IA</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Opções de monetização de fotos extras</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Suporte prioritário</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Gerenciar Assinatura</Button>
                </CardFooter>
            </Card>

            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Plano Básico</CardTitle>
                    <CardDescription>
                        Comece gratuitamente e faça upgrade quando precisar de mais.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-4xl font-bold">R$ 0<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/>3 álbuns</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Até 500 fotos</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Funcionalidades básicas de galeria</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" disabled>Seu plano atual</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
