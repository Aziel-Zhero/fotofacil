import AuthLayout from '@/components/layouts/auth-layout';
import { PhotographerRegisterForm } from '@/components/auth/photographer-register-form';

export default function PhotographerRegisterPage() {
  return (
    <AuthLayout
      title="Crie Sua Conta de Fotógrafo"
      description="Comece a organizar e compartilhar seu trabalho hoje."
    >
      <PhotographerRegisterForm />
    </AuthLayout>
  );
}
