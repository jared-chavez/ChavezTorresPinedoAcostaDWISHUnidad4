const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔐 Actualizando contraseñas...');
    
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const salesHash = await bcrypt.hash('Sales123!', 10);
    
    await prisma.user.update({
      where: { email: 'admin@agencia.com' },
      data: { 
        password: adminHash,
        status: 'active',
        emailVerified: true
      }
    });
    console.log('✅ Admin actualizado');
    
    await prisma.user.upsert({
      where: { email: 'sales@agencia.com' },
      update: { 
        password: salesHash,
        status: 'active',
        emailVerified: true
      },
      create: {
        email: 'sales@agencia.com',
        name: 'Vendedor Ventas',
        password: salesHash,
        role: 'emprendedores',
        status: 'active',
        emailVerified: true
      }
    });
    console.log('✅ Sales actualizado');
    
    console.log('🎉 Listo!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

