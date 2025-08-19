
"use client";

import { DropdownMenuItem } from "./ui/dropdown-menu";
import { resetClientPassword } from "@/app/dashboard/actions";
import { useToast } from "./ui/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ResetPasswordButtonProps {
    clientId: string;
    clientEmail: string | null;
}

export function ResetPasswordButton({ clientId, clientEmail }: ResetPasswordButtonProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!clientEmail) {
            toast({
                title: "Erro",
                description: "Este cliente não tem um e-mail cadastrado para redefinir a senha.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const result = await resetClientPassword(clientId, clientEmail);

        if (result.error) {
            toast({
                title: "Erro ao Redefinir Senha",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Senha Redefinida!",
                description: `Uma nova senha foi gerada e um e-mail de redefinição foi enviado para ${clientEmail}.`,
            });
        }
        setIsLoading(false);
    };

    return (
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleResetPassword(); }} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Redefinir Senha
        </DropdownMenuItem>
    );
}
