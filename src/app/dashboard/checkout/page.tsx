
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

        <Card>
            <CardHeader>
              <CardTitle className="font-headline">Finalizar Assinatura</CardTitle>
              <CardDescription>
                Plano Selecionado: <span className="font-bold text-primary">{selectedPlan.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutForm />
            </CardContent>
        </Card>
    </div>
  );
}
