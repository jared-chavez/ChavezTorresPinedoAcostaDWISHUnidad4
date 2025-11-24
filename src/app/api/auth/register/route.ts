// API Route para registro público con verificación de email

import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { userDB } from '@/lib/db';
import { getClientIp, isIpBlacklisted, checkIpRateLimit } from '@/lib/ip-utils';
import { sendVerificationEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener IP del cliente
    const clientIp = getClientIp(request);
    console.log(`🔍 IP detectada para registro: ${clientIp}`);

    // 2. Validar IP (blacklist)
    if (await isIpBlacklisted(clientIp)) {
      console.log(`❌ Registro bloqueado para IP: ${clientIp}`);
      return NextResponse.json(
        { error: 'Tu IP ha sido bloqueada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // 3. Rate limiting por IP
    const rateLimit = await checkIpRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiados intentos de registro desde esta IP. Intenta más tarde.',
          resetAt: rateLimit.resetAt.toISOString(),
        },
        { status: 429 }
      );
    }

    // 4. Validar datos del formulario
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // 5. Verificar si el email ya existe
    const existingUser = await userDB.findByEmail(validated.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // 6. Hashear contraseña
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // 7. Crear usuario con estado "pending_verification"
    const user = await userDB.create({
      ...validated,
      password: hashedPassword,
      status: 'pending_verification',
      emailVerified: false,
      registeredIp: clientIp,
    });

    // 8. Generar token de verificación
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // 9. Guardar token en base de datos
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        email: validated.email,
        ipAddress: clientIp,
        expiresAt,
      },
    });

    // 10. Enviar email de verificación
    const emailResult = await sendVerificationEmail(
      validated.email,
      validated.name,
      token,
      clientIp
    );

    if (!emailResult.success) {
      console.error('Error sending verification email:', emailResult.error);
      
      // Si es un error de límite de cuenta trial, informar al usuario
      const isTrialLimitError = emailResult.error?.includes('Trial accounts') || 
                                 emailResult.error?.includes('MS42225') ||
                                 emailResult.error?.includes("can only send emails to the administrator's email");
      
      if (isTrialLimitError) {
        // El registro se completa, pero el email no se puede enviar
        // En producción, podrías querer notificar al administrador o usar otro método
        console.warn('⚠️  Registro completado, pero email no enviado debido a límite de cuenta trial de MailerSend');
        console.warn('⚠️  El usuario puede verificar manualmente usando el token en la base de datos');
      }
      // No fallar el registro si el email falla, pero loguear el error
    }

    // 11. Retornar éxito (sin exponer información sensible)
    // Nota: Siempre retornamos éxito porque el usuario fue creado
    // El email puede fallar por límites de la cuenta trial, pero el registro es válido
    return NextResponse.json(
      {
        message: 'Registro exitoso. Por favor verifica tu email para activar tu cuenta.',
        email: validated.email,
        // Si el email falló, no exponer el error al cliente por seguridad
        // El usuario puede verificar manualmente si es necesario
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}

