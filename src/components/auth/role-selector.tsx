
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
              <p className="text-muted-foreground text-sm">Crie álbuns, gerencie seus clientes e otimize seu trabalho.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/login" className="block">
          <Card className="text-center p-8 h-full hover:bg-primary/5 hover:border-primary transition-all">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <User className="h-12 w-12 text-primary" />
              <h3 className="font-headline text-xl font-semibold">Sou Cliente</h3>
              <p className="text-muted-foreground text-sm">Acesse os álbuns compartilhados com você através do link seguro.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="mt-6 text-center text-sm">
        <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">
             Já é um fotógrafo? Faça login
            </Link>
        </Button>
      </div>
    </div>
  );
}
