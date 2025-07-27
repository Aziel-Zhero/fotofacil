
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Em uma aplicação real, você faria uma chamada para a API/Server Action
    // para validar a senha para o albumId.
    // Ex: const isValid = await validateAlbumPassword(albumId, values.password);
    
    // Mock de validação
    if (values.password === 'senha123') {
        // Armazena um token de sessão simples para simular o acesso
        sessionStorage.setItem(`album_token_${albumId}`, 'true');
        onSuccess();
    } else {
        form.setError('password', { message: 'Senha incorreta.' });
    }
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
                <FormLabel>Senha do Álbum</FormLabel>
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
            Acessar Álbum
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

