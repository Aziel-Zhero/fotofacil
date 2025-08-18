import { LoginForm } from '@/components/auth/login-form';
import AuthLayout from '@/components/layouts/auth-layout';

// O componente agora é async para aguardar os searchParams.
export default function LoginPage({
  searchParams,
}: {
  // A tipagem correta para searchParams em Server Components
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Os parâmetros são lidos de forma segura no servidor.
  const error = typeof searchParams.error === 'string' ? searchParams.error : null;
  const message = typeof searchParams.message === 'string' ? searchParams.message : null;

  return (
    <AuthLayout
      title="Acesse sua Conta"
      description="Insira suas credenciais para acessar sua conta de fotógrafo ou cliente."
    >
      {/* O LoginForm agora recebe props simples, não o objeto searchParams completo. */}
      <LoginForm error={error} message={message} />
    </AuthLayout>
  );
}
