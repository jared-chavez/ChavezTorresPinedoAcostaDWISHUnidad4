'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PayPalCheckout from '@/components/PayPalCheckout';
import { Vehicle } from '@/types';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const vehicleId = params?.vehicleId as string;
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push(`/login?callbackUrl=/checkout/${vehicleId}`);
      return;
    }

    // Solo usuarios regulares pueden comprar
    if (session.user.role !== 'usuarios_regulares') {
      showToast('Solo los clientes pueden realizar compras', 'error');
      router.push('/inventory');
      return;
    }

    loadVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error('Vehículo no encontrado');
      }
      const data = await response.json();
      
      // Verificar que el vehículo esté disponible
      if (data.status !== 'available') {
        showToast('Este vehículo no está disponible para compra', 'error');
        router.push(`/inventory/${vehicleId}`);
        return;
      }
      
      setVehicle(data);
    } catch (error) {
      showToast('Error al cargar el vehículo', 'error');
      router.push('/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: {
    paymentMethod: 'credit' | 'paypal';
    cardNumber?: string;
    notes?: string;
  }) => {
    if (!vehicle || !session) return;

    try {
      setProcessing(true);
      
      // Procesar el pago simulado
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          customerName: session.user.name,
          customerEmail: session.user.email,
          customerPhone: '', // Campo informativo
          salePrice: vehicle.price,
          taxAmount: tax, // IVA calculado (16%)
          totalAmount: total, // Total con impuestos
          paymentMethod: paymentData.paymentMethod === 'paypal' ? 'credit' : paymentData.paymentMethod,
          status: 'completed', // Estado por defecto
          notes: paymentData.notes || `Compra realizada mediante ${paymentData.paymentMethod === 'paypal' ? 'PayPal' : 'Tarjeta de crédito'}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al procesar el pago');
      }

      const result = await response.json();
      showToast('¡Compra realizada exitosamente!', 'success');
      router.push(`/my-purchases`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al procesar el pago';
      showToast(errorMsg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
        </div>
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Vehículo no encontrado</div>
        </div>
      </>
    );
  }

  // Calcular impuestos (16% IVA)
  const subtotal = vehicle.price;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/inventory')}
            className="mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Inventario
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumen del Pedido */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 logo-title">
                Resumen del Pedido
              </h2>

              {/* Imagen del vehículo */}
              <div className="mb-6">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={vehicle.images[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Color: {vehicle.color}</p>
                    <p>Combustible: {vehicle.fuelType}</p>
                    <p>Transmisión: {vehicle.transmission}</p>
                    <p>Kilometraje: {vehicle.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              {/* Desglose de precios */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>IVA (16%)</span>
                  <span className="font-medium">${tax.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total a Pagar</span>
                  <span className="text-green-600 dark:text-green-400">${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Se generará un número de factura único al completar la compra
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de Pago */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <PayPalCheckout
                amount={total}
                vehicleId={vehicleId}
                onPaymentSuccess={handlePaymentSuccess}
                processing={processing}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

