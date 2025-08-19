
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Mail } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8 text-center">
        <LifeBuoy className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold font-headline mt-4">Central de Ajuda</h1>
        <p className="text-muted-foreground mt-2">
          Tem alguma dúvida? Encontre respostas e dicas aqui.
        </p>
      </div>

      <Card className="mb-8 text-center">
        <CardHeader>
          <CardTitle className="font-headline">Precisa Falar Conosco?</CardTitle>
          <CardDescription>
            Nossa equipe está pronta para ajudar com qualquer problema ou sugestão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/contact">
              <Mail className="mr-2 h-4 w-4" />
              Ir para a Página de Contato
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">FAQ - Perguntas Frequentes</CardTitle>
           <CardDescription>
            Dicas e instruções sobre as principais funcionalidades da ferramenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Como funciona a seleção de fotos pelo cliente?</AccordionTrigger>
                <AccordionContent>
                    Seu cliente recebe um link exclusivo para o álbum. Ele pode marcar as fotos favoritas. Quando atingir o limite do pacote, ele será notificado e poderá comprar fotos extras, se você tiver habilitado essa opção.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Como funcionam os pagamentos de fotos extras?</AccordionTrigger>
                <AccordionContent>
                    Ao configurar um álbum, você define o preço por foto extra. O cliente poderá pagar via PIX por meio de uma chave segura gerada para a transação. O valor é transferido diretamente para você.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>O que são as fotos de cortesia?</AccordionTrigger>
                <AccordionContent>
                    É uma forma de surpreender seu cliente! Você pode adicionar algumas fotos extras como um presente. Elas serão reveladas ao cliente no final da seleção, como um bônus.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>Meus dados e fotos estão seguros?</AccordionTrigger>
                <AccordionContent>
                    Sim. A segurança é nossa prioridade. Usamos as melhores práticas de mercado para proteger seus dados e as fotos de seus clientes. Os álbuns podem ser protegidos por senha para garantir a privacidade.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-6">
                <AccordionTrigger>Dica: Como garantir que novos usuários sejam criados corretamente?</AccordionTrigger>
                <AccordionContent>
                    Nossa plataforma usa gatilhos de banco de dados para criar perfis de fotógrafos e clientes automaticamente. Se um usuário não for criado, a causa mais comum é uma falha de permissão no gatilho do Supabase. Para evitar isso, sempre garanta que a função do gatilho (`on_auth_user_created`) tenha permissões de `service_role` para inserir dados nas tabelas `photographers` e `clients`.
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
