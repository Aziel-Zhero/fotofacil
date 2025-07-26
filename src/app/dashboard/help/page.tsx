
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SupportForm } from "@/components/support-form";

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline">Central de Ajuda</h1>
        <p className="text-muted-foreground mt-2">
          Tem alguma dúvida? Estamos aqui para ajudar!
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Fale Conosco</CardTitle>
          <CardDescription>
            Selecione o motivo do seu contato e preencha o formulário abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportForm />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">FAQ - Perguntas Frequentes</CardTitle>
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
             <AccordionItem value="item-4">
                <AccordionTrigger>Como a marcação por IA pode me ajudar?</AccordionTrigger>
                <AccordionContent>
                    Nossa inteligência artificial analisa o conteúdo de cada foto e sugere tags (palavras-chave) automaticamente. Isso economiza seu tempo e torna muito mais fácil encontrar fotos específicas dentro de um grande álbum.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>Meus dados e fotos estão seguros?</AccordionTrigger>
                <AccordionContent>
                    Sim. A segurança é nossa prioridade. Usamos as melhores práticas de mercado para proteger seus dados e as fotos de seus clientes. Os álbuns podem ser protegidos por senha para garantir a privacidade.
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
