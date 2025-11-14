// API Route para estadísticas personales del cliente

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Obtener compras del cliente
    const purchases = await prisma.sale.findMany({
      where: {
        customerEmail: userEmail,
      },
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
            year: true,
            color: true,
            images: true,
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    // Calcular métricas personales
    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.salePrice, 0);
    const averagePurchasePrice = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    // Compras del último mes
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentPurchases = purchases.filter(
      purchase => new Date(purchase.saleDate) >= oneMonthAgo
    );
    const recentSpent = recentPurchases.reduce((sum, purchase) => sum + purchase.salePrice, 0);

    // Compras por método de pago
    const purchasesByPaymentMethod = purchases.reduce((acc, purchase) => {
      acc[purchase.paymentMethod] = (acc[purchase.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Compras por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyPurchases = purchases
      .filter(purchase => new Date(purchase.saleDate) >= sixMonthsAgo)
      .reduce((acc, purchase) => {
        const date = new Date(purchase.saleDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { count: 0, spent: 0 };
        }
        acc[monthKey].count += 1;
        acc[monthKey].spent += purchase.salePrice;
        return acc;
      }, {} as Record<string, { count: number; spent: number }>);

    // Vehículos por marca comprados
    const vehiclesByBrand = purchases.reduce((acc, purchase) => {
      const brand = purchase.vehicle.brand;
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Últimas 3 compras
    const lastPurchases = purchases.slice(0, 3).map(purchase => ({
      id: purchase.id,
      vehicle: purchase.vehicle,
      salePrice: purchase.salePrice,
      saleDate: purchase.saleDate,
      paymentMethod: purchase.paymentMethod,
    }));

    return NextResponse.json({
      overview: {
        totalPurchases,
        totalSpent,
        averagePurchasePrice: Math.round(averagePurchasePrice * 100) / 100,
        recentPurchases: recentPurchases.length,
        recentSpent,
      },
      purchases: {
        byPaymentMethod: purchasesByPaymentMethod,
        monthly: monthlyPurchases,
        lastPurchases,
      },
      vehicles: {
        byBrand: vehiclesByBrand,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas personales:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas personales' },
      { status: 500 }
    );
  }
}

