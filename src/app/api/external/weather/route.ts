// API Route para Web Service de terceros - Clima
// Útil para agencias que quieren mostrar clima en el dashboard
// Integración con OpenWeatherMap API (gratuita)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Mexico City';
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Si no hay API key, retornar datos simulados
    if (!apiKey) {
      return NextResponse.json({
        city,
        temperature: 22,
        description: 'Parcialmente nublado',
        humidity: 65,
        windSpeed: 10,
        source: 'Simulated (API key no configurada)',
        note: 'Configura OPENWEATHER_API_KEY en .env.local para datos reales',
      });
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`,
        { timeout: 5000 }
      );

      return NextResponse.json({
        city: response.data.name,
        temperature: Math.round(response.data.main.temp),
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        icon: response.data.weather[0].icon,
        source: 'OpenWeatherMap API',
      });
    } catch (apiError: unknown) {
      console.error('Error al consultar OpenWeatherMap:', apiError);
      return NextResponse.json(
        { error: 'Error al obtener información del clima' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en weather API:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del clima' },
      { status: 500 }
    );
  }
}

