'use client';

import { useState } from 'react';

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export interface FilterOptions {
  status?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
}

export default function SearchAndFilters({ onSearch, onFilter, onSort }: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSortChange = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilter({});
    onSearch('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Buscar por marca, modelo, año o VIN..."
            className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Botón para mostrar/ocultar filtros */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          <svg
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Ordenamiento */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="createdAt">Fecha</option>
            <option value="price">Precio</option>
            <option value="year">Año</option>
            <option value="brand">Marca</option>
            <option value="mileage">Kilometraje</option>
          </select>
          <button
            onClick={() => handleSortChange(sortBy)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {/* Filtro por Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="available">Disponible</option>
              <option value="sold">Vendido</option>
              <option value="reserved">Reservado</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          {/* Filtro por Combustible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Combustible
            </label>
            <select
              value={filters.fuelType || ''}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="gasoline">Gasolina</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Eléctrico</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          {/* Filtro por Transmisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transmisión
            </label>
            <select
              value={filters.transmission || ''}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="automatic">Automática</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Filtro por Rango de Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de Precio
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                placeholder="Máx"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Filtro por Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Año
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Desde"
                value={filters.minYear || ''}
                onChange={(e) => handleFilterChange('minYear', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                placeholder="Hasta"
                value={filters.maxYear || ''}
                onChange={(e) => handleFilterChange('maxYear', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

