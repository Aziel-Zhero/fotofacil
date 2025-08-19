
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Upload, Loader2, Crop } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import Cropper from 'react-easy-crop';
import { type Area } from 'react-easy-crop';
import { Slider } from './ui/slider';
import { Label } from './ui/label';


const profileSchema = z.object({
    fullName: z.string().min(1, 'Nome é obrigatório.'),
    companyName: z.string().min(1, "Nome da empresa é obrigatório"),
    document: z.string().optional(),
    email: z.string().email('Endereço de email inválido.'),
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

// Helper function to create a cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') 
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const safeArea = Math.max(image.width, image.height) * 2
  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate(0)
  ctx.translate(-safeArea / 2, -safeArea / 2)
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )
  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )
  
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file)
    }, 'image/jpeg')
  })
}


export function ProfileForm({ user, onSave }: { user: User, onSave?: () => void }) {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.user_metadata.avatar_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // States for cropping
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.user_metadata.fullName || '',
            companyName: user?.user_metadata.companyName || '',
            document: user?.user_metadata.document || '',
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    
    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        if (!croppedAreaPixels || !imageToCrop) return;
        try {
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            if(croppedImageBlob){
                const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
                setAvatarPreview(croppedImageUrl);
                // Convert Blob to File for upload
                const avatarFile = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
                form.setValue('avatarFile', avatarFile, { shouldDirty: true });
            }
        } catch (e) {
            console.error(e);
        }
        setImageToCrop(null);
    }, [imageToCrop, croppedAreaPixels, form]);

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setIsSubmitting(true);

        try {
            const { fullName, companyName, document, email, newPassword, avatarFile } = values;
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

            // 2. Atualizar metadados e email do usuário
            const { error: userError } = await supabase.auth.updateUser({
                email, // Permite atualização de email
                data: { fullName, companyName, avatar_url, document }
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
            
            form.reset(values); // Reseta o form com os novos valores para limpar o 'isDirty'
            
            if (onSave) {
              onSave();
            }

            router.refresh(); 

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
    <>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Informações Pessoais e da Empresa</CardTitle>
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
                         <FormField name="document" control={form.control} render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>CPF/CNPJ (Opcional)</FormLabel><FormControl><Input placeholder="Seu documento para futuras transações" {...field} /></FormControl><FormMessage /></FormItem>
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
                            <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                            <FormDescription>Alterar o e-mail pode exigir uma nova confirmação.</FormDescription>
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
                <Button type="submit" disabled={!isDirty || isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    </Form>

    <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && setImageToCrop(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Crop/> Recortar Imagem</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-96 mt-4">
                <Cropper
                    image={imageToCrop!}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="mt-4">
                <Label>Zoom</Label>
                <Slider
                    min={1}
                    max={3}
                    step={0.1}
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setImageToCrop(null)}>Cancelar</Button>
                <Button onClick={showCroppedImage}>Confirmar Recorte</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

    