import AuthLayout from '@/components/layouts/auth-layout';
import { ClientRegisterForm } from '@/components/auth/client-register-form';

export default function ClientRegisterPage() {
  return (
    <AuthLayout
      title="Crie Sua Conta de Cliente"
      description="Cadastre-se para ver e selecionar suas fotos."
    >
      <ClientRegisterForm />
    </AuthLayout>
  );
}
