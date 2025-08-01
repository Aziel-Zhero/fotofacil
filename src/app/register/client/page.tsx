
import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClientRegisterPage() {
  return (
    <AuthLayout
      title="Acesso de Cliente"
      description="Seu acesso é criado pelo seu fotógrafo. Por favor, utilize os dados de login que ele forneceu."
    >
      <div className="p-6 text-center">
        <Button asChild className="w-full">
          <Link href="/login">Ir para a Tela de Login</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
