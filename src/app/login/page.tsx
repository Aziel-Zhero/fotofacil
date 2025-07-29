import { LoginForm } from '@/components/auth/login-form';
import AuthLayout from '@/components/layouts/auth-layout';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string, error: string };
}) {
  return (
    <AuthLayout
      title="Bem-vindo(a) de Volta!"
      description="Insira suas credenciais para acessar sua conta."
    >
      <LoginForm message={searchParams.message} error={searchParams.error}/>
    </AuthLayout>
  );
}
