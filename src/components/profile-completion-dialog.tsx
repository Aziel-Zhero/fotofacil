
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ProfileForm } from './profile-form';
import { type User } from '@supabase/supabase-js';


export function ProfileCompletionDialog({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Complete Seu Perfil</DialogTitle>
          <DialogDescription>
            Bem-vindo(a)! Antes de começar, por favor, adicione mais alguns detalhes ao seu perfil. Isso ajudará com recursos como pagamentos por fotos extras.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ProfileForm user={user} onSave={() => setIsOpen(false)}/>
        </div>
      </DialogContent>
    </Dialog>
  );
}
