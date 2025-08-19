"use client"

import { useState, useEffect } from 'react';
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
import { Info, Loader2, UserPlus, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAlbum, getClientsForPhotographer } from '../app/dashboard/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import Link from 'next/link';

// Schema atualizado para refletir o novo formulário
const formSchema = z.object({
  albumName: z.string().min(1, "O nome do álbum é obrigatório."),
  clientUserId: z.string({ required_error: "Por favor, selecione um cliente."}).uuid("Por favor, selecione um cliente."),
  expirationDate: z.string().optional(),
  maxPhotos: z.coerce.number().min(1, "Por favor, defina um número máximo de fotos."),
  extraPhotoCost: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
  giftPhotos: z.coerce.number().min(0, "O valor deve ser zero ou maior.").optional(),
  pixKey: z.string().optional(),
}).refine(data => {
    // Se o custo da foto extra for maior que zero, a chave PIX é obrigatória.
    if ((data.extraPhotoCost || 0) > 0) {
        return !!data.pixKey && data.pixKey.length > 0;
    }
    return true;
}, {
    message: "A Chave PIX é obrigatória se houver custo por foto extra.",
    path: ["pixKey"],
});


export function CreateAlbumDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState<{ id: string; full_name: string | null; email: string | null }[]>([]);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            albumName: "",
            clientUserId: undefined,
            expirationDate: "",
            maxPhotos: 50,
            extraPhotoCost: 0,
            giftPhotos: 0,
            pixKey: "",
        },
    });

    const extraPhotoCost = form.watch('extraPhotoCost');

    useEffect(() => {
        if (open) {
            const fetchClients = async () => {
                const result = await getClientsForPhotographer();
                if (result.clients) {
                    setClients(result.clients);
                } else {
                    toast({ title: "Erro", description: result.error, variant: "destructive" });
                }
            };
            fetchClients();
        }
    }, [open, toast]);

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
      } else if (result?.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        form.reset();
        setOpen(false);
      }
      setIsSubmitting(false);
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" onInteractOutside={(e) => {
          if(isSubmitting) e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle className="font-headline text-textDark">
            Criar Novo Álbum
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes para criar um álbum e vinculá-lo a um cliente existente.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <FormField name="albumName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Nome do Álbum</FormLabel><FormControl><Input placeholder="ex: Casamento na Toscana" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="p-4 border rounded-md space-y-4 bg-muted/20">
                     <h3 className="font-semibold text-textDark flex items-center gap-2"><UserPlus className="h-5 w-5"/> Vincular Cliente</h3>
                     <FormField
                        control={form.control}
                        name="clientUserId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cliente da sua lista" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {clients.length > 0 ? clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.full_name} ({client.email})
                                        </SelectItem>
                                    )) : (
                                        <div className="p-4 text-sm text-muted-foreground">Nenhum cliente cadastrado.</div>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                <div className="p-4 border rounded-md space-y-4 bg-muted/20">
                    <h3 className="font-semibold text-textDark flex items-center gap-2"><DollarSign className="h-5 w-5"/> Configuração Financeira</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="extraPhotoCost" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Preço por Foto Extra (R$)</FormLabel><FormControl><Input type="number" placeholder="ex: 8.50" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        {(extraPhotoCost || 0) > 0 && (
                             <FormField name="pixKey" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Sua Chave PIX</FormLabel><FormControl><Input placeholder="Email, CPF, Telefone ou Chave Aleatória" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField name="expirationDate" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Data de Expiração (Opcional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="maxPhotos" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Máx. de Seleções</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="giftPhotos" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Fotos de Cortesia</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 
                 <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-md flex gap-2 items-start border border-border">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Se o cliente não aparece na lista, você pode cadastrá-lo na página <Link href="/dashboard/register-client" className='underline font-semibold'>Cadastrar Cliente</Link>.</span>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Processando...' : 'Criar Álbum'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
