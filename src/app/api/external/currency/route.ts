// API Route para Web Service de terceros - Conversión de Moneda
// Útil para agencias que manejan múltiples monedas
// Integración con ExchangeRate API (gratuita)

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
    const from = searchParams.get('from') || 'USD';
    const to = searchParams.get('to') || 'MXN';
    const amount = parseFloat(searchParams.get('amount') || '1');

    // API gratuita de conversión de moneda
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${from}`,
        { timeout: 5000 }
      );

      const rate = response.data.rates[to];
      if (!rate) {
        return NextResponse.json(
          { error: 'Moneda de destino no válida' },
          { status: 400 }
        );
      }

      const converted = amount * rate;

      return NextResponse.json({
        from,
        to,
        amount,
        rate,
        converted: Math.round(converted * 100) / 100,
        source: 'ExchangeRate API',
        date: response.data.date,
      });
    } catch (apiError: unknown) {
      console.error('Error al consultar ExchangeRate API:', apiError);
      
      // Fallback con tasa aproximada
      const fallbackRates: Record<string, number> = {
        MXN: 17.5,
        EUR: 0.92,
        GBP: 0.79,
      };

      const rate = fallbackRates[to] || 1;
      return NextResponse.json({
        from,
        to,
        amount,
        rate,
        converted: Math.round(amount * rate * 100) / 100,
        source: 'Fallback (API no disponible)',
        note: 'Esta es una tasa aproximada. Configure API real para datos precisos.',
      });
    }
  } catch (error) {
    console.error('Error en currency API:', error);
    return NextResponse.json(
      { error: 'Error al convertir moneda' },
      { status: 500 }
    );
  }
}

