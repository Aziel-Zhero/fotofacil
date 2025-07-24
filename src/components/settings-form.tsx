
"use client";

import { useState, useEffect } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Instagram, Smartphone, Crown } from 'lucide-react';
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
    
    // Manage dark mode toggling
    useEffect(() => {
        const isDarkMode = form.watch('darkMode');
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [form.watch('darkMode')]);

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

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Assinatura</CardTitle>
                         <CardDescription>Gerencie seu plano e veja os benefícios.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20">
                            <div>
                                <h3 className="font-bold flex items-center gap-2"><Crown className="text-yellow-500"/>Plano Pro</h3>
                                <p className="text-sm text-muted-foreground">Você tem acesso a todos os recursos.</p>
                            </div>
                            <Button>Gerenciar</Button>
                        </div>
                         <p className="text-xs text-muted-foreground">A assinatura é gerenciada em uma plataforma de pagamentos segura.</p>
                    </CardContent>
                </Card>


                <Card>
                     <CardHeader>
                        <CardTitle className="font-headline">Ajuda e Informações</CardTitle>
                         <CardDescription>Tire suas dúvidas sobre o sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Como funciona a seleção de fotos pelo cliente?</AccordionTrigger>
                                <AccordionContent>
                                    Seu cliente recebe um link exclusivo para o álbum. Ele pode marcar as fotos favoritas. Quando atingir o limite do pacote, ele será notificado e poderá comprar fotos extras, se você tiver habilitado essa opção.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Como funcionam os pagamentos de fotos extras?</AccordionTrigger>
                                <AccordionContent>
                                    Ao configurar um álbum, você define o preço por foto extra. O cliente poderá pagar via PIX por meio de uma chave segura gerada para a transação. O valor é transferido diretamente para você.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>O que são as fotos de cortesia?</AccordionTrigger>
                                <AccordionContent>
                                    É uma forma de surpreender seu cliente! Você pode adicionar algumas fotos extras como um presente. Elas serão reveladas ao cliente no final da seleção, como um bônus.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end">
                    <Button type="submit">Salvar Alterações</Button>
                </div>
            </form>
        </Form>
    );
}
