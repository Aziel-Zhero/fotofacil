

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Essencial Mensal",
        price: "25,00",
        period: "/mês",
        billingInfo: "Cobrado mensalmente",
        description: "Ideal para começar com o pé direito.",
        features: [
            "10 álbuns",
            "Até 120 fotos por álbum",
            "Até 1.200 fotos",
            "Suporte via Email"
        ],
        isHighlighted: false,
    },
    {
        name: "Essencial Semestral",
        price: "23,90",
        period: "/mês",
        billingInfo: "Cobrado R$ 143,40 a cada 6 meses",
        description: "Mais popular para um fluxo constante.",
        features: [
            "60 álbuns",
            "Até 210 fotos por álbum",
            "Até 12.600 fotos",
            "Suporte via Email"
        ],
        isHighlighted: true,
    },
    {
        name: "Estúdio Anual",
        price: "34,99",
        period: "/mês",
        billingInfo: "Cobrado R$ 419,88 anualmente",
        description: "A solução completa para estúdios.",
        features: [
            "Álbuns ilimitados",
            "Até 500 fotos por álbum",
            "Upload ilimitado",
            "Suporte Premium"
        ],
        isHighlighted: false,
    }
]


export default function SubscriptionPage() {
  const currentPlan = "Essencial Semestral"; // Mock data

  return (
    <div className="container mx-auto py-8 max-w-5xl">
       <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold font-headline">Nossos Planos</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Escolha o plano que melhor se adapta ao seu volume de trabalho e comece a otimizar seu tempo hoje mesmo.
            </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            {plans.map(plan => {
                const isCurrentPlan = currentPlan === plan.name;
                return (
                    <Card key={plan.name} className={`flex flex-col h-full ${plan.isHighlighted ? 'border-primary border-2 shadow-xl' : ''} ${isCurrentPlan ? 'border-yellow-500 border-2' : ''}`}>
                        <CardHeader>
                            {isCurrentPlan && (
                                <div className="flex justify-center">
                                    <div className="bg-yellow-500 text-black font-bold text-xs py-1 px-3 rounded-full -mt-10 mb-4 flex items-center gap-1">
                                       <Star className="h-3 w-3"/> SEU PLANO ATUAL
                                    </div>
                                </div>
                            )}
                            {plan.isHighlighted && !isCurrentPlan && (
                                <div className="flex justify-center">
                                    <div className="bg-primary text-primary-foreground font-bold text-xs py-1 px-3 rounded-full -mt-10 mb-4">
                                        MAIS POPULAR
                                    </div>
                                </div>
                            )}
                            <CardTitle className="font-headline text-2xl text-center">{plan.name}</CardTitle>
                            <CardDescription className="text-center">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <div className="text-center">
                                <span className="text-4xl font-bold">R$ {plan.price}</span>
                                <span className="text-lg font-normal text-muted-foreground">{plan.period}</span>
                                {plan.billingInfo && <p className="text-xs text-muted-foreground mt-1">{plan.billingInfo}</p>}
                            </div>
                            <ul className="space-y-3 text-sm">
                            {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.isHighlighted || isCurrentPlan ? 'text-primary' : 'text-muted-foreground'}`}/>
                                        <span>{feature}</span>
                                    </li>
                            ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full" 
                                variant={plan.isHighlighted ? 'default' : 'outline'}
                                disabled={isCurrentPlan}
                                asChild
                            >
                                <Link href="/dashboard/checkout">
                                    {isCurrentPlan ? "Plano Ativo" : "Assinar Agora"}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
        <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Dúvidas? <a href="/dashboard/help" className="underline text-primary">Visite nossa Central de Ajuda</a>.</p>
            <p>Todos os pagamentos são processados de forma segura. Você pode cancelar ou alterar seu plano a qualquer momento.</p>
        </div>
    </div>
  );
}
