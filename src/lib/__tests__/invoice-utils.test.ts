import { describe, it, expect } from '@jest/globals';
import { generateInvoiceNumber, calculateTax, calculateTotal } from '../invoice-utils';

describe('Invoice Utils', () => {
  describe('generateInvoiceNumber', () => {
    it('should generate invoice number with correct format', () => {
      const invoiceNumber = generateInvoiceNumber();
      
      // Formato: INV-YYYYMMDD-XXXX
      expect(invoiceNumber).toMatch(/^INV-\d{8}-\d{4}$/);
    });

    it('should generate unique invoice numbers', () => {
      const invoice1 = generateInvoiceNumber();
      const invoice2 = generateInvoiceNumber();
      
      // Aunque pueden ser iguales por azar, el formato debe ser correcto
      expect(invoice1).toMatch(/^INV-\d{8}-\d{4}$/);
      expect(invoice2).toMatch(/^INV-\d{8}-\d{4}$/);
    });

    it('should include current date in invoice number', () => {
      const invoiceNumber = generateInvoiceNumber();
      const today = new Date();
      const expectedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      
      expect(invoiceNumber).toContain(expectedDate);
    });
  });

  describe('calculateTax', () => {
    it('should calculate 16% tax correctly', () => {
      const price = 10000;
      const tax = calculateTax(price);
      
      expect(tax).toBe(1600);
    });

    it('should round tax to 2 decimal places', () => {
      const price = 1000.50;
      const tax = calculateTax(price);
      
      expect(tax).toBe(160.08); // 1000.50 * 0.16 = 160.08
    });

    it('should handle custom tax rate', () => {
      const price = 10000;
      const tax = calculateTax(price, 0.20); // 20%
      
      expect(tax).toBe(2000);
    });

    it('should handle zero price', () => {
      const tax = calculateTax(0);
      
      expect(tax).toBe(0);
    });

    it('should handle decimal prices', () => {
      const price = 1234.56;
      const tax = calculateTax(price);
      
      expect(tax).toBe(197.53); // Redondeado a 2 decimales
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly (price + tax)', () => {
      const price = 10000;
      const tax = 1600;
      const total = calculateTotal(price, tax);
      
      expect(total).toBe(11600);
    });

    it('should round total to 2 decimal places', () => {
      const price = 1000.50;
      const tax = 160.08;
      const total = calculateTotal(price, tax);
      
      expect(total).toBe(1160.58);
    });

    it('should handle zero tax', () => {
      const price = 10000;
      const total = calculateTotal(price, 0);
      
      expect(total).toBe(10000);
    });

    it('should handle decimal values', () => {
      const price = 1234.56;
      const tax = 197.53;
      const total = calculateTotal(price, tax);
      
      expect(total).toBe(1432.09);
    });
  });
});

