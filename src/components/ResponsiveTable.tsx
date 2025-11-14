'use client';

import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  className?: string;
}

export default function ResponsiveTable<T extends { id: string }>({
  data,
  columns,
  emptyMessage = 'No hay datos disponibles',
  className = '',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Vista de tabla para desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(item)
                        : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de tarjetas para móvil */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-3">
              {columns.map((column) => {
                const value = column.render
                  ? column.render(item)
                  : (item as any)[column.key];
                
                return (
                  <div key={column.key} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      {column.mobileLabel || column.label}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

