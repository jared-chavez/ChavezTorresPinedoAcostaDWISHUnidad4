'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ResponsiveTable from '@/components/ResponsiveTable';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';
import Image from 'next/image';
import SaleStatusBadge from '@/components/SaleStatusBadge';

interface Purchase {
  id: string;
  invoiceNumber: string;
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  salePrice: number;
  taxAmount: number;
  totalAmount: number;
  saleDate: string;
  paymentMethod: string;
  status: 'completed' | 'cancelled' | 'pending' | 'refunded';
  notes?: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    vin: string;
    images: string[];
  };
}

export default function MyPurchasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Solo usuarios regulares pueden ver sus compras
    // Admin y emprendedores tienen su propia página de ventas
    if (session.user.role !== 'usuarios_regulares') {
      router.push('/sales');
      return;
    }

    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales/my-purchases');
      if (!response.ok) throw new Error('Error al cargar compras');
      const data = await response.json();
      setPurchases(data);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error al cargar tus compras';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      credit: 'Tarjeta',
      financing: 'Financiamiento',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">Cargando tus compras...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 logo-title">
              Mis Compras
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Historial de vehículos que has adquirido
            </p>
          </div>

          {purchases.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No tienes compras registradas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Cuando adquieras un vehículo, aparecerá aquí tu historial de compras.
              </p>
              <Link
                href="/inventory"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver Catálogo de Vehículos
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Imagen del vehículo */}
                      <div className="flex-shrink-0">
                        {purchase.vehicle.images && purchase.vehicle.images.length > 0 ? (
                          <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                            <Image
                              src={purchase.vehicle.images[0]}
                              alt={`${purchase.vehicle.brand} ${purchase.vehicle.model}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full md:w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Información de la compra */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {purchase.vehicle.brand} {purchase.vehicle.model} {purchase.vehicle.year}
                              </h3>
                              <SaleStatusBadge status={purchase.status || 'completed'} />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              VIN: {purchase.vehicle.vin}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              Factura: {purchase.invoiceNumber || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(purchase.totalAmount || purchase.salePrice)}
                            </p>
                            {purchase.taxAmount > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                IVA: {formatCurrency(purchase.taxAmount)}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {formatDate(purchase.saleDate)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Método de Pago</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {getPaymentMethodLabel(purchase.paymentMethod)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Color</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {purchase.vehicle.color}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Compra</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(purchase.saleDate).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(purchase.salePrice)}
                            </p>
                          </div>
                        </div>

                        {purchase.notes && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notas:</p>
                            <p className="text-sm text-gray-900 dark:text-white">{purchase.notes}</p>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/inventory/${purchase.vehicleId}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Ver Detalles del Vehículo
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

