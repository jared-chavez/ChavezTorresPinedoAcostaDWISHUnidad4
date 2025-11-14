// API Route para gestión de ventas

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saleDB, vehicleDB } from '@/lib/db';
import { saleSchema } from '@/lib/validations';
import { generateInvoiceNumber, calculateTax, calculateTotal } from '@/lib/invoice-utils';

// GET - Obtener todas las ventas
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const sales = await saleDB.getAll();
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva venta
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Solo admin y emprendedores pueden crear ventas
    if (session.user.role !== 'admin' && session.user.role !== 'emprendedores') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validar con Zod
    const validated = saleSchema.parse(body);
    
    // Verificar que el vehículo existe y está disponible
    const vehicle = await vehicleDB.findById(validated.vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }
    
    if (vehicle.status !== 'available') {
      return NextResponse.json(
        { error: 'El vehículo no está disponible para venta' },
        { status: 400 }
      );
    }
    
    // Calcular impuestos y total
    const taxAmount = validated.taxAmount ?? calculateTax(validated.salePrice);
    const totalAmount = validated.totalAmount ?? calculateTotal(validated.salePrice, taxAmount);
    
    // Generar número de factura único
    const invoiceNumber = generateInvoiceNumber();
    
    // Crear venta
    const sale = await saleDB.create({
      invoiceNumber,
      vehicleId: validated.vehicleId,
      userId: session.user.id,
      customerName: validated.customerName,
      customerEmail: validated.customerEmail,
      customerPhone: validated.customerPhone || 'N/A', // Campo informativo (opcional)
      salePrice: validated.salePrice,
      taxAmount,
      totalAmount,
      paymentMethod: validated.paymentMethod,
      status: validated.status || 'completed',
      notes: validated.notes,
      // saleDate se establece automáticamente por Prisma (default: now())
    });
    
    // Actualizar estado del vehículo a "sold"
    await vehicleDB.update(validated.vehicleId, { status: 'sold' });
    
    return NextResponse.json(sale, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Error al crear venta:', error);
    return NextResponse.json(
      { error: 'Error al crear venta' },
      { status: 500 }
    );
  }
}

