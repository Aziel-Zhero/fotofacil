
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
import { Copy, Info, Loader2, RefreshCw, UserSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAlbum } from '../app/dashboard/actions';

const formSchema = z.object({
  name: z.string().min(1, "O nome do álbum é obrigatório."),
  clientName: z.string().min(1, "O nome do cliente é obrigatório."),
  expirationDate: z.string().optional(),
  password: z.string().optional(),
  clientUserId: z.string().uuid("O ID do cliente é obrigatório e deve ser um ID válido."),
  maxPhotos: z.coerce.number().min(1, "Por favor, defina um número máximo de fotos."),
  extraPhotoCost: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
  giftPhotos: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
});

function generateSecurePassword() {
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    return array.join('').substring(0, 10);
}

export function CreateAlbumDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            clientName: "",
            expirationDate: "",
            password: "",
            clientUserId: "",
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
      });

      const result = await createAlbum(formData);

      if (result?.error) {
        toast({
          title: "Erro ao Criar Álbum",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Álbum Criado com Sucesso!",
          description: `O álbum "${values.name}" foi criado e vinculado ao cliente.`,
        });
        setOpen(false);
        form.reset();
      }
      setIsSubmitting(false);
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-textDark">Criar Novo Álbum</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para criar e vincular um novo álbum para seu cliente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="name" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nome do Álbum</FormLabel><FormControl><Input placeholder="ex: Casamento na Toscana" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="clientName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nome do Cliente/Família</FormLabel><FormControl><Input placeholder="ex: Os Silva" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                 <FormField name="clientUserId" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>ID de Usuário do Cliente</FormLabel>
                        <div className="relative">
                            <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                                <Input placeholder="Cole o ID do cliente aqui" {...field} className="pl-10"/>
                            </FormControl>
                        </div>
                         <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="password" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha de Acesso (Opcional)</FormLabel>
                            <div className="flex gap-2">
                                <FormControl>
                                    <Input type="text" placeholder="Gere ou digite uma senha" {...field} />
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
                     <FormField name="expirationDate" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Data de Expiração (Opcional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="maxPhotos" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Máx. de Seleções</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="extraPhotoCost" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Preço por Foto Extra (R$)</FormLabel><FormControl><Input type="number" placeholder="ex: 8.50" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="giftPhotos" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Fotos de Cortesia</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 
                 <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-md flex gap-2 items-start border border-border">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>O cliente precisa ter uma conta na plataforma. O ID pode ser encontrado na página de perfil do cliente.</span>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar e Vincular Álbum
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
