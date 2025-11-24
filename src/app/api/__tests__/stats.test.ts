/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET } from '../stats/dashboard/route';
import { createMockRequest, mockAuth } from '@/__tests__/helpers/test-helpers';
import { prisma } from '@/lib/prisma';

// Mock de dependencias
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    vehicle: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    sale: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
  },
}));

const { auth } = require('@/lib/auth');

describe('API /api/stats/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/stats/dashboard', () => {
    it('should return dashboard stats as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      // Mock de datos de estadísticas
      (prisma.vehicle.count as jest.Mock).mockResolvedValue(50);
      (prisma.sale.count as jest.Mock).mockResolvedValue(120);
      (prisma.user.count as jest.Mock).mockResolvedValue(30);
      (prisma.sale.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalAmount: 5000000 },
      });
      (prisma.vehicle.groupBy as jest.Mock).mockResolvedValue([
        { status: 'available', _count: { id: 30 } },
        { status: 'sold', _count: { id: 15 } },
        { status: 'reserved', _count: { id: 5 } },
      ]);
      (prisma.sale.findMany as jest.Mock).mockResolvedValue([
        { saleDate: new Date('2024-01-15'), totalAmount: 50000 },
        { saleDate: new Date('2024-01-20'), totalAmount: 75000 },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalVehicles).toBe(50);
      expect(data.totalSales).toBe(120);
      expect(data.totalUsers).toBe(30);
      expect(data.totalRevenue).toBe(5000000);
      expect(data.vehicleStatus).toBeDefined();
      expect(Array.isArray(data.recentSales)).toBe(true);
    });

    it('should return dashboard stats as emprendedor', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      (prisma.vehicle.count as jest.Mock).mockResolvedValue(25);
      (prisma.sale.count as jest.Mock).mockResolvedValue(60);
      (prisma.user.count as jest.Mock).mockResolvedValue(15);
      (prisma.sale.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalAmount: 2500000 },
      });
      (prisma.vehicle.groupBy as jest.Mock).mockResolvedValue([
        { status: 'available', _count: { id: 15 } },
        { status: 'sold', _count: { id: 8 } },
      ]);
      (prisma.sale.findMany as jest.Mock).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalVehicles).toBeDefined();
      expect(data.totalSales).toBeDefined();
    });

    it('should reject access without authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('No autorizado');
    });

    it('should handle database errors gracefully', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());
      (prisma.vehicle.count as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});

