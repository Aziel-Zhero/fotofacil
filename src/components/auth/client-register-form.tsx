
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
import { Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { signup } from '@/app/auth/actions';

// Schema para o fotógrafo cadastrar um cliente, agora com senha.
const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  email: z.string().email('Endereço de email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export function ClientRegisterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            password: '',
        },
    });

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-12);
    form.setValue('password', newPassword, { shouldValidate: true });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    // Adiciona o 'role' para que a ação unificada saiba como proceder
    formData.append('role', 'client');
    
    const result = await signup(formData);

    if (result?.error) {
      toast({
        title: "Erro ao Cadastrar Cliente",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.success) {
       toast({
        title: "Cliente Cadastrado!",
        description: `A conta para ${values.email} foi criada com sucesso. O cliente receberá um email para confirmação.`,
      });
      form.reset();
    }
    
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="fullName" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Nome Completo do Cliente</FormLabel><FormControl><Input placeholder="Maria da Silva" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email do Cliente</FormLabel><FormControl><Input placeholder="maria.silva@example.com" {...field} /></FormControl><FormMessage /></FormItem>
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
                        placeholder="Número de telefone do cliente"
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
                <FormItem>
                    <FormLabel>Senha para o Cliente</FormLabel>
                    <div className="relative">
                        <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                        </FormControl>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={generatePassword}>
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Gerar Senha</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                                <span className="sr-only">Mostrar Senha</span>
                            </Button>
                        </div>
                    </div>
                    <FormMessage />
                </FormItem>
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
