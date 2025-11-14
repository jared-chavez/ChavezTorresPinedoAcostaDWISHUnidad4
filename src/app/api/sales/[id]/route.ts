// API Route para gestión de ventas individuales (PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saleDB, vehicleDB } from '@/lib/db';
import { updateSaleSchema } from '@/lib/validations';

// GET - Obtener una venta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const { id } = await params;
    const sale = await saleDB.findById(id);
    
    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    return NextResponse.json(
      { error: 'Error al obtener venta' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una venta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Solo admin puede editar ventas
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado. Solo administradores pueden editar ventas.' }, { status: 403 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Validar con Zod
    const validated = updateSaleSchema.parse(body);
    
    // Verificar que la venta existe
    const existingSale = await saleDB.findById(id);
    if (!existingSale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      );
    }
    
    // Si se actualiza salePrice o taxAmount, recalcular totalAmount
    const updates: Partial<{
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      salePrice?: number;
      taxAmount?: number;
      totalAmount?: number;
      paymentMethod?: 'cash' | 'credit' | 'financing';
      status?: 'completed' | 'cancelled' | 'pending' | 'refunded';
      notes?: string;
    }> = { ...validated };
    if (validated.salePrice !== undefined || validated.taxAmount !== undefined) {
      const salePrice = validated.salePrice ?? existingSale.salePrice;
      const taxAmount = validated.taxAmount ?? existingSale.taxAmount;
      updates.totalAmount = Math.round((salePrice + taxAmount) * 100) / 100;
    }
    
    // Actualizar venta
    const updatedSale = await saleDB.update(id, updates);
    
    if (!updatedSale) {
      return NextResponse.json(
        { error: 'Error al actualizar la venta' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedSale);
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Error al actualizar venta:', error);
    return NextResponse.json(
      { error: 'Error al actualizar venta' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una venta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Solo admin puede eliminar ventas
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado. Solo administradores pueden eliminar ventas.' }, { status: 403 });
    }
    
    const { id } = await params;
    
    // Verificar que la venta existe
    const sale = await saleDB.findById(id);
    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar venta
    const deleted = await saleDB.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar la venta' },
        { status: 500 }
      );
    }
    
    // Si la venta se eliminó, cambiar el estado del vehículo de vuelta a "available"
    // Solo si no hay otras ventas para ese vehículo
    const vehicleSales = await saleDB.getByVehicleId(sale.vehicleId);
    if (vehicleSales.length === 0) {
      await vehicleDB.update(sale.vehicleId, { status: 'available' });
    }
    
    return NextResponse.json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar venta' },
      { status: 500 }
    );
  }
}

