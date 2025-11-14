/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST } from '../checkout/process/route';
import { createMockRequest, mockAuth } from '@/__tests__/helpers/test-helpers';
import { saleDB, vehicleDB } from '@/lib/db';

// Mock de dependencias
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@/lib/db', () => ({
  saleDB: {
    create: jest.fn(),
  },
  vehicleDB: {
    findById: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('@/lib/invoice-utils', () => ({
  generateInvoiceNumber: jest.fn(() => 'INV-20241116-0001'),
  calculateTax: jest.fn((price: number) => Math.round(price * 0.16 * 100) / 100),
  calculateTotal: jest.fn((price: number, tax: number) => Math.round((price + tax) * 100) / 100),
}));

const { auth } = require('@/lib/auth');

describe('API /api/checkout/process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/checkout/process', () => {
    it('should process checkout and create sale with invoice number', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const mockVehicle = {
        id: 'vehicle-1',
        brand: 'Toyota',
        model: 'Camry',
        price: 35000,
        status: 'available',
      };

      const mockSale = {
        id: 'sale-new',
        invoiceNumber: 'INV-20241116-0001',
        vehicleId: 'vehicle-1',
        userId: 'user-123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: 'No proporcionado',
        salePrice: 35000,
        taxAmount: 5600,
        totalAmount: 40600,
        paymentMethod: 'credit',
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
        customerPhone: '',
        salePrice: 35000,
        taxAmount: 5600,
        totalAmount: 40600,
        paymentMethod: 'credit',
        status: 'completed',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.sale.invoiceNumber).toBe('INV-20241116-0001');
      expect(data.sale.taxAmount).toBe(5600);
      expect(data.sale.totalAmount).toBe(40600);
      expect(data.sale.status).toBe('completed');
      expect(vehicleDB.update).toHaveBeenCalledWith('vehicle-1', { status: 'sold' });
    });

    it('should calculate tax and total automatically if not provided', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const mockVehicle = {
        id: 'vehicle-1',
        price: 10000,
        status: 'available',
      };

      const mockSale = {
        id: 'sale-new',
        invoiceNumber: 'INV-20241116-0001',
        vehicleId: 'vehicle-1',
        userId: 'user-123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: 'No proporcionado',
        salePrice: 10000,
        taxAmount: 1600,
        totalAmount: 11600,
        paymentMethod: 'cash',
        status: 'completed',
        saleDate: new Date(),
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(mockVehicle);
      (saleDB.create as jest.Mock).mockResolvedValue(mockSale);

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        salePrice: 10000,
        paymentMethod: 'cash',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.sale.taxAmount).toBe(1600); // 16% de 10000
      expect(data.sale.totalAmount).toBe(11600); // 10000 + 1600
    });

    it('should reject checkout for non-client users', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        salePrice: 35000,
        paymentMethod: 'credit',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Solo los clientes');
    });

    it('should reject checkout if vehicle not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());
      (vehicleDB.findById as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('POST', {
        vehicleId: 'non-existent',
        salePrice: 35000,
        paymentMethod: 'credit',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('no encontrado');
    });

    it('should reject checkout if vehicle not available', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const mockVehicle = {
        id: 'vehicle-1',
        status: 'sold',
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(mockVehicle);

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        salePrice: 35000,
        paymentMethod: 'credit',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('no está disponible');
    });

    it('should use provided taxAmount and totalAmount if given', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.usuarioRegular());

      const mockVehicle = {
        id: 'vehicle-1',
        price: 20000,
        status: 'available',
      };

      const mockSale = {
        id: 'sale-new',
        invoiceNumber: 'INV-20241116-0001',
        vehicleId: 'vehicle-1',
        userId: 'user-123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: 'No proporcionado',
        salePrice: 20000,
        taxAmount: 3000, // Custom tax
        totalAmount: 23000, // Custom total
        paymentMethod: 'credit',
        status: 'completed',
        saleDate: new Date(),
      };

      (vehicleDB.findById as jest.Mock).mockResolvedValue(mockVehicle);
      (saleDB.create as jest.Mock).mockResolvedValue(mockSale);

      const request = createMockRequest('POST', {
        vehicleId: 'vehicle-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        salePrice: 20000,
        taxAmount: 3000,
        totalAmount: 23000,
        paymentMethod: 'credit',
        status: 'completed',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.sale.taxAmount).toBe(3000);
      expect(data.sale.totalAmount).toBe(23000);
    });
  });
});

