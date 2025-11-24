#!/usr/bin/env node
/**
 * Script para verificar y desbloquear usuarios suspendidos
 * Uso: node scripts/check-suspended-users.js [--unblock-all]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unblockAll = process.argv.includes('--unblock-all');

  try {
    // Buscar usuarios suspendidos
    const suspendedUsers = await prisma.user.findMany({
      where: {
        status: 'suspended',
      },
      select: {
        id: true,
        email: true,
        name: true,
        registeredIp: true,
        createdAt: true,
      },
    });

    if (suspendedUsers.length === 0) {
      console.log('✅ No hay usuarios suspendidos en la base de datos.');
      return;
    }

    console.log(`\n📋 Usuarios suspendidos encontrados: ${suspendedUsers.length}\n`);
    suspendedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
      console.log(`   IP registrada: ${user.registeredIp || 'N/A'}`);
      console.log(`   Fecha: ${user.createdAt.toLocaleString()}\n`);
    });

    if (unblockAll) {
      console.log('🔄 Desbloqueando todos los usuarios suspendidos...\n');
      
      const updated = await prisma.user.updateMany({
        where: {
          status: 'suspended',
        },
        data: {
          status: 'active',
        },
      });

      console.log(`✅ ${updated.count} usuario(s) desbloqueado(s) exitosamente.`);
      console.log('   Estado cambiado de "suspended" a "active".\n');
    } else {
      console.log('💡 Para desbloquear todos los usuarios suspendidos, ejecuta:');
      console.log('   node scripts/check-suspended-users.js --unblock-all\n');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

