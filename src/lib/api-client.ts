// Cliente API para comunicación entre Frontend y Backend
// Centraliza todas las llamadas a la API

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Vehicle, Sale, User } from '@/types';
import { VehicleInput, UpdateVehicleInput, SaleInput, UpdateSaleInput, RegisterInput, UpdateUserInput } from './validations';

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Clase del cliente API
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Redirigir a login si no está autenticado
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ========== AUTENTICACIÓN ==========
  async signIn(email: string, password: string) {
    const response = await this.client.post('/auth/signin', { email, password });
    return response.data;
  }

  async signOut() {
    const response = await this.client.post('/auth/signout');
    return response.data;
  }

  async getSession() {
    const response = await this.client.get('/auth/session');
    return response.data;
  }

  // ========== USUARIOS ==========
  async getUsers(): Promise<User[]> {
    const response = await this.client.get('/users');
    return response.data;
  }

  async createUser(userData: RegisterInput): Promise<User> {
    const response = await this.client.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserInput): Promise<User> {
    const response = await this.client.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  // ========== VEHÍCULOS ==========
  async getVehicles(status?: string): Promise<Vehicle[]> {
    const params = status ? { status } : {};
    const response = await this.client.get('/vehicles', { params });
    return response.data;
  }

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await this.client.get(`/vehicles/${id}`);
    return response.data;
  }

  async createVehicle(vehicleData: VehicleInput): Promise<Vehicle> {
    const response = await this.client.post('/vehicles', vehicleData);
    return response.data;
  }

  async updateVehicle(id: string, vehicleData: UpdateVehicleInput): Promise<Vehicle> {
    const response = await this.client.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.client.delete(`/vehicles/${id}`);
  }

  // ========== VENTAS ==========
  async getSales(): Promise<Sale[]> {
    const response = await this.client.get('/sales');
    return response.data;
  }

  async getSale(id: string): Promise<Sale> {
    const response = await this.client.get(`/sales/${id}`);
    return response.data;
  }

  async createSale(saleData: SaleInput): Promise<Sale> {
    const response = await this.client.post('/sales', saleData);
    return response.data;
  }

  async updateSale(id: string, saleData: UpdateSaleInput): Promise<Sale> {
    const response = await this.client.put(`/sales/${id}`, saleData);
    return response.data;
  }

  async deleteSale(id: string): Promise<void> {
    await this.client.delete(`/sales/${id}`);
  }

  // ========== WEB SERVICES DE TERCEROS ==========
  async getVehicleInfo(vin: string) {
    const response = await this.client.get('/external/vehicle-info', {
      params: { vin },
    });
    return response.data;
  }

  async getMarketPricing(brand: string, model: string, year: number) {
    const response = await this.client.get('/external/pricing', {
      params: { brand, model, year },
    });
    return response.data;
  }

  // ========== ESTADÍSTICAS Y MÉTRICAS ==========
  async getDashboardStats() {
    const response = await this.client.get('/stats/dashboard');
    return response.data;
  }

  async getSalesStats(startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await this.client.get('/stats/sales', { params });
    return response.data;
  }

  async getInventoryStats() {
    const response = await this.client.get('/stats/inventory');
    return response.data;
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();

// Funciones helper para manejo de errores
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.error || axiosError.message || 'Error desconocido';
  }
  return error instanceof Error ? error.message : 'Error desconocido';
}

