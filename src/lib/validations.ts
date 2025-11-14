// Validaciones con Zod para seguridad

import { z } from 'zod';

// Validación de usuario
export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  role: z.enum(['admin', 'emprendedores', 'usuarios_regulares']).optional().default('usuarios_regulares'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Validación de vehículo
export const vehicleSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'El color es requerido'),
  price: z.number().positive('El precio debe ser positivo'),
  mileage: z.number().nonnegative('El kilometraje no puede ser negativo'),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']),
  transmission: z.enum(['manual', 'automatic']),
  status: z.enum(['available', 'sold', 'reserved', 'maintenance']),
  vin: z.string().length(17, 'El VIN debe tener 17 caracteres'),
  description: z.string().optional(),
  images: z.array(z.string()).optional(), // Acepta URLs o base64 strings
});

export const updateVehicleSchema = vehicleSchema.partial();

// Validación de venta
export const saleSchema = z.object({
  vehicleId: z.string().min(1, 'El ID del vehículo es requerido'),
  customerName: z.string().min(2, 'El nombre del cliente es requerido'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().optional(), // Opcional, informativo
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  taxAmount: z.number().nonnegative('El monto de impuestos no puede ser negativo').optional(), // Se calcula automáticamente si no se proporciona
  totalAmount: z.number().positive('El total debe ser positivo').optional(), // Se calcula automáticamente si no se proporciona
  paymentMethod: z.enum(['cash', 'credit', 'financing']),
  status: z.enum(['completed', 'cancelled', 'pending', 'refunded']).optional().default('completed'),
  notes: z.string().optional(),
});

export const updateSaleSchema = saleSchema.partial().omit({ vehicleId: true });

// Validación de actualización de usuario
export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .optional(),
  role: z.enum(['admin', 'emprendedores', 'usuarios_regulares']).optional(),
  status: z.enum(['pending_verification', 'active', 'suspended']).optional(),
});

// Tipos inferidos de los schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

