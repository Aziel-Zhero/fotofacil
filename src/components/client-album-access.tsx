
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link2, Loader2 } from 'lucide-react';

export function ClientAlbumAccess() {
    const [albumId, setAlbumId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!albumId.trim()) {
            setError('Por favor, insira um ID de álbum.');
            return;
        }
        setError('');
        setIsLoading(true);
        // A lógica de redirecionamento agora nos leva para a página de acesso com senha
        router.push(`/gallery/access/${albumId}`);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
            <div className="relative w-full max-w-sm">
                 <Input 
                    type="text"
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                    placeholder="Cole o ID do Álbum aqui"
                    className="w-full text-center"
                    aria-label="ID do Álbum"
                 />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isLoading || !albumId} className="w-full max-w-sm">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Link2 className="mr-2 h-4 w-4" />
                )}
                Acessar Álbum
            </Button>
        </form>
    );
}
