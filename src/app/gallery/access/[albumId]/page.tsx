
"use client";

import { AlbumAccessForm } from '@/components/auth/album-access-form';
import AuthLayout from '@/components/layouts/auth-layout';
import { useRouter } from 'next/navigation';

export default function AlbumAccessPage({ params }: { params: { albumId: string } }) {
    const router = useRouter();
    const albumName = "Casamento na Toscana"; // Mock: buscar nome do álbum

    const handleSuccess = () => {
        router.push(`/gallery/album/${params.albumId}`);
    }

  return (
    <AuthLayout
      title={`Acessar Álbum: ${albumName}`}
      description="Por favor, insira a senha fornecida pelo seu fotógrafo para visualizar as fotos."
    >
      <AlbumAccessForm albumId={params.albumId} onSuccess={handleSuccess} />
    </AuthLayout>
  );
}

