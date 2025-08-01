
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
  DialogClose,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Copy, Info, Loader2, UserPlus, Mail, Phone, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAlbum } from '../app/dashboard/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  albumName: z.string().min(1, "O nome do álbum é obrigatório."),
  clientFullName: z.string().min(1, "O nome completo do cliente é obrigatório."),
  clientEmail: z.string().email("O e-mail do cliente é inválido."),
  clientPhone: z.string().optional(),
  expirationDate: z.string().optional(),
  maxPhotos: z.coerce.number().min(1, "Por favor, defina um número máximo de fotos."),
  extraPhotoCost: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
  giftPhotos: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
});


export function CreateAlbumDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newClientData, setNewClientData] = useState<{email: string, password: string} | null>(null);

    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            albumName: "",
            clientFullName: "",
            clientEmail: "",
            clientPhone: "",
            expirationDate: "",
            maxPhotos: 50,
            extraPhotoCost: 0,
            giftPhotos: 0,
        },
      });
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado!",
            description: "As informações de acesso do cliente foram copiadas.",
        })
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
      setIsSubmitting(true);
      setNewClientData(null);

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
      } else if (result?.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        if(result.newClientData) {
            setNewClientData(result.newClientData);
        } else {
            form.reset();
            setOpen(false);
        }
      }
      setIsSubmitting(false);
    }

    const handleClose = () => {
        setOpen(false);
        setNewClientData(null);
        form.reset();
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" onInteractOutside={(e) => {
          // Previne o fechamento se o processo estiver em andamento
          if(isSubmitting) e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle className="font-headline text-textDark">Criar Novo Álbum</DialogTitle>
          <DialogDescription>
            {newClientData ? "Cliente criado! Compartilhe os dados de acesso." : "Preencha os detalhes para criar um álbum e um acesso para seu cliente."}
          </DialogDescription>
        </DialogHeader>
        
        { newClientData ? (
             <div className="space-y-4 py-4">
                <Alert variant="default" className="bg-green-100 border-green-200">
                     <CheckCircle className="h-4 w-4 text-green-700" />
                    <AlertTitle className="text-green-800 font-bold">Conta de Cliente Criada!</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Envie os dados abaixo para o seu cliente acessar o portal e ver o álbum.
                    </AlertDescription>
                </Alert>
                <div className="space-y-2">
                    <Label>Email do Cliente</Label>
                    <div className="flex gap-2">
                        <Input readOnly value={newClientData.email} />
                        <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(newClientData.email)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Senha Gerada para o Cliente</Label>
                    <div className="flex gap-2">
                        <Input readOnly value={newClientData.password} />
                        <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(newClientData.password)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
                 <Button type="button" className="w-full" onClick={() => copyToClipboard(`Email: ${newClientData.email}\nSenha: ${newClientData.password}`)}>
                    <Copy className="mr-2"/> Copiar Email e Senha
                </Button>
             </div>
        ) : (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <FormField name="albumName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nome do Álbum</FormLabel><FormControl><Input placeholder="ex: Casamento na Toscana" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <div className="p-4 border rounded-md space-y-4 bg-muted/20">
                         <h3 className="font-semibold text-textDark flex items-center gap-2"><UserPlus className="h-5 w-5"/> Dados do Cliente</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="clientFullName" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="ex: Maria da Silva" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="clientEmail" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="ex: maria.silva@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField name="clientPhone" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Telefone (Opcional)</FormLabel><FormControl><Input placeholder="(11) 98765-4321" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <span>Se o cliente já tiver conta, o álbum será adicionado ao perfil existente. Caso contrário, uma nova conta será criada com uma senha segura que você deverá compartilhar.</span>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSubmitting ? 'Processando...' : 'Criar Álbum e Cliente'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        )}
        <DialogFooter className={newClientData ? '' : 'hidden'}>
            <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
