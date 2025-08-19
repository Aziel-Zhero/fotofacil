
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
import { resetPassword } from '@/app/auth/actions';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

export default function ResetPasswordPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        setFormError(null);

        const formData = new FormData();
        formData.append('password', values.password);
        
        const result = await resetPassword(formData);

        if (result?.error) {
            setFormError(result.error);
        } else if (result?.redirect) {
            router.push(result.redirect);
        }

        setIsSubmitting(false);
    }

    return (
        <AuthLayout
        title="Redefina sua Senha"
        description="Escolha uma nova senha forte para sua conta."
        >
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
                {formError && (
                    <Alert variant="destructive">
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Nova Senha
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
