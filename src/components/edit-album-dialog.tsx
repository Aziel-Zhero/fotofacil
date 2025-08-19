
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
import { updateAlbum } from '@/app/dashboard/actions';
import type { AlbumData } from '@/app/dashboard/album/[albumId]/page';

const formSchema = z.object({
  name: z.string().min(1, 'O nome do álbum é obrigatório.'),
  selection_limit: z.coerce.number().min(1, 'O limite de seleção deve ser de pelo menos 1.'),
});

interface EditAlbumDialogProps {
  album: AlbumData;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function EditAlbumDialog({ album, isOpen, setIsOpen }: EditAlbumDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: album.name,
      selection_limit: album.selection_limit,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: album.name,
        selection_limit: album.selection_limit,
      });
    }
  }, [isOpen, album, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('albumId', album.id);
    formData.append('name', values.name);
    formData.append('selection_limit', String(values.selection_limit));

    const result = await updateAlbum(formData);

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
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => isSubmitting && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Detalhes do Álbum</DialogTitle>
          <DialogDescription>
            Atualize as informações do álbum "{album.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Álbum</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="selection_limit" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de Seleção de Fotos</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
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
