// API Route para Web Service de terceros - Información de vehículos
// Integración con API externa para obtener información adicional de vehículos

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

// Esta es una API de ejemplo. En producción, usarías una API real como:
// - NHTSA API (National Highway Traffic Safety Administration)
// - VIN Decoder API
// - Car API de terceros

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');
    
    if (!vin) {
      return NextResponse.json(
        { error: 'VIN es requerido' },
        { status: 400 }
      );
    }
    
    // Ejemplo de integración con API de terceros
    // Usando una API pública de decodificación de VIN
    try {
      // API de ejemplo: vPIC API de NHTSA (gratuita)
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
        {
          timeout: 5000,
        }
      );
      
      if (response.data && response.data.Results) {
        // Procesar y formatear los datos
        const vehicleInfo: Record<string, string> = {};
        response.data.Results.forEach((result: { Variable: string; Value: string | null }) => {
          if (result.Value && result.Value !== 'Not Applicable') {
            vehicleInfo[result.Variable] = result.Value;
          }
        });
        
        return NextResponse.json({
          vin,
          info: vehicleInfo,
          source: 'NHTSA API',
        });
      }
      
      return NextResponse.json(
        { error: 'No se encontró información para este VIN' },
        { status: 404 }
      );
    } catch (apiError: unknown) {
      console.error('Error al consultar API externa:', apiError);
      
      // Fallback: retornar información simulada si la API falla
      return NextResponse.json({
        vin,
        info: {
          'Make': 'Información no disponible',
          'Model': 'Información no disponible',
          'Model Year': 'Información no disponible',
          'Body Class': 'Información no disponible',
        },
        source: 'Fallback (API no disponible)',
        note: 'La API externa no está disponible. Esta es información simulada.',
      });
    }
  } catch (error) {
    console.error('Error en vehicle-info API:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del vehículo' },
      { status: 500 }
    );
  }
}

