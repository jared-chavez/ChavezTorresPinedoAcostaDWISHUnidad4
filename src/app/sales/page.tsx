'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ResponsiveTable from '@/components/ResponsiveTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import ExcelImportButton from '@/components/ExcelImportButton';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ToastProvider';
import { Sale } from '@/types';
import { UpdateSaleInput } from '@/lib/validations';
import SaleStatusBadge from '@/components/SaleStatusBadge';

interface SaleWithVehicle extends Sale {
  vehicle: string;
}

export default function SalesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [sales, setSales] = useState<SaleWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [editingSale, setEditingSale] = useState<SaleWithVehicle | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateSaleInput>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    salePrice: 0,
    paymentMethod: 'cash',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'admin' && session.user.role !== 'emprendedores') {
      router.push('/dashboard');
      return;
    }

    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const fetchSales = async () => {
    try {
      const [salesData, vehiclesData] = await Promise.all([
        apiClient.getSales(),
        apiClient.getVehicles(),
      ]);

      const salesWithVehicles: SaleWithVehicle[] = salesData.map((sale) => {
        const vehicle = vehiclesData.find((v) => v.id === sale.vehicleId);
        return {
          ...sale,
          vehicle: vehicle
            ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
            : 'Vehículo no encontrado',
        };
      });

      setSales(salesWithVehicles);
      // Usar totalAmount si está disponible, sino salePrice
      setTotalRevenue(salesWithVehicles.reduce((sum, sale) => sum + (sale.totalAmount || sale.salePrice), 0));
    } catch (error) {
      console.error('Error fetching sales:', error);
      showToast('Error al cargar ventas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale: SaleWithVehicle) => {
    setEditingSale(sale);
    setEditFormData({
      customerName: sale.customerName,
      customerEmail: sale.customerEmail,
      customerPhone: sale.customerPhone,
      salePrice: sale.salePrice,
      taxAmount: sale.taxAmount,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSale) return;

    setSaving(true);
    try {
      const updatedSale = await apiClient.updateSale(editingSale.id, editFormData);
      
      // Actualizar la lista de ventas
      setSales(prev => prev.map(sale => 
        sale.id === editingSale.id 
          ? { ...updatedSale, vehicle: editingSale.vehicle }
          : sale
      ));
      
      // Recalcular total
      const updatedSales = sales.map(sale => 
        sale.id === editingSale.id ? { ...updatedSale, vehicle: editingSale.vehicle } : sale
      );
      setTotalRevenue(updatedSales.reduce((sum, sale) => sum + (sale.totalAmount || sale.salePrice), 0));
      
      setShowEditModal(false);
      setEditingSale(null);
      showToast('Venta actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error updating sale:', error);
      showToast('Error al actualizar la venta', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (saleId: string) => {
    setSaleToDelete(saleId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!saleToDelete) return;

    try {
      await apiClient.deleteSale(saleToDelete);
      
      // Actualizar la lista de ventas
      const updatedSales = sales.filter(sale => sale.id !== saleToDelete);
      setSales(updatedSales);
      setTotalRevenue(updatedSales.reduce((sum, sale) => sum + (sale.totalAmount || sale.salePrice), 0));
      
      setShowDeleteConfirm(false);
      setSaleToDelete(null);
      showToast('Venta eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting sale:', error);
      showToast('Error al eliminar la venta', 'error');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </>
    );
  }

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'emprendedores')) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 logo-title">
                  Ventas
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Total de ingresos: <span className="font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
                </p>
              </div>
              <ExcelImportButton onImportComplete={fetchSales} />
            </div>
          </div>

          <ResponsiveTable
            data={sales}
            columns={[
              {
                key: 'invoiceNumber',
                label: 'Factura',
                mobileLabel: 'N° Factura',
                render: (sale) => (
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {sale.invoiceNumber || 'N/A'}
                  </span>
                ),
              },
              {
                key: 'saleDate',
                label: 'Fecha',
                mobileLabel: 'Fecha',
                render: (sale) => (
                  <span>{new Date(sale.saleDate).toLocaleDateString()}</span>
                ),
              },
              {
                key: 'vehicle',
                label: 'Vehículo',
                mobileLabel: 'Vehículo',
              },
              {
                key: 'customerName',
                label: 'Cliente',
                mobileLabel: 'Cliente',
                render: (sale) => (
                  <div>
                    <div className="font-medium">{sale.customerName}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {sale.customerEmail}
                    </div>
                  </div>
                ),
              },
              {
                key: 'totalAmount',
                label: 'Total',
                mobileLabel: 'Total',
                render: (sale) => (
                  <div className="text-right">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      ${(sale.totalAmount || sale.salePrice).toLocaleString()}
                    </div>
                    {sale.taxAmount > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        IVA: ${sale.taxAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Estado',
                mobileLabel: 'Estado',
                render: (sale) => (
                  <SaleStatusBadge status={sale.status || 'completed'} />
                ),
              },
              {
                key: 'paymentMethod',
                label: 'Método de Pago',
                mobileLabel: 'Método de Pago',
                render: (sale) => (
                  <span>
                    {sale.paymentMethod === 'cash'
                      ? 'Efectivo'
                      : sale.paymentMethod === 'credit'
                      ? 'Tarjeta'
                      : 'Financiamiento'}
                  </span>
                ),
              },
              ...(session?.user.role === 'admin' ? [{
                key: 'actions',
                label: 'Acciones',
                mobileLabel: 'Acciones',
                render: (sale: SaleWithVehicle) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      title="Editar venta"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(sale.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      title="Eliminar venta"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            emptyMessage="No hay ventas registradas"
          />

          {/* Modal de Edición */}
          {showEditModal && editingSale && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Editar Venta
                </h3>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre del Cliente *
                      </label>
                      <input
                        type="text"
                        value={editFormData.customerName}
                        onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
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
                        value={editFormData.customerEmail}
                        onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
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
                        value={editFormData.customerPhone}
                        onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
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
                        step="0.01"
                        min="0"
                        value={editFormData.salePrice}
                        onChange={(e) => setEditFormData({ ...editFormData, salePrice: parseFloat(e.target.value) || 0 })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Método de Pago *
                      </label>
                      <select
                        value={editFormData.paymentMethod}
                        onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value as 'cash' | 'credit' | 'financing' })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="cash">Efectivo</option>
                        <option value="credit">Tarjeta</option>
                        <option value="financing">Financiamiento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado *
                      </label>
                      <select
                        value={editFormData.status || 'completed'}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="completed">Completada</option>
                        <option value="pending">Pendiente</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="refunded">Reembolsada</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notas
                      </label>
                      <textarea
                        value={editFormData.notes}
                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingSale(null);
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Diálogo de Confirmación de Eliminación */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Eliminar Venta"
            message="¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer. El vehículo volverá a estar disponible si no hay otras ventas."
            confirmText="Eliminar"
            cancelText="Cancelar"
            type="danger"
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setSaleToDelete(null);
            }}
          />
        </div>
      </div>
    </>
  );
}

