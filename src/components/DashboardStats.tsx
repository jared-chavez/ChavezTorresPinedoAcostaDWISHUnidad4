'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { useSession } from 'next-auth/react';
import { ROLE_PERMISSIONS, getRoleLabel } from '@/lib/roles';
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

export default function DashboardStats() {
  const { stats, loading, error } = useDashboard();
  const { data: session } = useSession();

  // Siempre renderizar algo, nunca retornar null después de hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</div>
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

  const canViewAnalytics = session?.user?.role 
    ? ROLE_PERMISSIONS[session.user.role as keyof typeof ROLE_PERMISSIONS]?.canViewAnalytics 
    : false;

  // Preparar datos para gráficos
  const monthlySalesData = Object.entries(stats.sales.monthly)
    .map(([month, data]) => ({
      month,
      ventas: data.count,
      ingresos: data.revenue,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const vehiclesByBrandData = Object.entries(stats.vehicles.byBrand)
    .map(([brand, count]) => ({ name: brand, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const vehiclesByFuelTypeData = Object.entries(stats.vehicles.byFuelType)
    .map(([type, count]) => ({ name: type, value: count }));

  const paymentMethodData = Object.entries(stats.sales.byPaymentMethod)
    .map(([method, count]) => ({
      name: method === 'cash' ? 'Efectivo' : method === 'credit' ? 'Tarjeta' : 'Financiamiento',
      value: count,
    }));

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Vehículos"
          value={stats.overview.totalVehicles}
          subtitle={`${stats.overview.availableVehicles} disponibles`}
          color="blue"
        />
        <MetricCard
          title="Ventas Totales"
          value={stats.overview.totalSales}
          subtitle={`${stats.overview.recentSales} este mes`}
          color="green"
        />
        <MetricCard
          title="Ingresos Totales"
          value={`$${stats.overview.totalRevenue.toLocaleString()}`}
          subtitle={`$${stats.overview.recentRevenue.toLocaleString()} este mes`}
          color="purple"
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${stats.overview.conversionRate}%`}
          subtitle={`${stats.overview.soldVehicles} vendidos`}
          color="orange"
        />
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Estado de Vehículos
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Disponibles</span>
              <span className="font-semibold text-green-600">{stats.overview.availableVehicles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Vendidos</span>
              <span className="font-semibold text-blue-600">{stats.overview.soldVehicles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Reservados</span>
              <span className="font-semibold text-yellow-600">{stats.overview.reservedVehicles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mantenimiento</span>
              <span className="font-semibold text-red-600">{stats.overview.maintenanceVehicles}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Métricas de Ventas
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Precio Promedio</span>
              <span className="font-semibold">${stats.overview.averageSalePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Valor Promedio Inventario</span>
              <span className="font-semibold">${stats.overview.averageInventoryValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Usuarios</span>
              <span className="font-semibold">{stats.overview.totalUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Usuarios por Rol
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.users.byRole).map(([role, count]) => (
              <div key={role} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{getRoleLabel(role as any)}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos - Solo para usuarios con permisos */}
      {canViewAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de ventas mensuales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ventas Mensuales (Últimos 6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke="#3b82f6" name="Ventas" />
                <Line type="monotone" dataKey="ingresos" stroke="#10b981" name="Ingresos ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de vehículos por marca */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vehículos por Marca (Top 5)
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

          {/* Gráfico de tipo de combustible */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vehículos por Tipo de Combustible
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehiclesByFuelTypeData}
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
                  {vehiclesByFuelTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de método de pago */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ventas por Método de Pago
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
      bg: 'from-blue-500 to-blue-600',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      icon: 'text-orange-600 dark:text-orange-400',
    },
  };

  const config = colorConfig[color];
  const icons = {
    blue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

