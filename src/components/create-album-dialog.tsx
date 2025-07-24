"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, "O nome do álbum é obrigatório."),
  expirationDate: z.string().min(1, "A data de expiração é obrigatória."),
  password: z.string().optional(),
  maxPhotos: z.coerce.number().min(1, "Por favor, defina um número máximo de fotos."),
  extraPhotoCost: z.coerce.number().optional(),
  pixKey: z.string().optional(),
});

function generateRandomKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function CreateAlbumDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            expirationDate: "",
            password: "",
            maxPhotos: 50,
            extraPhotoCost: 10,
            pixKey: "",
        },
      });

    const handleGeneratePixKey = () => {
        form.setValue('pixKey', generateRandomKey());
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        setOpen(false);
        form.reset();
      }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Criar Novo Álbum</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar um novo álbum para seu cliente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Nome do Álbum</FormLabel><FormControl><Input placeholder="ex: Casamento na Toscana" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="expirationDate" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Data de Expiração</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="password" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Senha de Acesso (Opcional)</FormLabel><FormControl><Input type="password" placeholder="Deixe em branco para sem senha" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="maxPhotos" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Máx. de Seleções de Fotos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="extraPhotoCost" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Custo por 10 Fotos Extras (R$)</FormLabel><FormControl><Input type="number" placeholder="ex: 25" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="pixKey" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Chave PIX para Extras</FormLabel>
                        <div className="flex gap-2">
                             <FormControl>
                                <Input placeholder="Sua chave PIX" {...field} />
                             </FormControl>
                             <Button type="button" variant="outline" size="icon" onClick={handleGeneratePixKey}>
                                <Sparkles className="h-4 w-4"/>
                                <span className="sr-only">Gerar Chave PIX</span>
                             </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <Button type="submit">Criar Álbum</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
