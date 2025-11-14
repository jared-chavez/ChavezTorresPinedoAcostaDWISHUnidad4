// API Route para operaciones específicas de un vehículo

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { vehicleDB } from '@/lib/db';
import { updateVehicleSchema } from '@/lib/validations';

// GET - Obtener un vehículo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Permitir acceso público al detalle (solo lectura)
    // No requerir autenticación para GET
    
    const { id } = await params;
    const vehicle = await vehicleDB.findById(id);
    
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículo' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un vehículo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Solo admin y emprendedores pueden actualizar
    if (session.user.role !== 'admin' && session.user.role !== 'emprendedores') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Validar con Zod
    const validated = updateVehicleSchema.parse(body);
    
    const vehicle = await vehicleDB.update(id, validated);
    
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(vehicle);
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Error al actualizar vehículo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar vehículo' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un vehículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Solo admin puede eliminar
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const { id } = await params;
    const deleted = await vehicleDB.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar vehículo' },
      { status: 500 }
    );
  }
}

