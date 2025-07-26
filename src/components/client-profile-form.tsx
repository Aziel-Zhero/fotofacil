
"use client";

import { useState, useRef } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Upload } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório.'),
    email: z.string().email('Endereço de email inválido'),
    whatsapp: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "A senha atual é obrigatória para definir uma nova.",
    path: ["currentPassword"],
}).refine(data => {
    if (data.newPassword && data.newPassword.length < 8) {
        return false;
    }
    return true;
}, {
    message: "A nova senha deve ter pelo menos 8 caracteres.",
    path: ["newPassword"],
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});


export function ClientProfileForm({ onSave }: { onSave?: () => void }) {
    const { toast } = useToast();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState("https://placehold.co/100x100.png");

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "Cliente Silva",
            email: "cliente.silva@example.com",
            whatsapp: "(11) 98765-4321",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
      });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    
    function onSubmit(values: z.infer<typeof profileSchema>) {
        console.log(values);
        toast({
            title: "Perfil Atualizado",
            description: "Suas informações foram salvas com sucesso.",
        });
        onSave?.();
      }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        name="avatar"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Foto de Perfil</FormLabel>
                                <div className='flex items-center gap-4'>
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={avatarPreview} />
                                        <AvatarFallback>CS</AvatarFallback>
                                    </Avatar>
                                    <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                                        <Upload className="mr-2"/>
                                        Trocar Foto
                                    </Button>
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            className="hidden" 
                                            ref={avatarInputRef} 
                                            onChange={handleAvatarChange}
                                            accept="image/*"
                                        />
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="name" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="whatsapp" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="(XX) 9XXXX-XXXX" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Segurança da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <FormField name="email" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Separator />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <FormField name="currentPassword" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Senha Atual</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="newPassword" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Confirmar Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit">Salvar Alterações</Button>
            </div>
        </form>
    </Form>
  );
}
