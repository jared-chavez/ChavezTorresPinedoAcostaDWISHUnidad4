'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import LandingNavbar from '@/components/LandingNavbar';
import VehicleCard from '@/components/VehicleCard';
import SearchAndFilters, { FilterOptions } from '@/components/SearchAndFilters';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { useToast } from '@/components/ToastProvider';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 12;

  useEffect(() => {
    if (status === 'loading') return;
    // Permitir acceso público - no redirigir
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    applyFiltersAndSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, searchQuery, filters, sortBy, sortOrder]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      // Usar fetch directamente para permitir acceso público
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Error al cargar vehículos');
      const data = await response.json();
      setVehicles(data);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error al cargar vehículos';
      if (session) {
        showToast(errorMsg, 'error');
      }
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...vehicles];

    // Aplicar búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.vin.toLowerCase().includes(query) ||
        vehicle.year.toString().includes(query) ||
        (vehicle.description && vehicle.description.toLowerCase().includes(query))
      );
    }

    // Aplicar filtros
    if (filters.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    if (filters.fuelType) {
      filtered = filtered.filter(v => v.fuelType === filters.fuelType);
    }
    if (filters.transmission) {
      filtered = filtered.filter(v => v.transmission === filters.transmission);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(v => v.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(v => v.price <= filters.maxPrice!);
    }
    if (filters.minYear) {
      filtered = filtered.filter(v => v.year >= filters.minYear!);
    }
    if (filters.maxYear) {
      filtered = filtered.filter(v => v.year <= filters.maxYear!);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number | undefined = a[sortBy as keyof Vehicle] as string | number | undefined;
      let bValue: string | number | undefined = b[sortBy as keyof Vehicle] as string | number | undefined;
      
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // Paginación
    const total = filtered.length;
    const pages = Math.ceil(total / itemsPerPage);
    setTotalPages(pages);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredVehicles(filtered.slice(startIndex, endIndex));

    // Resetear a página 1 si la página actual no existe
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600 dark:text-gray-400">Cargando inventario...</div>
        </div>
      </>
    );
  }

  // Permitir acceso público al inventario (solo lectura)
  // No redirigir si no hay sesión

  const canCreate = session && (session.user.role === 'admin' || session.user.role === 'emprendedores');

  return (
    <>
      {session ? <Navbar /> : <LandingNavbar />}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 logo-title">
                Inventario de Vehículos
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {filteredVehicles.length} de {vehicles.length} vehículos
              </p>
            </div>
            {canCreate && (
              <Link
                href="/inventory/new"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Vehículo
              </Link>
            )}
          </div>

          <SearchAndFilters
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
          />

          {filteredVehicles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'No se encontraron vehículos con los filtros aplicados'
                  : 'No hay vehículos en el inventario'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
