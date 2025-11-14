// Base de datos PostgreSQL con Prisma
// Reemplaza la base de datos en memoria

import { User, Vehicle, Sale } from '@/types';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { generateInvoiceNumber, calculateTax, calculateTotal } from './invoice-utils';

// Inicializar con un usuario admin por defecto si no existe
export async function initializeDB() {
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@agencia.com' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: 'admin@agencia.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'admin',
      },
    });
  }
}

// Funciones para usuarios
export const userDB = {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role as 'admin' | 'emprendedores' | 'usuarios_regulares',
      createdAt: user.createdAt,
    } : null;
  },
  
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role as 'admin' | 'emprendedores' | 'usuarios_regulares',
      createdAt: user.createdAt,
    } : null;
  },
  
  async create(user: Omit<User, 'id' | 'createdAt'> & {
    status?: string;
    emailVerified?: boolean;
    registeredIp?: string;
  }): Promise<User> {
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        ...(user.status && { status: user.status }),
        ...(user.emailVerified !== undefined && { emailVerified: user.emailVerified }),
        ...(user.registeredIp && { registeredIp: user.registeredIp }),
      } as any,
    });
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role as 'admin' | 'emprendedores' | 'usuarios_regulares',
      createdAt: newUser.createdAt,
    };
  },
  
  async update(id: string, updates: Partial<{
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'emprendedores' | 'usuarios_regulares';
    status?: string;
    emailVerified?: boolean;
    verifiedIp?: string;
    verifiedAt?: Date;
  }>): Promise<User | null> {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.password) updateData.password = updates.password;
      if (updates.role) updateData.role = updates.role;
      if (updates.status) updateData.status = updates.status;
      if (updates.emailVerified !== undefined) updateData.emailVerified = updates.emailVerified;
      if (updates.verifiedIp) updateData.verifiedIp = updates.verifiedIp;
      if (updates.verifiedAt) updateData.verifiedAt = updates.verifiedAt;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        password: updatedUser.password,
        role: updatedUser.role as 'admin' | 'emprendedores' | 'usuarios_regulares',
        createdAt: updatedUser.createdAt,
      };
    } catch (error) {
      return null;
    }
  },
  
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
  
  async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role as 'admin' | 'emprendedores' | 'usuarios_regulares',
      createdAt: user.createdAt,
    }));
  },
};

// Funciones para vehículos
export const vehicleDB = {
  async getAll(): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        blobImages: {
          orderBy: { order: 'asc' },
        },
      } as any,
    });
    return vehicles.map((v: any) => {
      // Generar URLs para imágenes BLOB
      const blobImageUrls = ((v as any).blobImages || []).map((img: any) => `/api/vehicles/${v.id}/image/${img.id}`);
      return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        price: v.price,
        mileage: v.mileage,
        fuelType: v.fuelType as Vehicle['fuelType'],
        transmission: v.transmission as Vehicle['transmission'],
        status: v.status as Vehicle['status'],
        vin: v.vin,
        description: v.description || undefined,
        images: [...(v.images || []), ...blobImageUrls], // Combinar URLs legacy con BLOB
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        createdBy: v.createdBy,
      };
    });
  },
  
  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        blobImages: {
          orderBy: { order: 'asc' },
        },
      } as any,
    });
    if (!vehicle) return null;
    
    // Generar URLs para imágenes BLOB
    const blobImageUrls = ((vehicle as any).blobImages || []).map((img: any) => `/api/vehicles/${id}/image/${img.id}`);
    
    return {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      price: vehicle.price,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType as Vehicle['fuelType'],
      transmission: vehicle.transmission as Vehicle['transmission'],
      status: vehicle.status as Vehicle['status'],
      vin: vehicle.vin,
      description: vehicle.description || undefined,
      images: [...(vehicle.images || []), ...blobImageUrls], // Combinar URLs legacy con BLOB
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      createdBy: vehicle.createdBy,
    };
  },
  
  async create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>, imageFiles?: File[]): Promise<Vehicle> {
    // Convertir archivos a Buffer para almacenar como BLOB
    const imageDataPromises = (imageFiles || []).map(async (file, index) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        imageData: buffer,
        mimeType: file.type,
        order: index,
      };
    });
    
    const imageDataArray = await Promise.all(imageDataPromises);
    
    const newVehicle = await prisma.vehicle.create({
      data: {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        price: vehicle.price,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        status: vehicle.status,
        vin: vehicle.vin,
        description: vehicle.description,
        images: vehicle.images || [],
        createdBy: vehicle.createdBy,
        ...(imageDataArray.length > 0 && {
          blobImages: {
            create: imageDataArray,
          },
        }),
      } as any,
      include: {
        blobImages: {
          orderBy: { order: 'asc' },
        },
      } as any,
    });
    
    // Generar URLs para las imágenes BLOB
    const imageUrls = ((newVehicle as any).blobImages || []).map((img: any) => `/api/vehicles/${newVehicle.id}/image/${img.id}`);
    
    return {
      id: newVehicle.id,
      brand: newVehicle.brand,
      model: newVehicle.model,
      year: newVehicle.year,
      color: newVehicle.color,
      price: newVehicle.price,
      mileage: newVehicle.mileage,
      fuelType: newVehicle.fuelType as Vehicle['fuelType'],
      transmission: newVehicle.transmission as Vehicle['transmission'],
      status: newVehicle.status as Vehicle['status'],
      vin: newVehicle.vin,
      description: newVehicle.description || undefined,
      images: [...(newVehicle.images || []), ...imageUrls], // Combinar URLs legacy con nuevas
      createdAt: newVehicle.createdAt,
      updatedAt: newVehicle.updatedAt,
      createdBy: newVehicle.createdBy,
    };
  },
  
  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data: {
          ...(updates.brand && { brand: updates.brand }),
          ...(updates.model && { model: updates.model }),
          ...(updates.year && { year: updates.year }),
          ...(updates.color && { color: updates.color }),
          ...(updates.price !== undefined && { price: updates.price }),
          ...(updates.mileage !== undefined && { mileage: updates.mileage }),
          ...(updates.fuelType && { fuelType: updates.fuelType }),
          ...(updates.transmission && { transmission: updates.transmission }),
          ...(updates.status && { status: updates.status }),
          ...(updates.vin && { vin: updates.vin }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.images && { images: updates.images }),
        },
        include: {
          blobImages: {
            orderBy: { order: 'asc' },
          },
        } as any,
      });
      
      // Generar URLs para imágenes BLOB
      const blobImageUrls = ((updatedVehicle as any).blobImages || []).map((img: any) => `/api/vehicles/${id}/image/${img.id}`);
      
      return {
        id: updatedVehicle.id,
        brand: updatedVehicle.brand,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        color: updatedVehicle.color,
        price: updatedVehicle.price,
        mileage: updatedVehicle.mileage,
        fuelType: updatedVehicle.fuelType as Vehicle['fuelType'],
        transmission: updatedVehicle.transmission as Vehicle['transmission'],
        status: updatedVehicle.status as Vehicle['status'],
        vin: updatedVehicle.vin,
        description: updatedVehicle.description || undefined,
        images: [...(updatedVehicle.images || []), ...blobImageUrls], // Combinar URLs legacy con BLOB
        createdAt: updatedVehicle.createdAt,
        updatedAt: updatedVehicle.updatedAt,
        createdBy: updatedVehicle.createdBy,
      };
    } catch (error) {
      return null;
    }
  },
  
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.vehicle.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
  
  async findByStatus(status: Vehicle['status']): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        blobImages: {
          orderBy: { order: 'asc' },
        },
      } as any,
    });
    return vehicles.map((v: any) => {
      // Generar URLs para imágenes BLOB
      const blobImageUrls = ((v as any).blobImages || []).map((img: any) => `/api/vehicles/${v.id}/image/${img.id}`);
      return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        price: v.price,
        mileage: v.mileage,
        fuelType: v.fuelType as Vehicle['fuelType'],
        transmission: v.transmission as Vehicle['transmission'],
        status: v.status as Vehicle['status'],
        vin: v.vin,
        description: v.description || undefined,
        images: [...(v.images || []), ...blobImageUrls], // Combinar URLs legacy con BLOB
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        createdBy: v.createdBy,
      };
    });
  },
};

// Funciones para ventas
export const saleDB = {
  async getAll(): Promise<Sale[]> {
    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
    });
    return sales.map((s: any) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      vehicleId: s.vehicleId,
      userId: s.userId,
      customerName: s.customerName,
      customerEmail: s.customerEmail,
      customerPhone: s.customerPhone,
      salePrice: s.salePrice,
      taxAmount: s.taxAmount || 0,
      totalAmount: s.totalAmount || s.salePrice + (s.taxAmount || 0),
      saleDate: s.saleDate,
      paymentMethod: s.paymentMethod as Sale['paymentMethod'],
      status: (s.status || 'completed') as Sale['status'],
      notes: s.notes || undefined,
    }));
  },
  
  async findById(id: string): Promise<Sale | null> {
    const sale = await prisma.sale.findUnique({
      where: { id },
    });
    if (!sale) return null;
    return {
      id: sale.id,
      invoiceNumber: (sale as any).invoiceNumber || '',
      vehicleId: sale.vehicleId,
      userId: sale.userId,
      customerName: sale.customerName,
      customerEmail: sale.customerEmail,
      customerPhone: sale.customerPhone,
      salePrice: sale.salePrice,
      taxAmount: (sale as any).taxAmount || 0,
      totalAmount: (sale as any).totalAmount || sale.salePrice + ((sale as any).taxAmount || 0),
      saleDate: sale.saleDate,
      paymentMethod: sale.paymentMethod as Sale['paymentMethod'],
      status: ((sale as any).status || 'completed') as Sale['status'],
      notes: sale.notes || undefined,
    };
  },
  
  async create(sale: Omit<Sale, 'id' | 'saleDate'> & { saleDate?: Date }): Promise<Sale> {
      const newSale = await prisma.sale.create({
      data: {
        invoiceNumber: sale.invoiceNumber,
        vehicleId: sale.vehicleId,
        userId: sale.userId,
        customerName: sale.customerName,
        customerEmail: sale.customerEmail,
        customerPhone: sale.customerPhone,
        salePrice: sale.salePrice,
        taxAmount: sale.taxAmount || 0,
        totalAmount: sale.totalAmount || sale.salePrice + (sale.taxAmount || 0),
        paymentMethod: sale.paymentMethod,
        status: sale.status || 'completed',
        notes: sale.notes,
        saleDate: sale.saleDate || new Date(), // Usar fecha proporcionada o fecha actual
      } as any,
    });
    return {
      id: newSale.id,
      invoiceNumber: (newSale as any).invoiceNumber || '',
      vehicleId: newSale.vehicleId,
      userId: newSale.userId,
      customerName: newSale.customerName,
      customerEmail: newSale.customerEmail,
      customerPhone: newSale.customerPhone,
      salePrice: newSale.salePrice,
      taxAmount: (newSale as any).taxAmount || 0,
      totalAmount: (newSale as any).totalAmount || newSale.salePrice + ((newSale as any).taxAmount || 0),
      saleDate: newSale.saleDate,
      paymentMethod: newSale.paymentMethod as Sale['paymentMethod'],
      status: ((newSale as any).status || 'completed') as Sale['status'],
      notes: newSale.notes || undefined,
    };
  },
  
  async getByVehicleId(vehicleId: string): Promise<Sale[]> {
    const sales = await prisma.sale.findMany({
      where: { vehicleId },
      orderBy: { saleDate: 'desc' },
    });
    return sales.map((s: any) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      vehicleId: s.vehicleId,
      userId: s.userId,
      customerName: s.customerName,
      customerEmail: s.customerEmail,
      customerPhone: s.customerPhone,
      salePrice: s.salePrice,
      taxAmount: s.taxAmount || 0,
      totalAmount: s.totalAmount || s.salePrice + (s.taxAmount || 0),
      saleDate: s.saleDate,
      paymentMethod: s.paymentMethod as Sale['paymentMethod'],
      status: (s.status || 'completed') as Sale['status'],
      notes: s.notes || undefined,
    }));
  },
  
  async update(id: string, updates: Partial<Sale>): Promise<Sale | null> {
    try {
      const updatedSale = await prisma.sale.update({
        where: { id },
        data: {
          ...(updates.customerName && { customerName: updates.customerName }),
          ...(updates.customerEmail && { customerEmail: updates.customerEmail }),
          ...(updates.customerPhone && { customerPhone: updates.customerPhone }),
          ...(updates.salePrice !== undefined && { salePrice: updates.salePrice }),
          ...(updates.taxAmount !== undefined && { taxAmount: updates.taxAmount }),
          ...(updates.totalAmount !== undefined && { totalAmount: updates.totalAmount }),
          ...(updates.paymentMethod && { paymentMethod: updates.paymentMethod }),
          ...(updates.status && { status: updates.status }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
        },
      });
      return {
        id: updatedSale.id,
        invoiceNumber: (updatedSale as any).invoiceNumber || '',
        vehicleId: updatedSale.vehicleId,
        userId: updatedSale.userId,
        customerName: updatedSale.customerName,
        customerEmail: updatedSale.customerEmail,
        customerPhone: updatedSale.customerPhone,
        salePrice: updatedSale.salePrice,
        taxAmount: (updatedSale as any).taxAmount || 0,
        totalAmount: (updatedSale as any).totalAmount || updatedSale.salePrice + ((updatedSale as any).taxAmount || 0),
        saleDate: updatedSale.saleDate,
        paymentMethod: updatedSale.paymentMethod as Sale['paymentMethod'],
        status: ((updatedSale as any).status || 'completed') as Sale['status'],
        notes: updatedSale.notes || undefined,
      };
    } catch (error) {
      return null;
    }
  },
  
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.sale.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};
