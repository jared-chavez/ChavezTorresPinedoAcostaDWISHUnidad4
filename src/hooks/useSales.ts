// Hook personalizado para gestión de ventas usando el cliente API

import { useState, useEffect } from 'react';
import { Sale } from '@/types';
import { apiClient, handleApiError } from '@/lib/api-client';
import { SaleInput } from '@/lib/validations';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSales();
      setSales(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: SaleInput) => {
    try {
      const newSale = await apiClient.createSale(saleData);
      setSales(prev => [newSale, ...prev]);
      return newSale;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  return {
    sales,
    loading,
    error,
    loadSales,
    createSale,
  };
}

