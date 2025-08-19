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

  const bodyStyle: React.CSSProperties = {
      backgroundColor: 'hsl(21, 56%, 97%)',
      fontFamily: "'Segoe UI', sans-serif",
      color: 'hsl(19, 39%, 34%)',
      margin: 0,
      padding: 0,
  };

  const containerStyle: React.CSSProperties = {
      maxWidth: '600px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      border: '1px solid hsl(21, 33%, 80%)',
      borderRadius: '10px',
      padding: '30px',
      boxShadow: '0 2px 10px rgba(62, 44, 35, 0.05)',
  };

  const h1Style: React.CSSProperties = {
      fontSize: '22px',
      marginBottom: '8px',
      color: 'hsl(19, 39%, 34%)',
      fontWeight: 'bold',
  };

  const h2Style: React.CSSProperties = {
      fontSize: '18px',
      marginTop: '30px',
      marginBottom: '10px',
      color: 'hsl(19, 39%, 34%)',
      borderBottom: '1px solid hsl(21, 33%, 80%)',
      paddingBottom: '4px',
      fontWeight: 'bold',
  };

  const pStyle: React.CSSProperties = {
      fontSize: '15px',
      lineHeight: '1.6',
      color: 'hsl(19, 39%, 34%)',
      margin: '1em 0',
  };
  
  const labelStyle: React.CSSProperties = {
      fontWeight: 600,
  }

  const badgeStyle: React.CSSProperties = {
      display: 'inline-block',
      backgroundColor: 'hsl(22, 58%, 88%)',
      color: 'hsl(19, 39%, 34%)',
      fontSize: '13px',
      padding: '5px 10px',
      borderRadius: '999px',
      fontWeight: 500,
      marginLeft: '6px',
  };
  
  const messageBoxStyle: React.CSSProperties = {
    backgroundColor: 'hsl(21, 56%, 97%)',
    border: '1px solid hsl(21, 33%, 85%)',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '10px',
  };

  const attachmentSectionStyle: React.CSSProperties = {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: 'hsl(21, 56%, 97%)',
      border: '1px solid hsl(21, 33%, 85%)',
      borderRadius: '8px',
  };
  
  const footerStyle: React.CSSProperties = {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'hsl(22, 31%, 47%)',
    borderTop: '1px solid hsl(21, 33%, 90%)',
    paddingTop: '20px',
  };


  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body style={bodyStyle}>
          <Container style={containerStyle}>
            <Heading as="h1" style={h1Style}>
              📩 Nova Mensagem de Suporte Recebida
            </Heading>
            <Text style={pStyle}>
              Você recebeu uma nova mensagem através do formulário de contato do <strong>FotoFácil</strong>.
            </Text>

            <Section>
              <Heading as="h2" style={h2Style}>
                📝 Detalhes da Solicitação
              </Heading>
              <Text style={{...pStyle, marginBottom: '8px'}}>
                <span style={labelStyle}>Motivo do Contato:</span>
                <span style={badgeStyle}>{reasonText}</span>
              </Text>
              <Text style={{...pStyle, margin: '8px 0'}}>
                <strong style={labelStyle}>Nome:</strong> {userName}
              </Text>
              <Text style={{...pStyle, marginTop: '8px'}}>
                <strong style={labelStyle}>E-mail para resposta:</strong> {userEmail}
              </Text>
            </Section>

            <Section>
              <Heading as="h2" style={h2Style}>
                💬 Mensagem
              </Heading>
              <div style={messageBoxStyle}>
                <Text style={{...pStyle, margin: 0, whiteSpace: 'pre-wrap'}}>{description}</Text>
              </div>
            </Section>

            {attachmentFilename && (
               <Section>
                 <Heading as="h2" style={h2Style}>
                    📎 Anexo
                 </Heading>
                 <div style={attachmentSectionStyle}>
                    <Text style={{...pStyle, fontWeight: 600, margin: 0}}>
                        {attachmentFilename}
                    </Text>
                    <Text style={{...pStyle, fontSize: '12px', color: 'hsl(22, 31%, 47%)', margin: 0}}>
                        A imagem está anexada a este e-mail.
                    </Text>
                 </div>
               </Section>
            )}

            <Hr style={{borderColor: 'hsl(21, 33%, 80%)', margin: '28px 0'}} />

            <Section style={footerStyle}>
              <Text style={{margin: 0}}>
                Esta é uma mensagem automática enviada pelo sistema FotoFácil.
              </Text>
              <Text style={{margin: '8px 0 0 0'}}>
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
