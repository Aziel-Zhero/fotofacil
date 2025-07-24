"use client";

import Link from 'next/link';
import { Camera, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';

export default function RoleSelector() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/register/photographer" className="block">
          <Card className="text-center p-8 h-full hover:bg-primary/5 hover:border-primary transition-all">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <Camera className="h-12 w-12 text-primary" />
              <h3 className="font-headline text-xl font-semibold">Sou Fotógrafo(a)</h3>
              <p className="text-muted-foreground text-sm">Crie álbuns, compartilhe com clientes e gerencie seu trabalho.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/register/client" className="block">
          <Card className="text-center p-8 h-full hover:bg-primary/5 hover:border-primary transition-all">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <User className="h-12 w-12 text-primary" />
              <h3 className="font-headline text-xl font-semibold">Sou Cliente</h3>
              <p className="text-muted-foreground text-sm">Veja álbuns compartilhados e selecione suas fotos favoritas.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="mt-6 text-center text-sm">
        Já tem uma conta?{' '}
        <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">
             Login
            </Link>
        </Button>
      </div>
    </div>
  );
}
