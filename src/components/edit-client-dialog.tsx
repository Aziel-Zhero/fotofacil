
"use client"

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { updateClient } from '@/app/dashboard/actions';
import { Client } from './clients-data-table';


const formSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  email: z.string().email('Endereço de email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
});

interface EditClientDialogProps {
  client: Client;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function EditClientDialog({ client, isOpen, setIsOpen }: EditClientDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: client.full_name || '',
            email: client.email || '',
            phone: client.phone || '',
        },
    });
    
    React.useEffect(() => {
        if(isOpen) {
            form.reset({
                fullName: client.full_name || '',
                email: client.email || '',
                phone: client.phone || '',
            });
        }
    }, [isOpen, client, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    
    formData.append('clientId', client.id);
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const result = await updateClient(formData);

    if (result?.error) {
      toast({
        title: "Erro ao Atualizar Cliente",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.success) {
       toast({
        title: "Cliente Atualizado!",
        description: result.message,
      });
      form.reset();
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente abaixo.
          </DialogDescription>
        </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField name="fullName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                        <PhoneInput
                            international
                            defaultCountry="BR"
                            value={field.value}
                            onChange={field.onChange}
                            className="PhoneInput"
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
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
