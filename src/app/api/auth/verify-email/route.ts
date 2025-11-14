// API Route para verificación de email

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userDB } from '@/lib/db';
import { getClientIp } from '@/lib/ip-utils';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // 1. Buscar token de verificación
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Token de verificación inválido' },
        { status: 404 }
      );
    }

    // 2. Verificar si el token ya fue usado
    if (verification.usedAt) {
      return NextResponse.json(
        { error: 'Este token ya fue utilizado' },
        { status: 400 }
      );
    }

    // 3. Verificar si el token expiró
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: 'El token de verificación ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // 4. Obtener IP del cliente
    const clientIp = getClientIp(request);

    // 5. Activar cuenta del usuario
    await userDB.update(verification.userId, {
      status: 'active',
      emailVerified: true,
      verifiedIp: clientIp,
      verifiedAt: new Date(),
    });

    // 6. Marcar token como usado
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    });

    // 7. Enviar email de bienvenida
    const emailResult = await sendWelcomeEmail(
      verification.user.email,
      verification.user.name
    );

    if (!emailResult.success) {
      console.error('Error sending welcome email:', emailResult.error);
      // No fallar la verificación si el email falla
    }

    // 8. Retornar éxito
    return NextResponse.json(
      {
        message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en verificación de email:', error);
    return NextResponse.json(
      { error: 'Error al verificar el email' },
      { status: 500 }
    );
  }
}

