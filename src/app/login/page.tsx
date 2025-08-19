
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import AuthLayout from '@/components/layouts/auth-layout';

// Wrapper para usar searchParams com Suspense
function LoginPageContent({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  return (
    <AuthLayout
      title="Acesse sua Conta"
      description="Insira suas credenciais para acessar sua conta de fotógrafo."
    >
      <LoginForm message={searchParams.message} error={searchParams.error} />
    </AuthLayout>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}
