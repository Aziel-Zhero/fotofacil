
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
  } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Smartphone, Palette, Sun, Moon, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
    theme: z.string().default('light'),
    instagram: z.string().optional(),
    whatsapp: z.string().optional(),
});

export function SettingsForm() {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            theme: 'light',
            instagram: "https://instagram.com/seu-perfil",
            whatsapp: "5511999998888",
        },
    });

    // Sincronizar o formulário com o tema atual no carregamento
    useEffect(() => {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 
                             document.documentElement.classList.contains('theme-blue') ? 'blue' : 'light';
        form.setValue('theme', currentTheme);
    }, []);
    
    const theme = form.watch('theme');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('dark', 'theme-blue');
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'blue') {
            root.classList.add('theme-blue');
        }
    }, [theme]);

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
                            name="theme"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-base flex items-center gap-2">
                                        <Palette />
                                        Tema Visual
                                    </FormLabel>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                                    >
                                        <FormItem>
                                            <RadioGroupItem value="light" id="light" className="sr-only" />
                                            <FormLabel htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <Sun className="mb-3 h-6 w-6" />
                                                Padrão
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                            <RadioGroupItem value="blue" id="blue" className="sr-only" />
                                            <FormLabel htmlFor="blue" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <Droplets className="mb-3 h-6 w-6" />
                                                Azul
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                            <RadioGroupItem value="dark" id="dark" className="sr-only" />
                                            <FormLabel htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <Moon className="mb-3 h-6 w-6" />
                                                Escuro
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
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
