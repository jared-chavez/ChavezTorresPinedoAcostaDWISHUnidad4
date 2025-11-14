// Hook personalizado para gestión de vehículos usando el cliente API

import { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { apiClient, handleApiError } from '@/lib/api-client';

export function useVehicles(status?: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, [status]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getVehicles(status);
      setVehicles(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async (vehicleData: any) => {
    try {
      const newVehicle = await apiClient.createVehicle(vehicleData);
      setVehicles(prev => [newVehicle, ...prev]);
      return newVehicle;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const updateVehicle = async (id: string, vehicleData: any) => {
    try {
      const updatedVehicle = await apiClient.updateVehicle(id, vehicleData);
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await apiClient.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  return {
    vehicles,
    loading,
    error,
    loadVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVehicle();
    }
  }, [id]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getVehicle(id);
      setVehicle(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    vehicle,
    loading,
    error,
    loadVehicle,
  };
}

