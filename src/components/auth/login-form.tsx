
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
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginForm({ message, error }: { message?: string, error?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(error || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(message || null);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (error) setFormError(error);
  }, [error]);

  useEffect(() => {
    if (message) setSuccessMessage(message);
  }, [message]);

  async function onSubmit(values: LoginData) {
    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    });

    const result = await response.json();

    if (!response.ok) {
      setFormError(result.error || "Ocorreu um erro inesperado. Tente novamente.");
    } else if (result.redirect) {
      router.push(result.redirect);
    }
    
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {successMessage && (
            <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
                <AlertTitle>Sucesso!</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {formError && (
            <Alert variant="destructive">
               <AlertTitle>Erro no Login</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <div className="text-right pt-2">
                  <Link href="/forgot-password" passHref>
                    <Button variant="link" className="text-xs p-0 h-auto">Esqueceu a senha?</Button>
                  </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Entrando...' : 'Login'}
          </Button>
          <div className="text-sm text-muted-foreground">
            <Link href="/register" className="underline">
              Não tem uma conta de fotógrafo? Registre-se
            </Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
