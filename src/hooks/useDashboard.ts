// Hook personalizado para estadísticas del dashboard

import { useState, useEffect } from 'react';
import { apiClient, handleApiError } from '@/lib/api-client';

export interface DashboardStats {
  overview: {
    totalVehicles: number;
    availableVehicles: number;
    soldVehicles: number;
    reservedVehicles: number;
    maintenanceVehicles: number;
    totalSales: number;
    totalRevenue: number;
    averageSalePrice: number;
    recentSales: number;
    recentRevenue: number;
    totalUsers: number;
    conversionRate: number;
    averageInventoryValue: number;
  };
  sales: {
    byPaymentMethod: Record<string, number>;
    monthly: Record<string, { count: number; revenue: number }>;
  };
  vehicles: {
    byBrand: Record<string, number>;
    byFuelType: Record<string, number>;
  };
  users: {
    byRole: Record<string, number>;
  };
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}

