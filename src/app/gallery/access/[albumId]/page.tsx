
"use client";

import { AlbumAccessForm } from '@/components/auth/album-access-form';
import AuthLayout from '@/components/layouts/auth-layout';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AlbumAccessPage({ params }: { params: { albumId: string } }) {
    const router = useRouter();
    // Esta página não é mais o fluxo principal. Redireciona o usuário para o login de cliente.
    
  return (
    <AuthLayout
      title={`Acesso ao Álbum`}
      description="Para ver este álbum, por favor, faça login com a sua conta de cliente."
    >
        <div className="p-6 text-center">
            <Button asChild className="w-full">
                <Link href="/login">Ir para o Login de Cliente</Link>
            </Button>
        </div>
    </AuthLayout>
  );
}
