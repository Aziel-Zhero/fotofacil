
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { Instagram, Smartphone, Palette, Sun, Moon, Cloud, Bell, Mail, Send, Facebook, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const settingsSchema = z.object({
    theme: z.string().default('light'),
    instagram: z.string().optional(),
    whatsapp: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    website: z.string().optional(),
    notificationsEnabled: z.boolean().default(true),
    emailNotifications: z.boolean().default(true),
    whatsappNotifications: z.boolean().default(false),
    telegramNotifications: z.boolean().default(false),
});

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22.28 8.43a5.86 5.86 0 0 1-1.34.62 3 3 0 0 0-2.3-2.73v-.1a.3.3 0 0 0-.3-.3h-3.4a.3.3 0 0 0-.3.3v9.85a4.3 4.3 0 0 1-4.3 4.3h-.09a4.32 4.32 0 0 1-4.3-4.3V6.22a.3.3 0 0 0-.3-.3H2.82a.3.3 0 0 0-.3.3v5.1a5.68 5.68 0 0 0 4.14 5.54 5.52 5.52 0 0 0 6 0A5.86 5.86 0 0 0 21 13.75v-1.9a.3.3 0 0 0-.3-.3h-3.4a.3.3 0 0 0-.3.3v1.36a2.86 2.86 0 0 1-2.48 2.83 2.76 2.76 0 0 1-3.07-2.83V8.89a.3.3 0 0 0-.3-.3h-2.1a.3.3 0 0 0-.3.3v.1a3 3 0 0 0 2.3 2.73A5.86 5.86 0 0 1 12 13.06a5.52 5.52 0 0 1-5.52-5.52V2.42a.3.3 0 0 0-.3-.3H2.82a.3.3 0 0 0-.3.3v9.12A8.68 8.68 0 0 0 9.8 21a8.52 8.52 0 0 0 9-8.41v-1.36a.3.3 0 0 0-.3-.3h-3.4a.3.3 0 0 0-.3.3v1.9a2.86 2.86 0 0 1-5.34.62 2.76 2.76 0 0 1 .4-4.24V2.42a.3.3 0 0 0-.3-.3h-2.1a.3.3 0 0 0-.3.3V6.5a6 6 0 0 0 4.78 5.9 2.86 2.86 0 0 1-2.48-2.83v-1.9a.3.3 0 0 0-.3-.3h-2.1a.3.3 0 0 0-.3.3v.1A5.86 5.86 0 0 0 12 11.23a5.52 5.52 0 0 0 5.52-5.52V2.42a.3.3 0 0 0-.3-.3H13.8a.3.3 0 0 0-.3.3v9.12a2.76 2.76 0 0 1-2.76 2.76h-.09a2.76 2.76 0 0 1-2.76-2.76V8.89a.3.3 0 0 0-.3-.3H5.42a.3.3 0 0 0-.3.3v1.9a5.86 5.86 0 0 0 5.86 5.86h.09a5.86 5.86 0 0 0 5.86-5.86v-1.9a.3.3 0 0 0-.3-.3H13.8a.3.3 0 0 0-.3.3v1.36A2.76 2.76 0 0 1 10.74 17a2.76 2.76 0 0 1-2.76-2.76V2.42a.3.3 0 0 0-.3-.3H5.42a.3.3 0 0 0-.3.3v4.08a2.76 2.76 0 0 1-2.76 2.76h-.09A2.76 2.76 0 0 1 0 6.5V2.42A2.42 2.42 0 0 1 2.42 0h3.4a2.42 2.42 0 0 1 2.42 2.42v6.43a2.76 2.76 0 0 1-2.76 2.76h-.09A2.76 2.76 0 0 1 2.67 8.89V6.5a2.42 2.42 0 0 1 2.42-2.42h2.1a2.42 2.42 0 0 1 2.42 2.42v4.08a5.52 5.52 0 0 0 5.52 5.52h.09a5.52 5.52 0 0 0 5.52-5.52V8.89a2.42 2.42 0 0 1 2.42-2.42h2.1a2.42 2.42 0 0 1 2.42 2.42v1.9a2.76 2.76 0 0 1-2.76 2.76h-.09a2.76 2.76 0 0 1-2.76-2.76V8.89a2.42 2.42 0 0 1 2.42-2.42h2.1a2.42 2.42 0 0 1 2.42 2.42v4.08A5.52 5.52 0 0 0 24 17.58v-4.08a2.42 2.42 0 0 1-2.42-2.42V8.89a2.42 2.42 0 0 1 2.42-2.42h2.1a2.42 2.42 0 0 1 2.42 2.42v4.08a5.52 5.52 0 0 0 5.52 5.52h.09a5.52 5.52 0 0 0 5.52-5.52V8.43Z" />
    </svg>
);


export function SettingsForm() {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            theme: 'light',
            instagram: "https://instagram.com/seu-perfil",
            whatsapp: "5511999998888",
            facebook: "https://facebook.com/seu-perfil",
            tiktok: "https://tiktok.com/@seu-perfil",
            website: "https://seusite.com",
            notificationsEnabled: true,
            emailNotifications: true,
            whatsappNotifications: false,
            telegramNotifications: false,
        },
    });

    // Sincronizar o formulário com o tema atual no carregamento
    useEffect(() => {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 
                             document.documentElement.classList.contains('theme-blue') ? 'blue' : 'light';
        form.setValue('theme', currentTheme);
    }, [form]);
    
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

    const notificationsEnabled = form.watch('notificationsEnabled');

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
                                                <Cloud className="mb-3 h-6 w-6" />
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
                        <CardTitle className="font-headline">Notificações</CardTitle>
                        <CardDescription>Escolha como e quando você quer ser notificado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="notificationsEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base flex items-center gap-2"><Bell />Ativar Notificações</FormLabel>
                                        <FormDescription>Receba alertas sobre atividades importantes na sua conta.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Separator />
                         <div className={`space-y-4 ${!notificationsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h3 className="mb-4 text-base font-medium text-muted-foreground">Canais de Notificação</h3>
                             <FormField
                                control={form.control}
                                name="emailNotifications"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <FormLabel className="flex items-center gap-3"><Mail /> Email</FormLabel>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!notificationsEnabled}/></FormControl>
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="whatsappNotifications"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                     <FormLabel className="flex items-center gap-3"><Smartphone /> WhatsApp</FormLabel>
                                     <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!notificationsEnabled}/></FormControl>
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="telegramNotifications"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <FormLabel className="flex items-center gap-3"><Send /> Telegram</FormLabel>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!notificationsEnabled}/></FormControl>
                                </FormItem>
                                )}
                            />
                        </div>
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
                                            <Input placeholder="https://instagram.com/seu-perfil" className="pl-10" {...field} />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Facebook</FormLabel>
                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="https://facebook.com/seu-perfil" className="pl-10" {...field} />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="tiktok"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>TikTok</FormLabel>
                                    <div className="relative">
                                        <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="https://tiktok.com/@seu-perfil" className="pl-10" {...field} />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site</FormLabel>
                                     <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="https://seusite.com" className="pl-10" {...field} />
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
