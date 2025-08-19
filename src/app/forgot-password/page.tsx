
"use client";

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '@/components/layouts/auth-layout';
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
import { forgotPassword } from '@/app/auth/actions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
});

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        email: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        setFormMessage(null);
        setFormError(null);

        const formData = new FormData();
        formData.append('email', values.email);

        const result = await forgotPassword(formData);

        if (result?.error) {
            setFormError(result.error);
        } else if (result?.message) {
            setFormMessage(result.message);
        }
        setIsSubmitting(false);
    }

    return (
        <AuthLayout
        title="Recuperar Senha"
        description="Insira seu e-mail para receber um link de redefinição de senha."
        >
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
                {formMessage && (
                    <Alert>
                        <AlertDescription>{formMessage}</AlertDescription>
                    </Alert>
                )}
                 {formError && (
                    <Alert variant="destructive">
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
                        <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Link de Redefinição
                </Button>
                <Button variant="link" asChild>
                    <Link href="/login">Voltar para o Login</Link>
                </Button>
            </CardFooter>
            </form>
        </Form>
        </AuthLayout>
    );
}
