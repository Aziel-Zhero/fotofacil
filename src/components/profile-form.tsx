
"use client";

import { useState, useRef, useEffect } from 'react';
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
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
    fullName: z.string().min(1, 'Nome é obrigatório.'),
    companyName: z.string().min(1, "Nome da empresa é obrigatório"),
    email: z.string().email('Endereço de email inválido'),
    avatarFile: z.any().optional(),
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


export function ProfileForm({ user, onSave }: { user: User, onSave?: () => void }) {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.user_metadata.avatar_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.user_metadata.fullName || '',
            companyName: user?.user_metadata.companyName || '',
            email: user?.email || '',
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { formState: { isDirty } } = form;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    
    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setIsSubmitting(true);

        try {
            const { fullName, companyName, newPassword } = values;
            let avatar_url = user.user_metadata.avatar_url;

            // 1. Upload avatar se houver um novo
            if (avatarFile) {
                const filePath = `${user.id}/${avatarFile.name}-${Date.now()}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, {
                        upsert: true,
                    });
                
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(uploadData.path);
                
                avatar_url = urlData.publicUrl;
            }

            // 2. Atualizar metadados do usuário
            const { error: userError } = await supabase.auth.updateUser({
                data: { fullName, companyName, avatar_url }
            });

            if (userError) throw userError;

            // 3. Atualizar senha se fornecida
            if (newPassword) {
                 const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
                 if (passwordError) throw passwordError;
            }

            toast({
                title: "Perfil Atualizado",
                description: "Suas informações foram salvas com sucesso.",
            });
            
            if (onSave) {
              onSave();
            } else {
              // Forçar atualização da página para refletir as mudanças no cabeçalho
              router.refresh(); 
            }

        } catch (error: any) {
             toast({
                title: "Erro ao salvar perfil",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const getInitials = (name: string) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2);
    }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Informações Pessoais</CardTitle>
                    <CardDescription>Atualize seus dados de perfil e imagem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        name="avatarFile"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Foto de Perfil</FormLabel>
                                <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={avatarPreview} />
                                        <AvatarFallback>
                                            {getInitials(user?.user_metadata.fullName || '')}
                                        </AvatarFallback>
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
                        <FormField name="fullName" control={form.control} render={({ field }) => (
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
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" readOnly disabled placeholder="seu@email.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Separator />
                    <p className="text-sm text-muted-foreground">Para alterar sua senha, preencha os campos abaixo. Caso contrário, deixe-os em branco.</p>
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
                <Button type="submit" disabled={(!isDirty && !avatarFile) || isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    </Form>
  );
}
