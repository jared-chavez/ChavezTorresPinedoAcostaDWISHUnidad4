/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '../sales/route';
import { PUT, DELETE } from '../sales/[id]/route';
import { createMockRequest, mockAuth } from '@/__tests__/helpers/test-helpers';
import { saleDB, vehicleDB } from '@/lib/db';

// Mock de dependencias
jest.mock('@/lib/auth', () => ({
  auth: jest.fn() as jest.MockedFunction<() => Promise<unknown>>,
}));
jest.mock('@/lib/db', () => ({
  saleDB: {
    getAll: jest.fn() as jest.MockedFunction<() => Promise<unknown[]>>,
    findById: jest.fn() as jest.MockedFunction<(id: string) => Promise<unknown | null>>,
    create: jest.fn() as jest.MockedFunction<(sale: unknown) => Promise<unknown>>,
    update: jest.fn() as jest.MockedFunction<(id: string, updates: unknown) => Promise<unknown | null>>,
    delete: jest.fn() as jest.MockedFunction<(id: string) => Promise<boolean>>,
  },
  vehicleDB: {
    findById: jest.fn() as jest.MockedFunction<(id: string) => Promise<unknown | null>>,
    update: jest.fn() as jest.MockedFunction<(id: string, updates: unknown) => Promise<unknown | null>>,
  },
}));
jest.mock('@/lib/invoice-utils', () => ({
  generateInvoiceNumber: jest.fn(() => 'INV-20241116-0001'),
  calculateTax: jest.fn((price: number) => Math.round(price * 0.16 * 100) / 100),
  calculateTotal: jest.fn((price: number, tax: number) => Math.round((price + tax) * 100) / 100),
}));

const { auth } = require('@/lib/auth');

describe('API /api/sales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/sales', () => {
    it('should return sales list with authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const mockSales = [
        {
          id: 'sale-1',
          invoiceNumber: 'INV-20241116-0001',
          vehicleId: 'vehicle-1',
          userId: 'user-1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '1234567890',
          salePrice: 35000,
          taxAmount: 5600,
          totalAmount: 40600,
          paymentMethod: 'cash',
          status: 'completed',
          saleDate: new Date(),
        },
      ];

      (saleDB.getAll as jest.Mock).mockResolvedValue(mockSales);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].customerName).toBe('John Doe');
    });

    it('should reject access without authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('No autorizado');
    });
  });

  describe('POST /api/sales', () => {
    it('should create sale as admin with invoice number and tax calculation', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const mockVehicle = {
        id: 'vehicle-1',
        brand: 'Toyota',
        model: 'Camry',
        status: 'available',
      };

      const mockSale = {
        id: 'sale-new',
        invoiceNumber: 'INV-20241116-0001',
        vehicleId: 'vehicle-1',
        userId: 'admin-123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        taxAmount: 5600,
        totalAmount: 40600,
        paymentMethod: 'cash',
        status: 'completed',
        saleDate: new Date(),
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(mockVehicle);
      (saleDB.create as jest.Mock).mockResolvedValue(mockSale);
      (vehicleDB.update as jest.Mock).mockResolvedValue({ ...mockVehicle, status: 'sold' });

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        paymentMethod: 'cash',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.customerName).toBe('John Doe');
      expect(data.invoiceNumber).toBeDefined();
      expect(data.taxAmount).toBe(5600); // 16% de 35000
      expect(data.totalAmount).toBe(40600); // 35000 + 5600
      expect(data.status).toBe('completed');
      expect(vehicleDB.update).toHaveBeenCalledWith('vehicle-1', { status: 'sold' });
    });

    it('should create sale as emprendedor', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      const mockVehicle = {
        id: 'vehicle-1',
        status: 'available',
      };

      const mockSale = {
        id: 'sale-new',
        invoiceNumber: 'INV-20241116-0002',
        vehicleId: 'vehicle-1',
        userId: 'emprendedor-123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '0987654321',
        salePrice: 28000,
        taxAmount: 4480,
        totalAmount: 32480,
        paymentMethod: 'credit',
        status: 'completed',
        saleDate: new Date(),
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(mockVehicle);
      (saleDB.create as jest.Mock).mockResolvedValue(mockSale);
      (vehicleDB.update as jest.Mock).mockResolvedValue({ ...mockVehicle, status: 'sold' });

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '0987654321',
        salePrice: 28000,
        paymentMethod: 'credit',
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it('should reject sale creation as usuario regular', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        paymentMethod: 'cash',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('No autorizado');
    });

    it('should reject sale if vehicle not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());
      (vehicleDB.findById as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('POST', {
        vehicleId: 'non-existent',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        paymentMethod: 'cash',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('no encontrado');
    });

    it('should reject sale if vehicle not available', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const mockVehicle = {
        id: 'vehicle-1',
        status: 'sold', // Already sold
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(mockVehicle);

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        paymentMethod: 'cash',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('no está disponible');
    });
  });

  describe('PUT /api/sales/[id]', () => {
    it('should update sale as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const existingSale = {
        id: 'sale-123',
        invoiceNumber: 'INV-20241116-0001',
        vehicleId: 'vehicle-1',
        userId: 'user-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        taxAmount: 5600,
        totalAmount: 40600,
        paymentMethod: 'cash',
        status: 'completed',
        saleDate: new Date(),
      };

      const updatedSale = {
        ...existingSale,
        salePrice: 38000,
        taxAmount: 6080,
        totalAmount: 44080,
        paymentMethod: 'credit',
        status: 'pending',
      };

      (saleDB.findById as jest.Mock).mockResolvedValue(existingSale);
      (saleDB.update as jest.Mock).mockResolvedValue(updatedSale);

      const request = createMockRequest('PUT', {
        salePrice: 38000,
        taxAmount: 6080,
        totalAmount: 44080,
        paymentMethod: 'credit',
        status: 'pending',
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'sale-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.salePrice).toBe(38000);
      expect(data.taxAmount).toBe(6080);
      expect(data.totalAmount).toBe(44080);
      expect(data.status).toBe('pending');
    });

    it('should recalculate totalAmount when salePrice or taxAmount is updated', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const existingSale = {
        id: 'sale-123',
        invoiceNumber: 'INV-20241116-0001',
        vehicleId: 'vehicle-1',
        userId: 'user-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        taxAmount: 5600,
        totalAmount: 40600,
        paymentMethod: 'cash',
        status: 'completed',
        saleDate: new Date(),
      };

      const updatedSale = {
        ...existingSale,
        salePrice: 40000,
        taxAmount: 6400,
        totalAmount: 46400, // Recalculado automáticamente
      };

      (saleDB.findById as jest.Mock).mockResolvedValue(existingSale);
      (saleDB.update as jest.Mock).mockResolvedValue(updatedSale);

      const request = createMockRequest('PUT', {
        salePrice: 40000,
        // taxAmount se recalcula automáticamente en la API
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'sale-123' }),
      });

      expect(response.status).toBe(200);
      // Verificar que se llamó con totalAmount recalculado
      expect(saleDB.update).toHaveBeenCalledWith(
        'sale-123',
        expect.objectContaining({
          salePrice: 40000,
          totalAmount: expect.any(Number),
        })
      );
    });

    it('should reject update as emprendedor', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      const request = createMockRequest('PUT', { salePrice: 38000 });
      const response = await PUT(request, {
        params: Promise.resolve({ id: 'sale-123' }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/sales/[id]', () => {
    it('should delete sale as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const existingSale = {
        id: 'sale-123',
        invoiceNumber: 'INV-20241116-0001',
        vehicleId: 'vehicle-1',
        userId: 'user-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        taxAmount: 5600,
        totalAmount: 40600,
        paymentMethod: 'cash',
        status: 'completed',
        saleDate: new Date(),
      };

      (saleDB.findById as jest.Mock).mockResolvedValue(existingSale);
      (saleDB.delete as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'sale-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('eliminada');
    });

    it('should reject deletion as emprendedor', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'sale-123' }),
      });

      expect(response.status).toBe(403);
    });
  });
});

