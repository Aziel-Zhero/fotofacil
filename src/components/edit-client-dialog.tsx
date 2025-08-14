
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ClientData } from '@/app/dashboard/clients/page';
import { updateClient } from '@/app/dashboard/actions';

const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
});

interface EditClientDialogProps {
  client: ClientData;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function EditClientDialog({ client, isOpen, setIsOpen }: EditClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: client.full_name ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        fullName: client.full_name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
      });
    }
  }, [isOpen, client, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('clientId', client.id);
    formData.append('fullName', values.fullName);
    formData.append('email', values.email);
    formData.append('phone', values.phone);

    const result = await updateClient(formData);

    if (result?.error) {
      toast({
        title: "Erro ao Atualizar",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setIsOpen(false);
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações de {client.full_name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField name="fullName" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="phone" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
