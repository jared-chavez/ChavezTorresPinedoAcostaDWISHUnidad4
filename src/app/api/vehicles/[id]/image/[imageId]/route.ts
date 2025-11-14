import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener imagen BLOB por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await params;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const vehicleImage = await (prisma as any).vehicleImage.findUnique({
      where: { id: imageId },
      select: {
        imageData: true,
        mimeType: true,
      },
    });

    if (!vehicleImage) {
      return new NextResponse('Imagen no encontrada', { status: 404 });
    }

    // Convertir Buffer a ArrayBuffer para la respuesta
    const buffer = Buffer.from(vehicleImage.imageData);
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': vehicleImage.mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    return new NextResponse('Error al obtener imagen', { status: 500 });
  }
}

