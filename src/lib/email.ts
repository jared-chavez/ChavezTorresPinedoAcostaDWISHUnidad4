// Servicio de email usando MailerSend API
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
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
// IMPORTANTE: Para desarrollo, puedes usar:
// 1. 'onboarding@mailersend.com' (puede requerir activación de cuenta)
// 2. Un email de tu dominio de prueba verificado (ej: 'noreply@test-xxxxx.mlsender.net')
// 3. Un email de tu dominio personalizado verificado
const getFromEmail = () => {
  const configuredEmail = process.env.MAILERSEND_FROM_EMAIL;
  
  // Si no hay email configurado, usar el por defecto de MailerSend
  if (!configuredEmail || configuredEmail.trim() === '') {
    return 'onboarding@mailersend.com';
  }
  
  // Limpiar comillas y espacios
  const cleanEmail = configuredEmail.trim().replace(/^["']|["']$/g, '');
  
  // Si el email es el por defecto de MailerSend, usarlo directamente
  if (cleanEmail === 'onboarding@mailersend.com') {
    return 'onboarding@mailersend.com';
  }
  
  // Si es un email de dominio de prueba de MailerSend (mlsender.net), usarlo
  if (cleanEmail.includes('@') && cleanEmail.includes('.mlsender.net')) {
    return cleanEmail;
  }
  
  // Si es un email de ejemplo o placeholder, usar el por defecto
  if (cleanEmail.includes('@nocturna.com') || 
      cleanEmail.includes('@tudominio.com') ||
      cleanEmail.includes('@example.com') ||
      cleanEmail.includes('@test.com')) {
    return 'onboarding@mailersend.com';
  }
  
  // Para otros emails, intentar usarlos (pueden fallar si el dominio no está verificado)
  return cleanEmail;
};

// Función para obtener email seguro (siempre usa onboarding@mailersend.com)
const getSafeFromEmail = () => 'onboarding@mailersend.com';

// Obtener email remitente (con fallback a onboarding@mailersend.com)
const fromEmail = getFromEmail();
const fromName = process.env.MAILERSEND_FROM_NAME || 'Nocturna Genesis';

// Log de configuración al iniciar
if (process.env.NODE_ENV === 'development') {
  console.log('📧 Configuración de email:', {
    fromEmail,
    fromName,
    configuredEmail: process.env.MAILERSEND_FROM_EMAIL || 'no configurado',
    hasToken: !!mailersendApiToken,
  });
}

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

// Interfaz para respuesta de envío
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía email de verificación de cuenta
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string,
  ipAddress: string
): Promise<EmailResult> {
  try {
    // Validar que MailerSend esté configurado
    if (!mailersend) {
      const errorMsg = 'MailerSend no está configurado. Verifica MAILERSEND_API_TOKEN en .env.local';
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Validar formato del token (debe empezar con "mlsn.")
    const apiToken = process.env.MAILERSEND_API_TOKEN || '';
    if (!apiToken.startsWith('mlsn.')) {
      const errorMsg = 'MAILERSEND_API_TOKEN tiene formato incorrecto. Debe empezar con "mlsn."';
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Construir URL de verificación
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    // Cargar y procesar template
    const template = loadEmailTemplate('verification-email');
    const htmlContent = replaceTemplateVariables(template, {
      name,
      verificationUrl,
      ipAddress,
      currentYear: new Date().getFullYear().toString(),
    });

    // Crear texto alternativo
    const textContent = `
Hola ${name},

Gracias por registrarte en Nocturna Genesis. Para completar tu registro, verifica tu cuenta haciendo clic en el siguiente enlace:

${verificationUrl}

Este enlace expirará en 24 horas y solo puede ser usado una vez.

Registro desde IP: ${ipAddress}

Si no solicitaste este registro, puedes ignorar este correo.

© ${new Date().getFullYear()} Nocturna Genesis. Todos los derechos reservados.
    `.trim();

    // Función helper para enviar email con fallback
    const sendEmailWithFallback = async (useSafeEmail: boolean = false) => {
      if (!mailersend) {
        throw new Error('MailerSend no está configurado');
      }
      
      const emailToUse = useSafeEmail ? getSafeFromEmail() : fromEmail;
      
      // Log para debugging
      console.log(`📧 Intentando enviar email desde: ${emailToUse} (safe: ${useSafeEmail})`);
      
      const emailParams = new EmailParams()
        .setFrom(new Sender(emailToUse.trim(), fromName))
        .setTo([new Recipient(to, name)])
        .setSubject('Verifica tu cuenta - Nocturna Genesis')
        .setHtml(htmlContent)
        .setText(textContent);

      return await mailersend.email.send(emailParams);
    };

    // Intentar enviar email (con fallback automático si falla)
    let response;
    let lastError: any = null;
    
    // Primero intentar con el email configurado
    try {
      response = await sendEmailWithFallback(false);
      console.log('✅ Email de verificación enviado exitosamente a:', to);
      return {
        success: true,
        messageId: response.body?.message_id || 'sent',
      };
    } catch (firstError: any) {
      lastError = firstError;
      
      // Si falla con error 422 (dominio no verificado), intentar con email seguro
      // MailerSend puede estructurar el error de diferentes formas
      const statusCode = firstError.response?.statusCode || firstError.response?.status || firstError.statusCode;
      const errorBody = firstError.response?.body || firstError.body || {};
      const errorMessage = errorBody?.message || firstError.message || '';
      
      // Detectar diferentes tipos de errores 422
      const isDomainError = statusCode === 422 && (
        errorMessage.includes('domain must be verified') ||
        errorMessage.includes('from.email') ||
        errorMessage.includes('MS42207')
      );
      
      const isTrialLimitError = statusCode === 422 && (
        errorMessage.includes('Trial accounts') ||
        errorMessage.includes('MS42225') ||
        errorMessage.includes("can only send emails to the administrator's email")
      );
      
      // Log para debugging
      if (statusCode === 422) {
        console.error('❌ Error 422 detectado:', {
          statusCode,
          message: errorMessage,
          body: errorBody,
          isDomainError,
          isTrialLimitError,
        });
      }
      
      // Si es error de dominio no verificado, intentar con email seguro
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
          // Si el retry también falla, verificar si es el mismo error de trial
          const retryStatusCode = retryError.response?.statusCode || retryError.response?.status || retryError.statusCode;
          const retryBody = retryError.response?.body || retryError.body || {};
          const retryMessage = retryBody?.message || retryError.message || '';
          
          if (retryStatusCode === 422 && (
            retryMessage.includes('Trial accounts') ||
            retryMessage.includes('MS42225')
          )) {
            // Es un error de límite de cuenta trial, no continuar
            lastError = retryError;
          } else {
            // Otro tipo de error, usar el error del retry
            lastError = retryError;
          }
        }
      }
      
      // Si es error de límite de cuenta trial, no intentar retry
      if (isTrialLimitError) {
        console.warn('⚠️  Cuenta de prueba de MailerSend: solo se pueden enviar emails al email del administrador');
        // No intentar retry, el error es claro
      }
    }
    
    // Si llegamos aquí, ambos intentos fallaron
    throw lastError;
  } catch (error: any) {
    // Manejo detallado de errores
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error.response) {
      // Error de la API de MailerSend
      const statusCode = error.response.statusCode || error.response.status;
      const body = error.response.body || error.response.data;
      
      console.error('❌ Error de MailerSend API:', {
        statusCode,
        body,
        message: body?.message || error.message,
      });
      
      if (statusCode === 401) {
        errorMessage = 'Token de MailerSend inválido o sin permisos. Verifica MAILERSEND_API_TOKEN en .env.local';
      } else if (statusCode === 422) {
        // Error 422: Dominio no verificado, límite de cuenta trial, o datos inválidos
        const msg = body?.message || 'Datos inválidos';
        if (msg.includes('Trial accounts') || msg.includes('MS42225') || msg.includes("can only send emails to the administrator's email")) {
          errorMessage = `Cuenta de prueba de MailerSend: solo se pueden enviar emails al email del administrador de la cuenta. Para enviar a otros emails, necesitas actualizar tu cuenta a un plan de pago. Error: ${msg}`;
        } else if (msg.includes('domain must be verified') || msg.includes('from.email') || msg.includes('MS42207')) {
          errorMessage = `El dominio del email remitente no está verificado. El sistema intentará usar 'onboarding@mailersend.com' automáticamente. Error: ${msg}`;
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
 * Envía email de bienvenida después de verificación
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<EmailResult> {
  try {
    // Validar que MailerSend esté configurado
    if (!mailersend) {
      const errorMsg = 'MailerSend no está configurado. Verifica MAILERSEND_API_TOKEN en .env.local';
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg,
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
    // Manejo detallado de errores
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error.response) {
      const statusCode = error.response.statusCode || error.response.status;
      const body = error.response.body || error.response.data;
      
      if (statusCode === 401) {
        errorMessage = 'Token de MailerSend inválido o sin permisos. Verifica MAILERSEND_API_TOKEN en .env.local';
      } else if (statusCode === 422) {
        const msg = body?.message || 'Datos inválidos';
        if (msg.includes('domain must be verified') || msg.includes('from.email')) {
          errorMessage = `El dominio del email remitente no está verificado. Para desarrollo, usa 'onboarding@mailersend.com' o verifica tu dominio en MailerSend. Error: ${msg}`;
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

