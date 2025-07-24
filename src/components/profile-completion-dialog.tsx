"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './profile-form';

export function ProfileCompletionDialog() {
  // Em um app real, isso seria controlado pelo estado do usuário (ex: de um contexto ou store)
  const [isOpen, setIsOpen] = useState(false);

  // Este é um gatilho de mock para mostrar o diálogo para fins de demonstração
  // Em um app real, você removeria isso e controlaria `isOpen` de um componente de nível superior
  // ex: useEffect na página do painel verificando se o perfil está completo.
  useState(() => {
    // Simulando o diálogo aparecendo para um novo usuário
    setTimeout(() => setIsOpen(true), 1500);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Complete Seu Perfil</DialogTitle>
          <DialogDescription>
            Bem-vindo(a)! Antes de começar, por favor, adicione mais alguns detalhes ao seu perfil. Isso ajudará com recursos como pagamentos por fotos extras.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ProfileForm onSave={() => setIsOpen(false)}/>
        </div>
      </DialogContent>
    </Dialog>
  );
}
