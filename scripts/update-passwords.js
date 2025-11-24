// Script para actualizar contraseñas de usuarios
// Se ejecuta directamente con Node.js (sin tsx)

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Actualizando contraseñas de usuarios...');

  // Hashear contraseñas
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const salesHash = await bcrypt.hash('Sales123!', 10);
  const emprendedorHash = await bcrypt.hash('Emprendedor123!', 10);

  // Actualizar admin
  const admin = await prisma.user.update({
    where: { email: 'admin@agencia.com' },
    data: {
      password: adminHash,
      status: 'active',
      emailVerified: true,
    },
  });
  console.log('✅ Contraseña de admin actualizada:', admin.email);

  // Actualizar o crear sales
  const sales = await prisma.user.upsert({
    where: { email: 'sales@agencia.com' },
    update: {
      password: salesHash,
      status: 'active',
      emailVerified: true,
      name: 'Vendedor Ventas',
      role: 'emprendedores',
    },
    create: {
      email: 'sales@agencia.com',
      name: 'Vendedor Ventas',
      password: salesHash,
      role: 'emprendedores',
      status: 'active',
      emailVerified: true,
    },
  });
  console.log('✅ Contraseña de sales actualizada:', sales.email);

  // Actualizar o crear emprendedor
  const emprendedor = await prisma.user.upsert({
    where: { email: 'emprendedor@agencia.com' },
    update: {
      password: emprendedorHash,
      status: 'active',
      emailVerified: true,
    },
    create: {
      email: 'emprendedor@agencia.com',
      name: 'Emprendedor Ejemplo',
      password: emprendedorHash,
      role: 'emprendedores',
      status: 'active',
      emailVerified: true,
    },
  });
  console.log('✅ Contraseña de emprendedor actualizada:', emprendedor.email);

  console.log('🎉 Contraseñas actualizadas exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

