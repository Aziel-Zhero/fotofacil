
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const plans = [
    {
        name: "Essencial Mensal",
        price: "29,99",
        period: "/mês",
        billingInfo: "Cobrado mensalmente",
        description: "Ideal para começar com o pé direito.",
        features: [
            "Até 10 álbuns ativos",
            "Até 120 fotos por álbum",
            "Armazenamento de 1.200 fotos",
            "Suporte via Email"
        ],
        isHighlighted: false,
    },
    {
        name: "Essencial Semestral",
        price: "23,90",
        period: "/mês",
        billingInfo: "Cobrado R$143,40 a cada 6 meses",
        description: "Mais popular para um fluxo constante.",
        features: [
            "Até 60 álbuns ativos",
            "Até 210 fotos por álbum",
            "Armazenamento de 12.600 fotos",
            "Suporte via Email"
        ],
        isHighlighted: true,
    },
    {
        name: "Estúdio Anual",
        price: "34,99",
        period: "/mês",
        billingInfo: "Cobrado R$419,88 anualmente",
        description: "A solução completa para estúdios.",
        features: [
            "Álbuns ilimitados",
            "Até 500 fotos por álbum",
            "Upload de fotos ilimitado",
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
            {plans.map(plan => (
                <Card key={plan.name} className={`flex flex-col h-full ${plan.isHighlighted ? 'border-primary border-2 shadow-xl' : ''}`}>
                    <CardHeader>
                        {plan.isHighlighted && (
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
                                    <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.isHighlighted ? 'text-primary' : 'text-muted-foreground'}`}/>
                                    <span>{feature}</span>
                                </li>
                           ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full" 
                            variant={plan.isHighlighted ? 'default' : 'outline'}
                            disabled={currentPlan === plan.name}
                        >
                            {currentPlan === plan.name ? "Seu Plano Atual" : "Assinar Agora"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
        <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Dúvidas? <a href="/dashboard/help" className="underline text-primary">Visite nossa Central de Ajuda</a>.</p>
            <p>Todos os pagamentos são processados de forma segura. Você pode cancelar ou alterar seu plano a qualquer momento.</p>
        </div>
    </div>
  );
}
