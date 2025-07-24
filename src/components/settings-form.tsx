
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
    darkMode: z.boolean().default(false),
    instagram: z.string().optional(),
    whatsapp: z.string().optional(),
});

export function SettingsForm() {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            darkMode: false,
            instagram: "https://instagram.com/seu-perfil",
            whatsapp: "5511999998888",
        },
    });
    
    const darkMode = form.watch('darkMode');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    function onSubmit(values: z.infer<typeof settingsSchema>) {
        console.log(values);
        toast({
            title: "Configurações Salvas",
            description: "Suas preferências foram atualizadas com sucesso.",
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Aparência</CardTitle>
                        <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="darkMode"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Modo Escuro</FormLabel>
                                        <FormDescription>
                                            Ative para uma experiência com cores escuras.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Perfil de Exibição</CardTitle>
                        <CardDescription>Links que seus clientes verão. Preencha apenas os que desejar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instagram</FormLabel>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="Seu usuário do Instagram" className="pl-10" {...field} />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="whatsapp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp</FormLabel>
                                     <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="Seu número com código do país" className="pl-10" {...field} />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                
                <div className="flex justify-end">
                    <Button type="submit">Salvar Alterações</Button>
                </div>
            </form>
        </Form>
    );
}
