
'use client';

import { ClientRegisterForm } from '@/components/auth/client-register-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function RegisterClientPage() {
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
          {/* Reutilizamos o formulário de cadastro de cliente, pois ele já tem a lógica correta */}
          <ClientRegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
