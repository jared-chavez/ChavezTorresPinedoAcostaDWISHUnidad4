// Servicio de email usando MailerSend API (legacy)
// Para usar Resend, cambia EMAIL_PROVIDER=resend en .env
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { EmailResult } from './email-types';
import { readFileSync } from 'fs';
import { join } from 'path';

// Validar que el token esté configurado
const mailersendApiToken = process.env.MAILERSEND_API_TOKEN;

if (!mailersendApiToken) {
  console.warn('⚠️  MAILERSEND_API_TOKEN no está configurado. Los emails no se enviarán.');
}

// Inicializar cliente de MailerSend solo si hay token
const mailersend = mailersendApiToken 
  ? new MailerSend({
      apiKey: mailersendApiToken,
    })
  : null;

// Configuración del remitente
const getFromEmail = () => {
  const configuredEmail = process.env.MAILERSEND_FROM_EMAIL;
  
  if (!configuredEmail || configuredEmail.trim() === '') {
    return 'onboarding@mailersend.com';
  }
  
  const cleanEmail = configuredEmail.trim().replace(/^["']|["']$/g, '');
  
  if (cleanEmail === 'onboarding@mailersend.com') {
    return 'onboarding@mailersend.com';
  }
  
  if (cleanEmail.includes('@') && cleanEmail.includes('.mlsender.net')) {
    return cleanEmail;
  }
  
  if (cleanEmail.includes('@nocturna.com') || 
      cleanEmail.includes('@tudominio.com') ||
      cleanEmail.includes('@example.com') ||
      cleanEmail.includes('@test.com')) {
    return 'onboarding@mailersend.com';
  }
  
  return cleanEmail;
};

const getSafeFromEmail = () => 'onboarding@mailersend.com';
const fromEmail = getFromEmail();
const fromName = process.env.MAILERSEND_FROM_NAME || 'Nocturna Genesis';

// Cargar template HTML
function loadEmailTemplate(templateName: string): string {
  try {
    const templatePath = join(process.cwd(), 'src', 'lib', 'email-templates', `${templateName}.html`);
    return readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    throw new Error(`Template ${templateName} not found`);
  }
}

// Reemplazar variables en el template
function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Envía email de verificación de cuenta usando MailerSend
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string,
  ipAddress: string
): Promise<EmailResult> {
  try {
    if (!mailersend) {
      return {
        success: false,
        error: 'MailerSend no está configurado. Verifica MAILERSEND_API_TOKEN en .env.local',
      };
    }

    const apiToken = process.env.MAILERSEND_API_TOKEN || '';
    if (!apiToken.startsWith('mlsn.')) {
      return {
        success: false,
        error: 'MAILERSEND_API_TOKEN tiene formato incorrecto. Debe empezar con "mlsn."',
      };
    }

    // Construir URL de verificación
    // Priorizar NEXTAUTH_URL (ya incluye protocolo y puerto correcto)
    // Si no existe, usar APP_URL, y si es localhost sin puerto, agregar 8443 para HTTPS
    let appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Si es localhost sin puerto específico y estamos en producción, usar HTTPS en 8443
    if (appUrl.includes('localhost') && !appUrl.includes(':') && process.env.NODE_ENV === 'production') {
      appUrl = 'https://localhost:8443';
    } else if (appUrl.includes('localhost') && !appUrl.includes(':')) {
      // Desarrollo local sin puerto, usar 3000
      appUrl = 'http://localhost:3000';
    }
    
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    const template = loadEmailTemplate('verification-email');
    const htmlContent = replaceTemplateVariables(template, {
      name,
      verificationUrl,
      ipAddress,
      currentYear: new Date().getFullYear().toString(),
    });

    const textContent = `
Hola ${name},

Gracias por registrarte en Nocturna Genesis. Para completar tu registro, verifica tu cuenta haciendo clic en el siguiente enlace:

${verificationUrl}

Este enlace expirará en 24 horas y solo puede ser usado una vez.

Registro desde IP: ${ipAddress}

Si no solicitaste este registro, puedes ignorar este correo.

© ${new Date().getFullYear()} Nocturna Genesis. Todos los derechos reservados.
    `.trim();

    const sendEmailWithFallback = async (useSafeEmail: boolean = false) => {
      if (!mailersend) {
        throw new Error('MailerSend no está configurado');
      }
      
      const emailToUse = useSafeEmail ? getSafeFromEmail() : fromEmail;
      
      const emailParams = new EmailParams()
        .setFrom(new Sender(emailToUse.trim(), fromName))
        .setTo([new Recipient(to, name)])
        .setSubject('Verifica tu cuenta - Nocturna Genesis')
        .setHtml(htmlContent)
        .setText(textContent);

      return await mailersend.email.send(emailParams);
    };

    let response;
    let lastError: any = null;
    
    try {
      response = await sendEmailWithFallback(false);
      console.log('✅ Email de verificación enviado exitosamente a:', to);
      return {
        success: true,
        messageId: response.body?.message_id || 'sent',
      };
    } catch (firstError: any) {
      lastError = firstError;
      
      const statusCode = firstError.response?.statusCode || firstError.response?.status || firstError.statusCode;
      const errorBody = firstError.response?.body || firstError.body || {};
      const errorMessage = errorBody?.message || firstError.message || '';
      
      const isDomainError = statusCode === 422 && (
        errorMessage.includes('domain must be verified') ||
        errorMessage.includes('from.email') ||
        errorMessage.includes('MS42207')
      );
      
      if (isDomainError) {
        console.warn('⚠️  Email configurado no verificado, reintentando con onboarding@mailersend.com');
        try {
          response = await sendEmailWithFallback(true);
          console.log('✅ Email de verificación enviado exitosamente (con email seguro) a:', to);
          return {
            success: true,
            messageId: response.body?.message_id || 'sent',
          };
        } catch (retryError: any) {
          lastError = retryError;
        }
      }
    }
    
    throw lastError;
  } catch (error: any) {
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error.response) {
      const statusCode = error.response.statusCode || error.response.status;
      const body = error.response.body || error.response.data;
      
      if (statusCode === 401) {
        errorMessage = 'Token de MailerSend inválido o sin permisos. Verifica MAILERSEND_API_TOKEN en .env.local';
      } else if (statusCode === 422) {
        const msg = body?.message || 'Datos inválidos';
        if (msg.includes('Trial accounts') || msg.includes('MS42225')) {
          errorMessage = `Cuenta de prueba de MailerSend: solo se pueden enviar emails al email del administrador. Error: ${msg}`;
        } else if (msg.includes('domain must be verified') || msg.includes('from.email')) {
          errorMessage = `El dominio del email remitente no está verificado. Error: ${msg}`;
        } else {
          errorMessage = `Datos inválidos: ${msg}`;
        }
      } else {
        errorMessage = `Error de MailerSend (${statusCode}): ${body?.message || error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('❌ Error completo:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Envía email de bienvenida después de verificación usando MailerSend
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<EmailResult> {
  try {
    if (!mailersend) {
      return {
        success: false,
        error: 'MailerSend no está configurado. Verifica MAILERSEND_API_TOKEN en .env.local',
      };
    }

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Trade Winds', cursive; font-size: 28px;">
              Nocturna Genesis
            </h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937;">¡Bienvenido, ${name}!</h2>
            <p>Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión y comenzar a usar nuestros servicios.</p>
            <p style="margin-top: 20px;">
              <a href="${appUrl}/login" 
                 style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Iniciar Sesión
              </a>
            </p>
          </div>
        </body>
      </html>
    `;

    const emailParams = new EmailParams()
      .setFrom(new Sender(fromEmail, fromName))
      .setTo([new Recipient(to, name)])
      .setSubject('¡Bienvenido a Nocturna Genesis!')
      .setHtml(htmlContent)
      .setText(`¡Bienvenido, ${name}! Tu cuenta ha sido verificada exitosamente.`);

    const response = await mailersend.email.send(emailParams);

    console.log('✅ Email de bienvenida enviado exitosamente a:', to);
    return {
      success: true,
      messageId: response.body?.message_id || 'sent',
    };
  } catch (error: any) {
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error.response) {
      const statusCode = error.response.statusCode || error.response.status;
      const body = error.response.body || error.response.data;
      
      if (statusCode === 401) {
        errorMessage = 'Token de MailerSend inválido o sin permisos. Verifica MAILERSEND_API_TOKEN en .env.local';
      } else if (statusCode === 422) {
        const msg = body?.message || 'Datos inválidos';
        if (msg.includes('domain must be verified') || msg.includes('from.email')) {
          errorMessage = `El dominio del email remitente no está verificado. Error: ${msg}`;
        } else {
          errorMessage = `Datos inválidos: ${msg}`;
        }
      } else {
        errorMessage = `Error de MailerSend (${statusCode}): ${body?.message || error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('❌ Error enviando email de bienvenida:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
