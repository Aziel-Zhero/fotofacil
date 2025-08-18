
"use client";

import { ErrorDisplay } from "@/components/error-display";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcional: Logar o erro em um serviço de monitoramento
    console.error(error);
  }, [error]);

  return (
    <ErrorDisplay
      statusCode="500"
      title="Ocorreu um Erro Inesperado"
      description="Nossa equipe já foi notificada sobre o problema. Por favor, tente novamente em alguns instantes."
      onReset={reset}
    />
  );
}
