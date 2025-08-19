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
}

export const SupportRequestEmail = ({
  reason,
  description,
}: SupportRequestEmailProps) => {
  const previewText = `Nova mensagem de suporte: ${reason}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg shadow-sm my-10 mx-auto p-8 max-w-2xl">
            <Heading className="text-2xl font-bold text-gray-800">
              Nova Mensagem de Suporte Recebida
            </Heading>

            <Section className="my-6">
              <Text className="text-lg">
                Uma nova mensagem foi enviada através do formulário de contato do FotoFácil.
              </Text>
            </Section>

            <Hr className="border-t border-gray-300" />

            <Section className="my-6">
              <Heading as="h2" className="text-xl font-semibold text-gray-700">
                Detalhes da Solicitação
              </Heading>
              <Text className="text-base">
                <strong className="font-semibold">Motivo do Contato:</strong> {reason === 'problem' ? 'Relato de Problema' : 'Sugestão de Melhoria'}
              </Text>
              <Container className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <Text className="text-base text-gray-800 whitespace-pre-wrap">
                  {description}
                </Text>
              </Container>
            </Section>

            <Hr className="border-t border-gray-300" />

            <Section className="text-center mt-8 text-xs text-gray-500">
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
