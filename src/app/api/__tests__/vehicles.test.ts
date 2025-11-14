/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '../vehicles/route';
import { createMockRequest, mockAuth } from '@/__tests__/helpers/test-helpers';
import { vehicleDB } from '@/lib/db';

// Mock de dependencias
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@/lib/db', () => ({
  vehicleDB: {
    getAll: jest.fn(),
    findByStatus: jest.fn(),
    create: jest.fn(),
  },
}));

const { auth } = require('@/lib/auth');

describe('API /api/vehicles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/vehicles', () => {
    it('should return vehicles without authentication (public access)', async () => {
      const mockVehicles = [
        {
          id: 'vehicle-1',
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 35000,
          status: 'available',
        },
        {
          id: 'vehicle-2',
          brand: 'Honda',
          model: 'Civic',
          year: 2022,
          price: 28000,
          status: 'available',
        },
      ];

      (vehicleDB.getAll as jest.Mock).mockResolvedValue(mockVehicles);
      (auth as jest.Mock).mockResolvedValue(null); // No requiere autenticación

      const request = createMockRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].brand).toBe('Toyota');
    });

    it('should filter vehicles by status', async () => {
      const mockVehicles = [
        {
          id: 'vehicle-1',
          brand: 'Toyota',
          model: 'Camry',
          status: 'sold',
        },
      ];

      (vehicleDB.findByStatus as jest.Mock).mockResolvedValue(mockVehicles);

      const request = createMockRequest('GET', undefined, undefined, { status: 'sold' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(vehicleDB.findByStatus).toHaveBeenCalledWith('sold');
      expect(data[0].status).toBe('sold');
    });
  });

  describe('POST /api/vehicles', () => {
    it('should create vehicle as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const mockVehicle = {
        id: 'vehicle-new',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        color: 'Rojo',
        price: 45000,
        mileage: 0,
        fuelType: 'electric',
        transmission: 'automatic',
        status: 'available',
        vin: '5YJ3E1EA1KF123789',
        description: 'Vehículo eléctrico',
        createdBy: 'admin-123',
        createdAt: new Date(),
      };

      (vehicleDB.create as jest.Mock).mockResolvedValue(mockVehicle);

      const request = createMockRequest('POST', {
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        color: 'Rojo',
        price: 45000,
        mileage: 0,
        fuelType: 'electric',
        transmission: 'automatic',
        status: 'available',
        vin: '5YJ3E1EA1KF123789',
        description: 'Vehículo eléctrico',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.brand).toBe('Tesla');
      expect(data.model).toBe('Model 3');
      expect(vehicleDB.create).toHaveBeenCalled();
    });

    it('should create vehicle as emprendedor', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      const mockVehicle = {
        id: 'vehicle-new',
        brand: 'Ford',
        model: 'F-150',
        year: 2023,
        color: 'Negro',
        price: 50000,
        mileage: 1000,
        fuelType: 'gasoline',
        transmission: 'automatic',
        status: 'available',
        vin: '1FTFW1E50MFA12345',
        description: 'Pickup truck',
        createdBy: 'emprendedor-123',
        createdAt: new Date(),
      };

      (vehicleDB.create as jest.Mock).mockResolvedValue(mockVehicle);

      const request = createMockRequest('POST', {
        brand: 'Ford',
        model: 'F-150',
        year: 2023,
        color: 'Negro',
        price: 50000,
        mileage: 1000,
        fuelType: 'gasoline',
        transmission: 'automatic',
        status: 'available',
        vin: '1FTFW1E50MFA12345',
        description: 'Pickup truck',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.brand).toBe('Ford');
    });

    it('should reject vehicle creation without authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('POST', {
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        color: 'Rojo',
        price: 45000,
        mileage: 0,
        fuelType: 'electric',
        transmission: 'automatic',
        status: 'available',
        vin: '5YJ3E1EA1KF123789',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('No autorizado');
    });

    it('should reject vehicle creation as usuario regular', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const request = createMockRequest('POST', {
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        color: 'Rojo',
        price: 45000,
        mileage: 0,
        fuelType: 'electric',
        transmission: 'automatic',
        status: 'available',
        vin: '5YJ3E1EA1KF123789',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('No autorizado');
    });

    it('should reject vehicle creation with invalid data', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const request = createMockRequest('POST', {
        brand: '', // Invalid: empty brand
        model: 'Model 3',
        year: 2024,
        color: 'Rojo',
        price: -1000, // Invalid: negative price
        mileage: 0,
        fuelType: 'electric',
        transmission: 'automatic',
        status: 'available',
        vin: 'SHORT', // Invalid: VIN too short
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});

