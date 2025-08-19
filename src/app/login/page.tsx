
import { LoginForm } from '@/components/auth/login-form';
import AuthLayout from '@/components/layouts/auth-layout';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string, error: string };
}) {
  return (
    <AuthLayout
      title="Acesse sua Conta"
      description="Insira suas credenciais para acessar sua conta de fotógrafo."
    >
      <LoginForm message={searchParams.message} error={searchParams.error}/>
    </AuthLayout>
  );
}
