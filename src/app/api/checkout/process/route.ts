// API Route para procesar el pago simulado y crear la venta

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saleDB, vehicleDB } from '@/lib/db';
import { saleSchema } from '@/lib/validations';
import { generateInvoiceNumber, calculateTax, calculateTotal } from '@/lib/invoice-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo usuarios regulares pueden comprar
    if (session.user.role !== 'usuarios_regulares') {
      return NextResponse.json(
        { error: 'Solo los clientes pueden realizar compras' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar con Zod
    const validated = saleSchema.parse({
      ...body,
      customerEmail: session.user.email, // Usar el email de la sesión
      customerName: session.user.name,   // Usar el nombre de la sesión
      customerPhone: body.customerPhone || '', // Campo informativo, puede estar vacío
    });

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
        { error: 'El vehículo no está disponible para compra' },
        { status: 400 }
      );
    }

    // Simular procesamiento del pago (aquí iría la integración real con PayPal)
    // Por ahora, solo validamos y creamos la venta
    
    // Calcular impuestos y total
    const taxAmount = validated.taxAmount ?? calculateTax(validated.salePrice);
    const totalAmount = validated.totalAmount ?? calculateTotal(validated.salePrice, taxAmount);
    
    // Generar número de factura único
    const invoiceNumber = generateInvoiceNumber();
    
    // Crear la venta
    // Nota: userId se refiere al vendedor, pero en este caso el cliente se auto-compra
    // Usamos el ID del cliente como userId para mantener la relación
    const sale = await saleDB.create({
      invoiceNumber,
      vehicleId: validated.vehicleId,
      userId: session.user.id, // ID del cliente que realiza la compra
      customerName: validated.customerName,
      customerEmail: validated.customerEmail,
      customerPhone: validated.customerPhone || 'N/A', // Campo informativo (opcional)
      salePrice: validated.salePrice,
      taxAmount,
      totalAmount,
      paymentMethod: validated.paymentMethod,
      status: validated.status || 'completed',
      notes: validated.notes || `Compra realizada mediante checkout simulado`,
    });

    // Actualizar estado del vehículo a "sold"
    await vehicleDB.update(validated.vehicleId, { status: 'sold' });

    return NextResponse.json({
      success: true,
      sale,
      message: 'Compra realizada exitosamente',
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Error al procesar checkout:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}

