"use client";

import { useState } from 'react';
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
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório.'),
    age: z.coerce.number().min(18, 'Você deve ter pelo menos 18 anos.').optional(),
    pixKey: z.string().min(1, 'Uma chave PIX é necessária para pagamentos.'),
});

function generateRandomKey() {
    return 'aleatorio-' + Math.random().toString(36).substring(2, 22);
}

export function ProfileForm({ onSave }: { onSave?: () => void }) {
    const { toast } = useToast();
    const [showPixKey, setShowPixKey] = useState(false);
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        // Dados de mock, em um app real viria dos dados do usuário
        defaultValues: {
            name: "John Smith",
            age: 32,
            pixKey: "",
        },
      });

    const handleGeneratePixKey = () => {
        form.setValue('pixKey', generateRandomKey());
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="age" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Idade</FormLabel><FormControl><Input type="number" placeholder="ex: 30" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="pixKey" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Chave PIX (Aleatória)</FormLabel>
                    <div className="flex gap-2">
                         <FormControl>
                            <Input type={showPixKey ? 'text' : 'password'} placeholder="Gere ou insira uma chave aleatória" {...field} />
                         </FormControl>
                         <Button type="button" variant="outline" size="icon" onClick={() => setShowPixKey(!showPixKey)}>
                            {showPixKey ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            <span className="sr-only">{showPixKey ? 'Ocultar' : 'Mostrar'} Chave PIX</span>
                         </Button>
                         <Button type="button" variant="outline" size="icon" onClick={handleGeneratePixKey}>
                            <Sparkles className="h-4 w-4"/>
                            <span className="sr-only">Gerar Chave PIX Aleatória</span>
                         </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )} />
            <Button type="submit" className="w-full">Salvar Alterações</Button>
        </form>
    </Form>
  );
}
