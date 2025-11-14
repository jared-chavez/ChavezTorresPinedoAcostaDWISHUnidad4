import { useState, useEffect } from 'react';

interface PersonalStats {
  overview: {
    totalPurchases: number;
    totalSpent: number;
    averagePurchasePrice: number;
    recentPurchases: number;
    recentSpent: number;
  };
  purchases: {
    byPaymentMethod: Record<string, number>;
    monthly: Record<string, { count: number; spent: number }>;
    lastPurchases: Array<{
      id: string;
      vehicle: {
        brand: string;
        model: string;
        year: number;
        color: string;
        images: string[];
      };
      salePrice: number;
      saleDate: Date;
      paymentMethod: string;
    }>;
  };
  vehicles: {
    byBrand: Record<string, number>;
  };
}

export function usePersonalStats() {
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/stats/personal');
        if (!response.ok) {
          throw new Error('Error al cargar estadísticas personales');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}

