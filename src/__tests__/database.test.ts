/**
 * Tests de ejemplo usando la BD real con estrategia de limpieza
 * 
 * IMPORTANTE: Estos tests usan la BD de producción/desarrollo.
 * Se recomienda:
 * 1. Usar prefijos 'test_' en todos los datos de prueba
 * 2. Limpiar datos después de cada test
 * 3. Verificar integridad de datos de producción
 * 
 * Para ejecutar estos tests, asegúrate de tener DATABASE_URL configurada
 * en tu .env.local apuntando a tu BD real.
 */

import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { prisma } from '@/lib/prisma';
import {
  cleanupTestData,
  createTestUser,
  verifyProductionDataIntegrity,
} from './database.test-helpers';

// Verificar que la BD está disponible
const isDatabaseAvailable = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('test_db');

describe.skip('Database Integration Tests', () => {
  // Skip si la BD no está disponible o es la BD de test
  if (!isDatabaseAvailable) {
    console.log('⚠️  Saltando tests de BD: DATABASE_URL no configurada o es BD de test');
    return;
  }

  beforeEach(async () => {
    // Limpiar datos de test antes de cada test
    await cleanupTestData('test_');
  });

  afterAll(async () => {
    // Limpiar todos los datos de test al final
    await cleanupTestData('test_');
    
    // Verificar que no afectamos datos de producción
    const isClean = await verifyProductionDataIntegrity();
    expect(isClean).toBe(true);
  });

  it('should create and read a test user', async () => {
    const testUser = await createTestUser();
    
    expect(testUser).toBeDefined();
    expect(testUser.email).toContain('test_');
    expect(testUser.role).toBe('usuarios_regulares');

    // Verificar que se puede leer
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(testUser.email);
  });

  it('should not affect production users', async () => {
    // Contar usuarios de producción (sin prefijo test_)
    const productionUsersBefore = await prisma.user.count({
      where: {
        email: {
          not: {
            startsWith: 'test_',
          },
        },
      },
    });

    // Crear usuario de test
    await createTestUser();

    // Verificar que el conteo de producción no cambió
    const productionUsersAfter = await prisma.user.count({
      where: {
        email: {
          not: {
            startsWith: 'test_',
          },
        },
      },
    });

    expect(productionUsersAfter).toBe(productionUsersBefore);
  });

  it('should clean up test data after test', async () => {
    // Crear varios usuarios de test
    await createTestUser('user1@test.com');
    await createTestUser('user2@test.com');
    await createTestUser('user3@test.com');

    // Verificar que existen
    const testUsersBefore = await prisma.user.count({
      where: {
        email: {
          startsWith: 'test_',
        },
      },
    });

    expect(testUsersBefore).toBeGreaterThanOrEqual(3);

    // Limpiar
    await cleanupTestData('test_');

    // Verificar que se eliminaron
    const testUsersAfter = await prisma.user.count({
      where: {
        email: {
          startsWith: 'test_',
        },
      },
    });

    expect(testUsersAfter).toBe(0);
  });
});

