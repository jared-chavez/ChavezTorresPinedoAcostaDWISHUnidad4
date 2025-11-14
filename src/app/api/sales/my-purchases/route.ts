// API Route para obtener las compras del cliente actual
// Solo retorna ventas donde el customerEmail coincide con el email del usuario logueado

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Para usuarios regulares, solo mostrar sus propias compras
    // Para admin/emprendedores, pueden ver todas (pero esta ruta es específica para clientes)
    const userEmail = session.user.email;

    const sales = await prisma.sale.findMany({
      where: {
        customerEmail: userEmail,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            color: true,
            vin: true,
            images: true,
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error al obtener compras del cliente:', error);
    return NextResponse.json(
      { error: 'Error al obtener tus compras' },
      { status: 500 }
    );
  }
}

