
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface SupportRequestEmailProps {
  reason: string;
  description: string;
  userName: string;
  userEmail: string;
  attachmentFilename?: string;
}

export const SupportRequestEmail = ({
  reason,
  description,
  userName,
  userEmail,
  attachmentFilename,
}: SupportRequestEmailProps) => {
  const previewText = `Nova mensagem de suporte de ${userName}`;
  const reasonText = reason === 'problem' ? 'Relato de Problema' : 'Sugestão de Melhoria';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "hsl(var(--primary))",
                bg: "hsl(var(--background))",
                fg: "hsl(var(--foreground))",
              },
              fontFamily: {
                sans: ['Segoe UI', 'sans-serif'],
              }
            },
          },
        }}
      >
        <Body className="bg-bg font-sans text-fg">
          <Container className="max-w-xl my-10 mx-auto p-8 bg-white border border-border rounded-lg shadow-sm">
            <Heading as="h1" className="text-2xl font-semibold m-0 text-foreground">
              📩 Nova Mensagem de Suporte Recebida
            </Heading>
            <Text className="text-base mt-4">
              Você recebeu uma nova mensagem através do formulário de contato do <strong>FotoFácil</strong>.
            </Text>

            <Section className="my-6">
              <Heading as="h2" className="text-lg font-semibold text-foreground border-b border-border pb-2">
                📝 Detalhes da Solicitação
              </Heading>
              <Text className="text-base mt-4">
                <strong className="font-semibold">Motivo do Contato:</strong>
                <span className="inline-block bg-secondary text-secondary-foreground text-xs font-medium ml-2 px-3 py-1 rounded-full">{reasonText}</span>
              </Text>
              <Text className="text-base">
                <strong className="font-semibold">Nome:</strong> {userName}
              </Text>
              <Text className="text-base">
                <strong className="font-semibold">E-mail para resposta:</strong> {userEmail}
              </Text>
            </Section>

            <Section className="my-6">
              <Heading as="h2" className="text-lg font-semibold text-foreground border-b border-border pb-2">
                💬 Mensagem
              </Heading>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-5 mt-4">
                <Text className="text-base m-0 whitespace-pre-wrap">{description}</Text>
              </div>
            </Section>

            {attachmentFilename && (
               <Section className="my-6">
                 <Heading as="h2" className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    📎 Anexo
                 </Heading>
                 <div className="bg-muted/30 border border-border/50 rounded-lg p-5 mt-4">
                    <Text className="text-sm font-medium">
                        {attachmentFilename}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                        A imagem está anexada a este e-mail.
                    </Text>
                 </div>
               </Section>
            )}

            <Hr className="border-t border-border my-8" />

            <Section className="text-center text-xs text-muted-foreground">
              <Text>
                Esta é uma mensagem automática enviada pelo sistema FotoFácil.
              </Text>
              <Text>
                © {new Date().getFullYear()} FotoFácil. Todos os direitos reservados.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SupportRequestEmail;
