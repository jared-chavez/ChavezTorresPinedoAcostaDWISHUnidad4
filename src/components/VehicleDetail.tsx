'use client';

import { Vehicle } from '@/types';
import { Session } from 'next-auth';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import ConfirmDialog from './ConfirmDialog';

interface VehicleDetailProps {
  vehicle: Vehicle;
  session: Session | null;
}

export default function VehicleDetail({ vehicle, session }: VehicleDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [saleForm, setSaleForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    salePrice: vehicle.price,
    paymentMethod: 'cash' as const,
    notes: '',
  });

  const canEdit = session && (session.user.role === 'admin' || session.user.role === 'emprendedores');
  const canSell = canEdit && vehicle.status === 'available';

  const handleGetPricing = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `/api/external/pricing?brand=${vehicle.brand}&model=${vehicle.model}&year=${vehicle.year}`
      );
      setPricingInfo(response.data);
      setShowPricing(true);
    } catch (err: any) {
      setError('Error al obtener precios: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/sales', {
        vehicleId: vehicle.id,
        ...saleForm,
      });

      if (response.status === 201) {
        showToast('Venta registrada exitosamente', 'success');
        router.push('/sales');
        router.refresh();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al registrar venta';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/vehicles/${vehicle.id}`);
      showToast('Vehículo eliminado exitosamente', 'success');
      router.push('/inventory');
      router.refresh();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar vehículo';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const canDelete = session && session.user.role === 'admin';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">{vehicle.year}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[vehicle.status]}`}>
              {statusLabels[vehicle.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ${vehicle.price.toLocaleString()}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Color:</span>
                  <span className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                    <span 
                      className="inline-block w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" 
                      style={{ backgroundColor: vehicle.color }}
                      title={vehicle.color}
                    />
                    {vehicle.color}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Combustible:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{vehicle.fuelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transmisión:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{vehicle.transmission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kilometraje:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">VIN:</span>
                  <span className="text-gray-900 dark:text-white font-medium font-mono">{vehicle.vin}</span>
                </div>
              </div>
            </div>

            <div>
              {vehicle.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
                  <p className="text-gray-700 dark:text-gray-300">{vehicle.description}</p>
                </div>
              )}

              {/* Botón de compra para clientes */}
              {session && session.user.role === 'usuarios_regulares' && vehicle.status === 'available' && (
                <div className="mb-4">
                  <button
                    onClick={() => router.push(`/checkout/${vehicle.id}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Comprar Ahora
                  </button>
                </div>
              )}

              {canSell && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowSaleForm(!showSaleForm)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Registrar Venta
                  </button>
                  
                  <button
                    onClick={handleGetPricing}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Consultando...' : 'Consultar Precios de Mercado (Web Service)'}
                  </button>
                </div>
              )}

              {canDelete && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Eliminar Vehículo
                  </button>
                </div>
              )}

              {showPricing && pricingInfo && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Precios de Mercado ({pricingInfo.source})
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Bajo:</span>
                      <span className="font-medium">${pricingInfo.marketPrice.low.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Promedio:</span>
                      <span className="font-medium">${pricingInfo.marketPrice.average.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alto:</span>
                      <span className="font-medium">${pricingInfo.marketPrice.high.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showSaleForm && canSell && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Registrar Venta
              </h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      value={saleForm.customerName}
                      onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email del Cliente *
                    </label>
                    <input
                      type="email"
                      value={saleForm.customerEmail}
                      onChange={(e) => setSaleForm({ ...saleForm, customerEmail: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono del Cliente *
                    </label>
                    <input
                      type="tel"
                      value={saleForm.customerPhone}
                      onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio de Venta *
                    </label>
                    <input
                      type="number"
                      value={saleForm.salePrice}
                      onChange={(e) => setSaleForm({ ...saleForm, salePrice: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Método de Pago *
                    </label>
                    <select
                      value={saleForm.paymentMethod}
                      onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value as any })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="credit">Tarjeta de Crédito</option>
                      <option value="financing">Financiamiento</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={saleForm.notes}
                    onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Registrando...' : 'Registrar Venta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSaleForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de que deseas eliminar el vehículo ${vehicle.brand} ${vehicle.model}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

