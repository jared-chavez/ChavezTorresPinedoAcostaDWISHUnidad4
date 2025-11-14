'use client';

import { usePersonalStats } from '@/hooks/usePersonalStats';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PersonalDashboardStats() {
  const { stats, loading, error } = usePersonalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando tus estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error al cargar estadísticas: {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">No hay estadísticas disponibles</div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const monthlyPurchasesData = Object.entries(stats.purchases.monthly)
    .map(([month, data]) => ({
      month,
      compras: data.count,
      gastado: data.spent,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const vehiclesByBrandData = Object.entries(stats.vehicles.byBrand)
    .map(([brand, count]) => ({ name: brand, value: count }))
    .sort((a, b) => b.value - a.value);

  const paymentMethodData = Object.entries(stats.purchases.byPaymentMethod)
    .map(([method, count]) => ({
      name: method === 'cash' ? 'Efectivo' : method === 'credit' ? 'Tarjeta' : 'Financiamiento',
      value: count,
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Compras"
          value={stats.overview.totalPurchases}
          subtitle={`${stats.overview.recentPurchases} este mes`}
          color="blue"
        />
        <MetricCard
          title="Total Gastado"
          value={formatCurrency(stats.overview.totalSpent)}
          subtitle={formatCurrency(stats.overview.recentSpent) + ' este mes'}
          color="green"
        />
        <MetricCard
          title="Precio Promedio"
          value={formatCurrency(stats.overview.averagePurchasePrice)}
          subtitle="Por compra"
          color="purple"
        />
        <MetricCard
          title="Marcas Compradas"
          value={Object.keys(stats.vehicles.byBrand).length}
          subtitle="Diferentes marcas"
          color="orange"
        />
      </div>

      {/* Últimas compras */}
      {stats.purchases.lastPurchases.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tus Últimas Compras
            </h3>
            <Link
              href="/my-purchases"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.purchases.lastPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  {purchase.vehicle.images && purchase.vehicle.images.length > 0 ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={purchase.vehicle.images[0]}
                        alt={`${purchase.vehicle.brand} ${purchase.vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {purchase.vehicle.brand} {purchase.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {purchase.vehicle.year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(purchase.salePrice)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(purchase.saleDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      {stats.overview.totalPurchases > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de compras mensuales */}
          {monthlyPurchasesData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compras Mensuales (Últimos 6 meses)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyPurchasesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="compras" stroke="#3b82f6" name="Compras" />
                  <Line type="monotone" dataKey="gastado" stroke="#10b981" name="Gastado ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de marcas */}
          {vehiclesByBrandData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Vehículos por Marca
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehiclesByBrandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de método de pago */}
          {paymentMethodData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compras por Método de Pago
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percent } = props;
                      return `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Mensaje si no hay compras */}
      {stats.overview.totalPurchases === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aún no tienes compras
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Explora nuestro catálogo y encuentra el vehículo perfecto para ti.
          </p>
          <Link
            href="/inventory"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver Catálogo de Vehículos
          </Link>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorConfig = {
    blue: {
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
    },
    purple: {
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    orange: {
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      icon: 'text-orange-600 dark:text-orange-400',
    },
  };

  const config = colorConfig[color];
  const icons = {
    blue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    green: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    purple: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    orange: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${config.text} mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`${config.iconBg} rounded-lg p-3`}>
          <div className={config.icon}>
            {icons[color]}
          </div>
        </div>
      </div>
    </div>
  );
}

