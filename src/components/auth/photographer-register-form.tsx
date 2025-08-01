
"use client";

import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
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
import { signup } from '@/app/auth/actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'


// Este schema agora é específico para o fotógrafo e garante que todos os campos sejam enviados
const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  email: z.string().email('Endereço de email inválido'),
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
});

export function PhotographerRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      companyName: '',
      phone: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    // Adiciona o 'role' para que a ação unificada saiba como proceder
    formData.append('role', 'photographer');
    
    const result = await signup(formData);

    if (result?.error) {
      toast({
        title: "Erro no Cadastro",
        description: result.error,
        variant: "destructive",
      });
    }
    // O redirecionamento é tratado pela server action
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="João da Silva" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
           <FormField name="companyName" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Nome da Empresa</FormLabel><FormControl><Input placeholder="Fotografia João da Silva" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="joao.silva@example.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
           <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <PhoneInput
                    international
                    defaultCountry="BR"
                    placeholder="Seu número de telefone"
                    value={field.value}
                    onChange={field.onChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
           />
          <FormField name="username" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Nome de Usuário</FormLabel><FormControl><Input placeholder="joao_silva_foto" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
           <div className="text-sm text-muted-foreground">
            Já tem uma conta? <Link href="/login" className="underline">Login</Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
