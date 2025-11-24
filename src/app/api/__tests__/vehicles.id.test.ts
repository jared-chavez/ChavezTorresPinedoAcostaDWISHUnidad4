/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET, PUT, DELETE } from '../vehicles/[id]/route';
import { createMockRequest, mockAuth } from '@/__tests__/helpers/test-helpers';
import { vehicleDB } from '@/lib/db';

// Mock de dependencias
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@/lib/db', () => ({
  vehicleDB: {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const { auth } = require('@/lib/auth');

describe('API /api/vehicles/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/vehicles/[id]', () => {
    it('should return vehicle by id (public access)', async () => {
      const mockVehicle = {
        id: 'vehicle-123',
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        price: 35000,
        status: 'available',
        vin: '5YJ3E1EA1KF123789',
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(mockVehicle);
      (auth as jest.Mock).mockResolvedValue(null); // No requiere autenticación

      const request = createMockRequest('GET');
      const response = await GET(request, {
        params: Promise.resolve({ id: 'vehicle-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('vehicle-123');
      expect(data.brand).toBe('Toyota');
    });

    it('should return 404 if vehicle not found', async () => {
      (vehicleDB.findById as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('GET');
      const response = await GET(request, {
        params: Promise.resolve({ id: 'non-existent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('no encontrado');
    });
  });

  describe('PUT /api/vehicles/[id]', () => {
    it('should update vehicle as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const existingVehicle = {
        id: 'vehicle-123',
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        price: 35000,
        status: 'available',
      };

      const updatedVehicle = {
        ...existingVehicle,
        price: 38000,
        status: 'reserved',
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(existingVehicle);
      (vehicleDB.update as jest.Mock).mockResolvedValue(updatedVehicle);

      const request = createMockRequest('PUT', {
        price: 38000,
        status: 'reserved',
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'vehicle-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.price).toBe(38000);
      expect(data.status).toBe('reserved');
    });

    it('should update vehicle as emprendedor', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      const existingVehicle = {
        id: 'vehicle-123',
        brand: 'Honda',
        model: 'Civic',
        price: 28000,
      };

      const updatedVehicle = {
        ...existingVehicle,
        price: 30000,
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(existingVehicle);
      (vehicleDB.update as jest.Mock).mockResolvedValue(updatedVehicle);

      const request = createMockRequest('PUT', { price: 30000 });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'vehicle-123' }),
      });

      expect(response.status).toBe(200);
    });

    it('should reject update without authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('PUT', { price: 38000 });
      const response = await PUT(request, {
        params: Promise.resolve({ id: 'vehicle-123' }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject update as usuario regular', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const request = createMockRequest('PUT', { price: 38000 });
      const response = await PUT(request, {
        params: Promise.resolve({ id: 'vehicle-123' }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/vehicles/[id]', () => {
    it('should delete vehicle as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const vehicleToDelete = {
        id: 'vehicle-123',
        brand: 'Toyota',
        model: 'Camry',
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(vehicleToDelete);
      (vehicleDB.delete as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'vehicle-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('eliminado');
    });

    it('should reject deletion as emprendedor', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'vehicle-123' }),
      });

      expect(response.status).toBe(403);
    });

    it('should return 404 if vehicle not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());
      (vehicleDB.findById as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'non-existent' }),
      });

      expect(response.status).toBe(404);
    });
  });
});

