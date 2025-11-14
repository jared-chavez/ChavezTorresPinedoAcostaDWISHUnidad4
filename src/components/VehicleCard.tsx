'use client';

import { Vehicle } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    available: 'Disponible',
    sold: 'Vendido',
    reserved: 'Reservado',
    maintenance: 'Mantenimiento',
  };

  // Obtener la primera imagen disponible
  const firstImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null;

  return (
    <Link href={`/inventory/${vehicle.id}`}>
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:-translate-y-1">
        {/* Imagen del vehículo o placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
          {firstImage ? (
            // Usar img normal para imágenes BLOB desde API routes
            firstImage.startsWith('/api/') ? (
              <img
                src={firstImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Si la imagen falla al cargar, mostrar placeholder
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : (
              <Image
                src={firstImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={firstImage.startsWith('http')}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center image-placeholder">
              <svg className="w-24 h-24 text-blue-200 dark:text-gray-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${statusColors[vehicle.status]}`}>
              {statusLabels[vehicle.status]}
            </span>
          </div>
        </div>
        
        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.year} • {vehicle.color}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="capitalize">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="capitalize">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{vehicle.mileage.toLocaleString()} km</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ${vehicle.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Ver detalles →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

