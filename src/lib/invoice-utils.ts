// Utilidades para generar números de factura

/**
 * Genera un número de factura único con formato: INV-YYYYMMDD-XXXX
 * Ejemplo: INV-20241115-0001
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Generar un número secuencial aleatorio de 4 dígitos
  // En producción, esto debería ser un contador secuencial desde la BD
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `INV-${datePrefix}-${sequence}`;
}

/**
 * Calcula el monto de impuestos (IVA) basado en el precio
 * @param price Precio base
 * @param taxRate Tasa de impuesto (por defecto 0.16 = 16%)
 * @returns Monto de impuestos
 */
export function calculateTax(price: number, taxRate: number = 0.16): number {
  return Math.round(price * taxRate * 100) / 100; // Redondear a 2 decimales
}

/**
 * Calcula el total (precio + impuestos)
 * @param price Precio base
 * @param taxAmount Monto de impuestos
 * @returns Total
 */
export function calculateTotal(price: number, taxAmount: number): number {
  return Math.round((price + taxAmount) * 100) / 100; // Redondear a 2 decimales
}

