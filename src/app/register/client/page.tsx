
import AuthLayout from '@/components/layouts/auth-layout';
import { ClientRegisterForm } from '@/components/auth/client-register-form';

export default function ClientRegisterPage() {
  return (
    <AuthLayout
      title="Crie sua Conta de Cliente"
      description="Preencha seus dados para acessar os álbuns compartilhados com você."
    >
      <ClientRegisterForm />
    </AuthLayout>
  );
}
