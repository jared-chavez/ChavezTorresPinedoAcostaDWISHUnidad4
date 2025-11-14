import { describe, it, expect } from '@jest/globals';
import { registerSchema, vehicleSchema, saleSchema } from '../validations';

describe('Validations', () => {
  describe('registerSchema', () => {
    it('should validate a correct user registration', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123',
        role: 'usuarios_regulares',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'invalid-email',
        password: 'Password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'weak',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'PASSWORD123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('vehicleSchema', () => {
    it('should validate a correct vehicle', () => {
      const validData = {
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: 'Blanco',
        price: 35000,
        mileage: 0,
        fuelType: 'gasoline',
        transmission: 'automatic',
        status: 'available',
        vin: '1HGBH41JXMN109186',
        description: 'Sedán confiable',
      };

      const result = vehicleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid VIN length', () => {
      const invalidData = {
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: 'Blanco',
        price: 35000,
        mileage: 0,
        fuelType: 'gasoline',
        transmission: 'automatic',
        status: 'available',
        vin: 'SHORT',
      };

      const result = vehicleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidData = {
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: 'Blanco',
        price: -1000,
        mileage: 0,
        fuelType: 'gasoline',
        transmission: 'automatic',
        status: 'available',
        vin: '1HGBH41JXMN109186',
      };

      const result = vehicleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('saleSchema', () => {
    it('should validate a correct sale', () => {
      const validData = {
        vehicleId: 'vehicle-123',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        paymentMethod: 'cash',
        notes: 'Venta exitosa',
      };

      const result = saleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate sale with optional fields (taxAmount, totalAmount, status)', () => {
      const validData = {
        vehicleId: 'vehicle-123',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        customerPhone: '1234567890',
        salePrice: 35000,
        taxAmount: 5600,
        totalAmount: 40600,
        paymentMethod: 'cash',
        status: 'completed',
        notes: 'Venta exitosa',
      };

      const result = saleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate sale without customerPhone (optional)', () => {
      const validData = {
        vehicleId: 'vehicle-123',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        salePrice: 35000,
        paymentMethod: 'cash',
      };

      const result = saleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        vehicleId: 'vehicle-123',
        customerName: 'Juan Pérez',
        customerEmail: 'invalid-email',
        customerPhone: '1234567890',
        salePrice: 35000,
        paymentMethod: 'cash',
      };

      const result = saleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative sale price', () => {
      const invalidData = {
        vehicleId: 'vehicle-123',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        customerPhone: '1234567890',
        salePrice: -1000,
        paymentMethod: 'cash',
      };

      const result = saleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative taxAmount', () => {
      const invalidData = {
        vehicleId: 'vehicle-123',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        salePrice: 35000,
        taxAmount: -100,
        paymentMethod: 'cash',
      };

      const result = saleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        vehicleId: 'vehicle-123',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        salePrice: 35000,
        paymentMethod: 'cash',
        status: 'invalid_status',
      };

      const result = saleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid status values', () => {
      const statuses = ['completed', 'cancelled', 'pending', 'refunded'];
      
      statuses.forEach(status => {
        const validData = {
          vehicleId: 'vehicle-123',
          customerName: 'Juan Pérez',
          customerEmail: 'juan@example.com',
          salePrice: 35000,
          paymentMethod: 'cash',
          status,
        };

        const result = saleSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });
});

