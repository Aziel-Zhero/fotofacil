
import AuthLayout from '@/components/layouts/auth-layout';
import { PhotographerRegisterForm } from '@/components/auth/photographer-register-form';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crie Sua Conta de Fotógrafo"
      description="Comece a organizar e compartilhar seu trabalho hoje. O acesso para seus clientes será criado por você ao gerar um novo álbum."
    >
      <PhotographerRegisterForm />
    </AuthLayout>
  );
}
