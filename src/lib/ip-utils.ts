// Utilidades para manejo de IP addresses

import { NextRequest } from 'next/server';
import { prisma } from './prisma';

/**
 * Obtiene la IP real del cliente desde la request
 */
export function getClientIp(request: NextRequest): string {
  // Intentar obtener IP de headers comunes
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (realIp) {
    return realIp;
  }

  if (forwarded) {
    // x-forwarded-for puede contener múltiples IPs, tomar la primera
    return forwarded.split(',')[0].trim();
  }

  // Fallback: si no se encuentra IP en headers, retornar unknown
  return 'unknown';
}

/**
 * Verifica si una IP está en la blacklist
 */
export async function isIpBlacklisted(ip: string): Promise<boolean> {
  try {
    // Ignorar IPs desconocidas o inválidas (común cuando se pasa por proxies/ngrok)
    if (!ip || ip === 'unknown' || ip.trim() === '') {
      console.log('⚠️  IP desconocida detectada, omitiendo verificación de blacklist');
      return false;
    }

    // Por ahora, solo verificamos en la tabla de usuarios
    // En el futuro, podrías crear una tabla IpBlacklist
    const blacklistedUser = await prisma.user.findFirst({
      where: {
        registeredIp: ip,
        status: 'suspended',
      },
    });

    if (blacklistedUser) {
      console.log(`🚫 IP bloqueada detectada: ${ip} (usuario suspendido: ${blacklistedUser.email})`);
    }

    return !!blacklistedUser;
  } catch (error) {
    console.error('Error checking IP blacklist:', error);
    // En caso de error, permitir el registro (fail-open)
    return false;
  }
}

/**
 * Verifica si una IP está en la whitelist
 */
export async function isIpWhitelisted(ip: string): Promise<boolean> {
  try {
    // Por ahora, retornamos false
    // En el futuro, podrías crear una tabla IpWhitelist
    return false;
  } catch (error) {
    console.error('Error checking IP whitelist:', error);
    return false;
  }
}

/**
 * Verifica rate limiting por IP
 * Limita a 3 registros por hora por IP
 */
export async function checkIpRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentRegistrations = await prisma.user.count({
      where: {
        registeredIp: ip,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    const maxRegistrationsPerHour = 3;
    const allowed = recentRegistrations < maxRegistrationsPerHour;

    return {
      allowed,
      remaining: Math.max(0, maxRegistrationsPerHour - recentRegistrations),
      resetAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  } catch (error) {
    console.error('Error checking IP rate limit:', error);
    // En caso de error, permitir el registro
    return {
      allowed: true,
      remaining: 3,
      resetAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}

