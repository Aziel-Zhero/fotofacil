
"use client";

import { useState } from 'react';
import { MoreHorizontal, Loader2, KeyRound } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EditClientDialog } from './edit-client-dialog';
import { type ClientData } from '@/app/dashboard/clients/page';
import { ManagePasswordDialog } from './manage-password-dialog';

interface ClientActionsProps {
  client: ClientData;
}

export function ClientActions({ client }: ClientActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

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
          <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Gerenciar Senha
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditClientDialog
        client={client}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />
      <ManagePasswordDialog
        client={client}
        isOpen={isPasswordDialogOpen}
        setIsOpen={setIsPasswordDialogOpen}
      />
    </>
  );
}
