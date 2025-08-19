"use server";

import { autoImageTagging, type AutoImageTaggingInput } from "@/ai/flows/image-tagging";
import { Resend } from 'resend';
import { SupportRequestEmail } from "@/emails/support-request";

const resendApiKey = process.env.RESEND_API_KEY;
const supportEmailTo = process.env.SUPPORT_EMAIL_TO || 'eduarda.blue03@gmail.com';
const supportEmailFrom = process.env.SUPPORT_EMAIL_FROM || 'onboarding@resend.dev';


export async function generateTagsForImage(
  input: AutoImageTaggingInput
): Promise<string[]> {
  try {
    const output = await autoImagetagging(input);
    return output.tags;
  } catch (error) {
    // Em um app real, seria bom ter um sistema de log de erros mais robusto aqui.
    return [];
  }
}

export async function sendSupportEmail(formData: FormData) {
  if (!resendApiKey) {
    console.error("Resend API key is missing.");
    return { error: 'O serviço de envio de email não está configurado. Por favor, contate o administrador do sistema.' };
  }

  const resend = new Resend(resendApiKey);
  const reason = formData.get('contactReason') as string;
  const description = formData.get('description') as string;
  // O anexo não é tratado nesta versão para simplificar, 
  // mas poderia ser adicionado aqui com `formData.get('screenshot')`.

  try {
    const { data, error } = await resend.emails.send({
      from: `Suporte FotoFácil <${supportEmailFrom}>`,
      to: [supportEmailTo],
      subject: `Nova Mensagem de Suporte: ${reason === 'problem' ? 'Problema' : 'Sugestão'}`,
      react: SupportRequestEmail({ reason, description }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: 'Não foi possível enviar o email. Tente novamente mais tarde.' };
    }

    return { success: true, message: 'Email enviado com sucesso!' };
  } catch (error) {
    console.error("Error sending email:", error);
    return { error: 'Ocorreu um erro no servidor.' };
  }
}
