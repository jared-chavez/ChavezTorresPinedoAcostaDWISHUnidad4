// Servicio de email con soporte para múltiples proveedores
// Soporta: Resend (recomendado), MailerSend, y otros

import { EmailResult } from './email-types';

// Determinar qué proveedor usar basado en variables de entorno
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend'; // 'resend' | 'mailersend' | 'none'

// Importar funciones según el proveedor configurado
let sendVerificationEmailImpl: (
  to: string,
  name: string,
  verificationToken: string,
  ipAddress: string
) => Promise<EmailResult>;

let sendWelcomeEmailImpl: (
  to: string,
  name: string
) => Promise<EmailResult>;
  
// Cargar implementación según el proveedor
if (EMAIL_PROVIDER === 'resend') {
  try {
    const resendModule = require('./email-resend');
    sendVerificationEmailImpl = resendModule.sendVerificationEmail;
    sendWelcomeEmailImpl = resendModule.sendWelcomeEmail;
    console.log('📧 Usando Resend como proveedor de email');
  } catch (error) {
    console.warn('⚠️  Resend no disponible, usando MailerSend como fallback');
    const mailersendModule = require('./email-mailersend');
    sendVerificationEmailImpl = mailersendModule.sendVerificationEmail;
    sendWelcomeEmailImpl = mailersendModule.sendWelcomeEmail;
  }
} else if (EMAIL_PROVIDER === 'mailersend') {
  try {
    const mailersendModule = require('./email-mailersend');
    sendVerificationEmailImpl = mailersendModule.sendVerificationEmail;
    sendWelcomeEmailImpl = mailersendModule.sendWelcomeEmail;
    console.log('📧 Usando MailerSend como proveedor de email');
  } catch (error) {
    console.warn('⚠️  MailerSend no disponible');
    sendVerificationEmailImpl = async () => ({
      success: false,
      error: 'MailerSend no configurado',
    });
    sendWelcomeEmailImpl = async () => ({
      success: false,
      error: 'MailerSend no configurado',
    });
  }
} else {
  // Modo 'none' - no enviar emails
  console.warn('⚠️  Email provider configurado como "none". Los emails no se enviarán.');
  sendVerificationEmailImpl = async () => ({
    success: false,
    error: 'Email provider no configurado',
  });
  sendWelcomeEmailImpl = async () => ({
    success: false,
    error: 'Email provider no configurado',
  });
}

/**
 * Envía email de verificación de cuenta
 * Usa el proveedor configurado en EMAIL_PROVIDER
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string,
  ipAddress: string
): Promise<EmailResult> {
  return sendVerificationEmailImpl(to, name, verificationToken, ipAddress);
}

/**
 * Envía email de bienvenida después de verificación
 * Usa el proveedor configurado en EMAIL_PROVIDER
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<EmailResult> {
  return sendWelcomeEmailImpl(to, name);
}

/**
 * Envía comprobante de compra
 * Usa el proveedor configurado en EMAIL_PROVIDER
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
  // Solo Resend tiene implementación de comprobante por ahora
  if (EMAIL_PROVIDER === 'resend') {
    try {
      const resendModule = require('./email-resend');
      return resendModule.sendPurchaseReceipt(to, name, sale);
    } catch (error) {
      console.warn('⚠️  Error al enviar comprobante:', error);
      return {
        success: false,
        error: 'Error al enviar comprobante',
      };
    }
  }
  
  // Para otros proveedores, retornar error
    return {
      success: false,
    error: 'Envío de comprobante solo disponible con Resend',
    };
}

// Re-exportar tipos
export type { EmailResult } from './email-types';
