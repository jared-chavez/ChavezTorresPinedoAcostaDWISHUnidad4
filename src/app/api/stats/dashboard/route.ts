// API Route para estadísticas del dashboard

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { vehicleDB, saleDB, userDB } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todos los datos
    const [vehicles, sales, users] = await Promise.all([
      vehicleDB.getAll(),
      saleDB.getAll(),
      userDB.getAll(),
    ]);

    // Calcular métricas básicas
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
    const reservedVehicles = vehicles.filter(v => v.status === 'reserved').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

    // Métricas de ventas
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
    const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Ventas por método de pago
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ventas del último mes
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentSales = sales.filter(sale => new Date(sale.saleDate) >= oneMonthAgo);
    const recentRevenue = recentSales.reduce((sum, sale) => sum + sale.salePrice, 0);

    // Ventas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlySales = sales
      .filter(sale => new Date(sale.saleDate) >= sixMonthsAgo)
      .reduce((acc, sale) => {
        const date = new Date(sale.saleDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { count: 0, revenue: 0 };
        }
        acc[monthKey].count += 1;
        acc[monthKey].revenue += sale.salePrice;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

    // Vehículos por marca
    const vehiclesByBrand = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.brand] = (acc[vehicle.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Vehículos por tipo de combustible
    const vehiclesByFuelType = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.fuelType] = (acc[vehicle.fuelType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Usuarios activos
    const totalUsers = users.length;
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tasa de conversión (vehículos vendidos / total disponibles)
    const conversionRate = totalVehicles > 0 
      ? (soldVehicles / totalVehicles) * 100 
      : 0;

    // Valor promedio del inventario
    const averageInventoryValue = totalVehicles > 0
      ? vehicles.reduce((sum, v) => sum + v.price, 0) / totalVehicles
      : 0;

    return NextResponse.json({
      overview: {
        totalVehicles,
        availableVehicles,
        soldVehicles,
        reservedVehicles,
        maintenanceVehicles,
        totalSales,
        totalRevenue,
        averageSalePrice,
        recentSales: recentSales.length,
        recentRevenue,
        totalUsers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageInventoryValue: Math.round(averageInventoryValue * 100) / 100,
      },
      sales: {
        byPaymentMethod: salesByPaymentMethod,
        monthly: monthlySales,
      },
      vehicles: {
        byBrand: vehiclesByBrand,
        byFuelType: vehiclesByFuelType,
      },
      users: {
        byRole: usersByRole,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}

