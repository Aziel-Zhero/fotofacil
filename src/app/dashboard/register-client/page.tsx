
'use client';

import { ClientRegisterForm } from '@/components/auth/client-register-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function RegisterClientPage() {
  // Esta página agora usa o ClientRegisterForm, que foi ajustado para ser
  // um formulário de cadastro completo, usado pelo fotógrafo em nome do cliente.
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Cadastrar Novo Cliente</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar uma conta para seu cliente. Ele receberá um email para confirmar o cadastro e definir sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientRegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
