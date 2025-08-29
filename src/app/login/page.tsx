
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import AuthLayout from '@/components/layouts/auth-layout';

function LoginPageContent({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  return (
    <AuthLayout
      title="Acesse sua Conta"
      description="Insira suas credenciais para acessar sua conta."
    >
      <LoginForm message={message} error={error} />
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
      <LoginPageContent
        message={searchParams.message}
        error={searchParams.error}
      />
    </Suspense>
  );
}
