// API Route para búsqueda avanzada de vehículos

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { vehicleDB } from '@/lib/db';
import { Vehicle } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Obtener todos los vehículos
    let vehicles = await vehicleDB.getAll();

    // Aplicar búsqueda por texto
    if (query) {
      const searchLower = query.toLowerCase();
      vehicles = vehicles.filter(vehicle =>
        vehicle.brand.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.vin.toLowerCase().includes(searchLower) ||
        vehicle.year.toString().includes(searchLower) ||
        (vehicle.description && vehicle.description.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar filtros
    if (status) {
      vehicles = vehicles.filter(v => v.status === status);
    }
    if (fuelType) {
      vehicles = vehicles.filter(v => v.fuelType === fuelType);
    }
    if (transmission) {
      vehicles = vehicles.filter(v => v.transmission === transmission);
    }
    if (minPrice) {
      vehicles = vehicles.filter(v => v.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      vehicles = vehicles.filter(v => v.price <= parseFloat(maxPrice));
    }
    if (minYear) {
      vehicles = vehicles.filter(v => v.year >= parseInt(minYear));
    }
    if (maxYear) {
      vehicles = vehicles.filter(v => v.year <= parseInt(maxYear));
    }

    // Ordenar
    vehicles.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof Vehicle] as string | number;
      let bValue: string | number = b[sortBy as keyof Vehicle] as string | number;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // Paginación
    const total = vehicles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVehicles = vehicles.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedVehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error en búsqueda de vehículos:', error);
    return NextResponse.json(
      { error: 'Error al buscar vehículos' },
      { status: 500 }
    );
  }
}

