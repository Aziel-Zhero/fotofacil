
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { signup } from '@/app/auth/actions';

// O schema agora precisa incluir os campos que serão enviados, mesmo que ocultos.
const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  email: z.string().email('Endereço de email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  username: z.string(), // Será enviado oculto
  companyName: z.string(), // Será enviado oculto
});

export function ClientRegisterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            phone: '',
            // Valores padrão para os campos ocultos. O backend cuidará de gerar o username final.
            username: 'default_client_username', 
            companyName: 'N/A'
        },
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Adiciona todos os dados do formulário, incluindo os ocultos, e o 'role'.
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('role', 'client');
    
    const result = await signup(formData);

    if (result?.error) {
      toast({
        title: "Erro no Cadastro",
        description: result.error,
        variant: "destructive",
      });
    }
    // O redirecionamento em caso de sucesso é feito pela server action
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Campos ocultos para satisfazer a validação da action unificada */}
          <input type="hidden" {...form.register('username')} />
          <input type="hidden" {...form.register('companyName')} />
          
          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Maria da Silva" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="maria.silva@example.com" {...field} /></FormControl><FormMessage /></FormItem>
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
