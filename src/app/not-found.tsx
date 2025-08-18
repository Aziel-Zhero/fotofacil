
import { ErrorDisplay } from "@/components/error-display";

export default function NotFound() {
  return (
    <ErrorDisplay
      statusCode="404"
      title="Página Não Encontrada"
      description="Oops! A página que você está procurando não existe. Ela pode ter sido movida ou removida."
      linkHref="/"
      linkText="Voltar para a Página Inicial"
    />
  );
}
