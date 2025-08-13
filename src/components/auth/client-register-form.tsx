
"use client";

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
import { createClientByPhotographer } from '@/app/auth/actions';

const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  email: z.string().email('Endereço de email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
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
        },
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Chama a nova ação dedicada para fotógrafos
    const result = await createClientByPhotographer(formData);

    if (result?.error) {
      toast({
        title: "Erro ao Cadastrar Cliente",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.success) {
       toast({
        title: "Cliente Cadastrado!",
        description: `A conta para ${values.email} foi criada com sucesso.`,
      });
      form.reset();
    }
    
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-1 gap-4">
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
                        className="PhoneInput"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Senha Provisória</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
           </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar Cliente
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
