
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CardContent, CardFooter } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Este schema e formulário não são mais o fluxo principal,
// mas podem ser mantidos para compatibilidade ou removidos.
// O acesso agora é pelo login do cliente.
const formSchema = z.object({
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

interface AlbumAccessFormProps {
    albumId: string;
    onSuccess: () => void;
}

export function AlbumAccessForm({ albumId, onSuccess }: AlbumAccessFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });
  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Redireciona para a página de login, que é o novo fluxo
    router.push('/login');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha do Álbum (obsoleto)</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full">
            <KeyRound className="mr-2 h-4 w-4" />
            Ir para Login
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
