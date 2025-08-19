
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ClientData } from '@/app/dashboard/clients/page';
import { updateClientPassword } from '@/app/dashboard/actions';

const formSchema = z.object({
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

interface ManagePasswordDialogProps {
  client: ClientData;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ManagePasswordDialog({ client, isOpen, setIsOpen }: ManagePasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    form.setValue('password', retVal, { shouldValidate: true });
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('clientId', client.id);
    formData.append('password', values.password);

    const result = await updateClientPassword(formData);

    if (result?.error) {
      toast({
        title: "Erro ao Atualizar Senha",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      form.reset();
      setIsOpen(false);
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <KeyRound />
            Gerenciar Senha do Cliente
          </DialogTitle>
          <DialogDescription>
            Defina uma nova senha para {client.full_name}. Lembre-se de compartilhá-la de forma segura.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input {...field} type={showPassword ? 'text' : 'password'} className="pr-10"/>
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )} />
             <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Senha Forte
            </Button>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Nova Senha
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

