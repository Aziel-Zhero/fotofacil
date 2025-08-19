import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
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
}

export const SupportRequestEmail = ({
  reason,
  description,
  userName,
  userEmail,
}: SupportRequestEmailProps) => {
  const previewText = `Nova mensagem de suporte: ${reason}`;
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
                primary: "hsl(24, 53%, 72%)",
                background: "hsl(21, 56%, 95%)",
                foreground: "hsl(19, 39%, 34%)",
              },
            },
          },
        }}
      >
        <Body className="bg-background font-sans">
          <Container className="bg-white border-foreground/20 rounded-lg shadow-sm my-10 mx-auto p-8 max-w-2xl">
            <Heading className="text-2xl font-bold text-foreground">
              Nova Mensagem de Suporte Recebida
            </Heading>

            <Section className="my-6">
              <Text className="text-lg text-foreground">
                Uma nova mensagem foi enviada através do formulário de contato do <strong>FotoFácil</strong>.
              </Text>
            </Section>

            <Hr className="border-t border-foreground/20" />

            <Section className="my-6">
              <Heading as="h2" className="text-xl font-semibold text-foreground">
                Detalhes da Solicitação
              </Heading>
              
              <Text className="text-base text-foreground">
                <strong className="font-semibold">Remetente:</strong> {userName}
              </Text>
              <Text className="text-base text-foreground">
                <strong className="font-semibold">Email para resposta:</strong> {userEmail}
              </Text>
               <Text className="text-base text-foreground">
                <strong className="font-semibold">Motivo do Contato:</strong> {reasonText}
              </Text>

              <Text className="font-semibold mt-4 mb-2 text-foreground">Mensagem:</Text>
              <Container className="bg-background/50 p-6 rounded-lg border border-foreground/10">
                <Text className="text-base text-foreground whitespace-pre-wrap m-0">
                  {description}
                </Text>
              </Container>
            </Section>

            <Hr className="border-t border-foreground/20" />

            <Section className="text-center mt-8 text-xs text-foreground/70">
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
