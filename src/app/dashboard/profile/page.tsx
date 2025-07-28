import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, Star } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const currentPlan = "Essencial Semestral"; // Mock data
    const planActivationDate = "25 de Julho, 2024"; // Mock data
    const planExpirationDate = "25 de Janeiro, 2025"; // Mock data

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Perfil e Segurança</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais, de segurança e da sua empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

       <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline text-textDark">
                    <Star className="h-5 w-5 text-accent"/>
                    Detalhes da Assinatura
                </CardTitle>
                <CardDescription>
                    Informações sobre seu plano atual e ciclo de faturamento.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 items-center">
                <div>
                    <p className="text-sm font-semibold">Plano Atual</p>
                    <p className="text-muted-foreground">{currentPlan}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold">Ciclo de Faturamento</p>
                    <p className="text-muted-foreground">{planActivationDate} - {planExpirationDate}</p>
                </div>
                <div className="md:text-right">
                    <Button asChild>
                        <Link href="/dashboard/subscription">
                            <Wallet className="mr-2 h-4 w-4"/>
                            Gerenciar Assinatura
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
