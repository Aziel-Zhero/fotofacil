"use client";

import Link from 'next/link';
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

const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  whatsapp: z.string().min(1, 'Número do WhatsApp é obrigatório'),
  email: z.string().email('Endereço de email inválido'),
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export function ClientRegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      whatsapp: '',
      email: '',
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Lógica de registro do cliente
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Maria da Silva" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="whatsapp" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="(XX) 9XXXX-XXXX" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="maria.silva@example.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="username" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Nome de Usuário</FormLabel><FormControl><Input placeholder="maria_silva" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full">Criar Conta</Button>
          <div className="text-sm text-muted-foreground">
            Já tem uma conta? <Link href="/login" className="underline">Login</Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
