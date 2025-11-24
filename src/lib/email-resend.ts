// Servicio de email usando Resend API
// Alternativa moderna y fácil de usar para MailerSend

import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EmailResult } from './email-types';

// Validar que el API key esté configurado
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('⚠️  RESEND_API_KEY no está configurado. Los emails no se enviarán.');
}

// Inicializar cliente de Resend solo si hay API key
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configuración del remitente
const getFromEmail = () => {
  const configuredEmail = process.env.RESEND_FROM_EMAIL;
  
  // Si no hay email configurado, usar el por defecto de Resend para desarrollo
  if (!configuredEmail || configuredEmail.trim() === '') {
    return 'onboarding@resend.dev';
  }
  
  // Limpiar comillas y espacios
  const cleanEmail = configuredEmail.trim().replace(/^["']|["']$/g, '');
  
  // Si es un email de ejemplo o placeholder, usar el por defecto
  if (cleanEmail.includes('@nocturna.com') || 
      cleanEmail.includes('@tudominio.com') ||
      cleanEmail.includes('@example.com') ||
      cleanEmail.includes('@test.com')) {
    return 'onboarding@resend.dev';
  }
  
  return cleanEmail;
};

const fromEmail = getFromEmail();
const fromName = process.env.RESEND_FROM_NAME || 'Nocturna Genesis';

// Log de configuración al iniciar
if (process.env.NODE_ENV === 'development') {
  console.log('📧 Configuración de Resend:', {
    fromEmail,
    fromName,
    configuredEmail: process.env.RESEND_FROM_EMAIL || 'no configurado',
    hasApiKey: !!resendApiKey,
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

// Función centralizada para obtener la URL de la aplicación
// Prioriza NEXTAUTH_URL, luego APP_URL, y finalmente un fallback
function getAppUrl(): string {
  // Priorizar NEXTAUTH_URL (configurado en NextAuth)
  let appUrl = process.env.NEXTAUTH_URL;
  
  // Si no existe, usar APP_URL
  if (!appUrl) {
    appUrl = process.env.APP_URL;
  }
  
  // Si aún no existe, usar NEXT_PUBLIC_APP_URL (para client-side)
  if (!appUrl) {
    appUrl = process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback solo si ninguna variable está configurada
  if (!appUrl) {
    // En producción, usar localhost:8443 (HTTPS local)
    if (process.env.NODE_ENV === 'production') {
      appUrl = 'https://localhost:8443';
    } else {
      // En desarrollo, usar localhost:3000
      appUrl = 'http://localhost:3000';
    }
  }
  
  // Asegurar que la URL no termine con /
  appUrl = appUrl.trim().replace(/\/$/, '');
  
  // Log en desarrollo para debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 URL de aplicación para emails:', appUrl);
  }
  
  return appUrl;
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
 * Envía email de verificación de cuenta usando Resend
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string,
  ipAddress: string
): Promise<EmailResult> {
  try {
    // Validar que Resend esté configurado
    if (!resend) {
      const errorMsg = 'Resend no está configurado. Verifica RESEND_API_KEY en .env.local';
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Construir URL de verificación usando función centralizada
    const appUrl = getAppUrl();
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

    // Enviar email con Resend
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: 'Verifica tu cuenta - Nocturna Genesis',
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('❌ Error de Resend API:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar email',
      };
    }

    console.log('✅ Email de verificación enviado exitosamente a:', to);
    return {
      success: true,
      messageId: data?.id || 'sent',
    };
  } catch (error: any) {
    // Manejo de errores
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error.message) {
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
 * Envía email de bienvenida después de verificación usando Resend
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<EmailResult> {
  try {
    // Validar que Resend esté configurado
    if (!resend) {
      const errorMsg = 'Resend no está configurado. Verifica RESEND_API_KEY en .env.local';
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const appUrl = getAppUrl();
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

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: '¡Bienvenido a Nocturna Genesis!',
      html: htmlContent,
      text: `¡Bienvenido, ${name}! Tu cuenta ha sido verificada exitosamente.`,
    });

    if (error) {
      console.error('❌ Error de Resend API:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar email',
      };
    }

    console.log('✅ Email de bienvenida enviado exitosamente a:', to);
    return {
      success: true,
      messageId: data?.id || 'sent',
    };
  } catch (error: any) {
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('❌ Error enviando email de bienvenida:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Envía comprobante de compra usando Resend
 */
export async function sendPurchaseReceipt(
  to: string,
  name: string,
  sale: {
    invoiceNumber: string;
    vehicle: {
      brand: string;
      model: string;
      year: number;
      color: string;
      vin: string;
    };
    salePrice: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: string;
    saleDate: Date;
  }
): Promise<EmailResult> {
  try {
    // Validar que Resend esté configurado
    if (!resend) {
      const errorMsg = 'Resend no está configurado. Verifica RESEND_API_KEY en .env.local';
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const appUrl = getAppUrl();
    const saleDate = new Date(sale.saleDate).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

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
            <h2 style="color: #1f2937; margin-top: 0;">¡Gracias por tu compra, ${name}!</h2>
            <p>Tu compra ha sido procesada exitosamente. Aquí está el detalle de tu factura:</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Detalles de la Compra</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Número de Factura:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: bold;">${sale.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Fecha:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937;">${saleDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Vehículo:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937;">${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Color:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937;">
                    <span style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; background-color: ${sale.vehicle.color}; border: 1px solid #ccc; vertical-align: middle; margin-right: 5px;"></span>
                    ${sale.vehicle.color}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>VIN:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937; font-family: monospace;">${sale.vehicle.vin}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;"><strong>Subtotal:</strong></td>
                  <td style="padding: 12px 0; text-align: right; color: #1f2937;">$${sale.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>IVA (16%):</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937;">$${sale.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #1f2937; font-size: 18px;"><strong>Total:</strong></td>
                  <td style="padding: 12px 0; text-align: right; color: #3b82f6; font-size: 18px; font-weight: bold;">$${sale.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Método de Pago:</strong></td>
                  <td style="padding: 8px 0; text-align: right; color: #1f2937;">${sale.paymentMethod === 'credit' ? 'Tarjeta de Crédito' : sale.paymentMethod === 'paypal' ? 'PayPal' : sale.paymentMethod}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin-top: 20px;">
              <a href="${appUrl}/my-purchases" 
                 style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ver Mis Compras
              </a>
            </p>
            
            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Nocturna Genesis. Todos los derechos reservados.
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
¡Gracias por tu compra, ${name}!

Tu compra ha sido procesada exitosamente.

Número de Factura: ${sale.invoiceNumber}
Fecha: ${saleDate}
Vehículo: ${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year}
Color: ${sale.vehicle.color}
VIN: ${sale.vehicle.vin}

Subtotal: $${sale.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
IVA (16%): $${sale.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
Total: $${sale.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}

Método de Pago: ${sale.paymentMethod === 'credit' ? 'Tarjeta de Crédito' : sale.paymentMethod}

Ver tus compras: ${appUrl}/my-purchases

© ${new Date().getFullYear()} Nocturna Genesis. Todos los derechos reservados.
    `.trim();

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: `Comprobante de Compra - ${sale.invoiceNumber} - Nocturna Genesis`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('❌ Error de Resend API:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar email',
      };
    }

    console.log('✅ Comprobante de compra enviado exitosamente a:', to);
    return {
      success: true,
      messageId: data?.id || 'sent',
    };
  } catch (error: any) {
    let errorMessage = 'Error desconocido al enviar comprobante';
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('❌ Error enviando comprobante de compra:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
