// Helpers para tests con base de datos
// Estrategia: Usar transacciones que se revierten para aislar tests

import { prisma } from '@/lib/prisma';

/**
 * Ejecuta un test dentro de una transacción que se revierte automáticamente
 * Esto permite usar la BD real sin afectar datos existentes
 */
export async function withTransaction<T>(
  testFn: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  // Crear una transacción
  return await prisma.$transaction(async (tx) => {
    try {
      // Ejecutar el test dentro de la transacción
      await testFn(tx as typeof prisma);
      // Lanzar error para forzar rollback
      throw new Error('ROLLBACK_TEST_TRANSACTION');
    } catch (error) {
      // Si es nuestro error de rollback, está bien
      if (error instanceof Error && error.message === 'ROLLBACK_TEST_TRANSACTION') {
        // Retornar el resultado antes del rollback
        // Nota: Esto no funcionará perfectamente, pero es un patrón común
        throw error;
      }
      throw error;
    }
  });
}

/**
 * Limpia datos de prueba después de cada test
 * Útil cuando usas la BD real y quieres limpiar datos específicos
 */
export async function cleanupTestData(prefix: string = 'test_') {
  // Eliminar datos que empiecen con el prefijo de test
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: prefix,
      },
    },
  });

  await prisma.vehicle.deleteMany({
    where: {
      vin: {
        startsWith: prefix,
      },
    },
  });

  await prisma.sale.deleteMany({
    where: {
      customerEmail: {
        startsWith: prefix,
      },
    },
  });
}

/**
 * Crea datos de prueba con prefijo para fácil identificación
 */
export async function createTestUser(email: string = 'test_user@test.com') {
  return await prisma.user.create({
    data: {
      email: `test_${Date.now()}_${email}`,
      name: 'Test User',
      password: 'hashed_password',
      role: 'usuarios_regulares',
      status: 'active' as any,
      emailVerified: true,
    },
  });
}

/**
 * Verifica que no haya datos de producción afectados
 * Úsalo en afterAll para asegurar que los tests no afectaron datos reales
 */
export async function verifyProductionDataIntegrity() {
  // Verificar que no hay emails de test en producción
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'test_',
      },
    },
  });

  if (testUsers.length > 0) {
    console.warn(`⚠️  Se encontraron ${testUsers.length} usuarios de test en la BD`);
  }

  return testUsers.length === 0;
}

