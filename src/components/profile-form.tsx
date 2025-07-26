
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Upload } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório.'),
    companyName: z.string().min(1, "Nome da empresa é obrigatório"),
    email: z.string().email('Endereço de email inválido'),
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


export function ProfileForm({ onSave }: { onSave?: () => void }) {
    const { toast } = useToast();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState("https://placehold.co/100x100.png");

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "John Smith",
            companyName: "Fotografia John Smith",
            email: "joao.silva@example.com",
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
        // Lógica de atualização de perfil aqui
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
                    <CardTitle className="text-xl">Informações Pessoais</CardTitle>
                    <CardDescription>Atualize seus dados de perfil e imagem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        name="avatar"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Foto de Perfil</FormLabel>
                                <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={avatarPreview} />
                                        <AvatarFallback>JS</AvatarFallback>
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
                        <FormField name="companyName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Nome da Empresa</FormLabel><FormControl><Input placeholder="Sua empresa de fotografia" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Segurança da Conta</CardTitle>
                    <CardDescription>Altere seu e-mail e senha.</CardDescription>
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
