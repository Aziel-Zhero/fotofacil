
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
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, "O nome do álbum é obrigatório."),
  clientName: z.string().min(1, "O nome do cliente é obrigatório."),
  expirationDate: z.string().optional(),
  password: z.string().optional(),
  maxPhotos: z.coerce.number().min(1, "Por favor, defina um número máximo de fotos."),
  extraPhotoCost: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
  giftPhotos: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
});

function generateSecurePassword() {
    return Math.random().toString(36).substring(2, 12);
}

export function CreateAlbumDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            clientName: "",
            expirationDate: "",
            password: "",
            maxPhotos: 50,
            extraPhotoCost: 0,
            giftPhotos: 0,
        },
      });

    const handleGeneratePassword = () => {
        const newPassword = generateSecurePassword();
        form.setValue('password', newPassword);
    }
    
    const copyPasswordToClipboard = () => {
        const password = form.getValues('password');
        if (password) {
            navigator.clipboard.writeText(password);
            toast({
                title: "Senha Copiada!",
                description: "A senha de acesso foi copiada para sua área de transferência.",
            })
        }
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
                <FormField name="clientName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Nome do Cliente/Família</FormLabel><FormControl><Input placeholder="ex: Os Silva" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="expirationDate" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Data de Expiração (Opcional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="password" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Senha de Acesso</FormLabel>
                        <div className="flex gap-2">
                             <FormControl>
                                <Input type="text" placeholder="Gere uma senha" {...field} readOnly className="bg-muted"/>
                             </FormControl>
                             <Button type="button" variant="outline" size="icon" onClick={handleGeneratePassword}>
                                <RefreshCw className="h-4 w-4"/>
                                <span className="sr-only">Gerar Senha</span>
                             </Button>
                             <Button type="button" variant="outline" size="icon" onClick={copyPasswordToClipboard} disabled={!field.value}>
                                <Copy className="h-4 w-4"/>
                                <span className="sr-only">Copiar Senha</span>
                             </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="maxPhotos" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Máx. de Seleções de Fotos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="extraPhotoCost" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Preço por Foto Extra (R$)</FormLabel><FormControl><Input type="number" placeholder="ex: 8.50" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="giftPhotos" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Fotos de Cortesia (Surpresa)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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

