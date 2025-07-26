import { CheckoutForm } from "@/components/checkout-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  // Em um app real, você passaria os detalhes do plano selecionado para esta página,
  // talvez através de parâmetros de URL ou estado global.
  const selectedPlan = {
    name: "Essencial Semestral",
    price: "143,40",
    period: "a cada 6 meses",
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
       <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/dashboard/subscription">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Planos
                </Link>
            </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h1 className="font-headline text-3xl font-bold mb-4">Finalizar Assinatura</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plano</span>
                            <span className="font-semibold">{selectedPlan.name}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Período</span>
                            <span className="font-semibold">{selectedPlan.period}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>R$ {selectedPlan.price}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Pagamento</CardTitle>
              <CardDescription>
                Preencha seus dados de pagamento abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
