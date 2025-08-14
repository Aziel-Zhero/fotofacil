
"use client";

import { useState } from 'react';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { resetClientPassword } from '@/app/dashboard/actions';
import { EditClientDialog } from './edit-client-dialog';
import { type ClientData } from '@/app/dashboard/clients/page';

interface ClientActionsProps {
  client: ClientData;
}

export function ClientActions({ client }: ClientActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleResetPassword = async () => {
    setIsLoading(true);
    const result = await resetClientPassword(client.id);
    if (result.error) {
      toast({ title: "Erro ao Redefinir Senha", description: result.error, variant: "destructive" });
    } else if (result.success) {
      toast({ title: "Sucesso!", description: result.message });
    }
    setIsLoading(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            Editar Cliente
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleResetPassword} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Redefinir Senha
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditClientDialog
        client={client}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />
    </>
  );
}
