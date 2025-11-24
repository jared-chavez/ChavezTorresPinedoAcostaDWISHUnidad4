/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET } from '../health/route';
import { prisma } from '@/lib/prisma';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('API /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return healthy status when database is connected', async () => {
      // Mock de conexión exitosa a la base de datos
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.database).toBe('connected');
      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe('string');
    });

    it('should return unhealthy status when database connection fails', async () => {
      // Mock de error de conexión
      const dbError = new Error('Connection timeout');
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(dbError);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.database).toBe('disconnected');
      expect(data.error).toBe('Connection timeout');
      expect(data.timestamp).toBeDefined();
    });

    it('should return unhealthy status for unknown database errors', async () => {
      // Mock de error desconocido
      (prisma.$queryRaw as jest.Mock).mockRejectedValue('Unknown error');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.database).toBe('disconnected');
      expect(data.error).toBe('Unknown error');
    });

    it('should include timestamp in response', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const beforeTime = new Date().toISOString();
      const response = await GET();
      const afterTime = new Date().toISOString();
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(data.timestamp >= beforeTime).toBe(true);
      expect(data.timestamp <= afterTime).toBe(true);
    });

    it('should be accessible without authentication (public endpoint)', async () => {
      // Este endpoint no requiere autenticación
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const response = await GET();
      
      expect(response.status).toBe(200);
      // No debería requerir headers de autenticación
    });
  });
});


