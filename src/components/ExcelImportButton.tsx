'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/ToastProvider';

interface ExcelImportButtonProps {
  onImportComplete?: () => void;
  allowedRoles?: ('admin' | 'emprendedores')[];
}

interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export default function ExcelImportButton({ 
  onImportComplete,
  allowedRoles = ['admin', 'emprendedores']
}: ExcelImportButtonProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      showToast('Por favor, selecciona un archivo Excel (.xlsx o .xls)', 'error');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('El archivo es demasiado grande. Máximo 5MB', 'error');
      return;
    }

    await handleImport(file);
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/sales/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar ventas');
      }

      setImportResult(data);
      setShowResults(true);

      if (data.success > 0) {
        showToast(
          `✅ ${data.success} venta(s) importada(s) exitosamente${data.errors.length > 0 ? `, ${data.errors.length} error(es)` : ''}`,
          data.errors.length > 0 ? 'warning' : 'success'
        );
      } else {
        showToast('No se pudo importar ninguna venta. Revisa los errores.', 'error');
      }

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Llamar callback si existe
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al importar ventas';
      showToast(errorMsg, 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Importar xlsx dinámicamente solo cuando se necesite
      const xlsxModule = await import('xlsx');
      // xlsx puede exportarse como default o como named export
      const XLSX = xlsxModule.default || xlsxModule;

      if (!XLSX || !XLSX.utils) {
        throw new Error('Error al cargar la librería xlsx. Por favor, recarga la página.');
      }

      // Crear template Excel con todos los campos
      const templateData = [
        ['VIN', 'Nombre Cliente', 'Email Cliente', 'Teléfono Cliente', 'Precio Venta', 'Método Pago', 'Estado', 'Fecha Venta', 'Notas'],
        ['1HGBH41JXMN109186', 'Juan Pérez', 'juan@email.com', '5551234567', '700000', 'credit', 'completed', '2025-11-12', 'Venta especial'],
        ['2HGFB2F59NH123456', 'María García', 'maria@email.com', 'N/A', '28000', 'cash', 'completed', '2025-11-12', 'N/A'],
        ['5YJ3E1EA1KF123789', 'Carlos López', 'carlos@email.com', '', '45000', 'financing', 'pending', '', ''],
      ];

      // Crear workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(templateData);

      // Ajustar ancho de columnas
      ws['!cols'] = [
        { wch: 18 }, // VIN
        { wch: 20 }, // Nombre Cliente
        { wch: 25 }, // Email Cliente
        { wch: 15 }, // Teléfono Cliente
        { wch: 12 }, // Precio Venta
        { wch: 15 }, // Método Pago
        { wch: 12 }, // Estado
        { wch: 12 }, // Fecha Venta
        { wch: 20 }, // Notas
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

      // Generar archivo Excel
      const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Descargar - el navegador descargará automáticamente en la carpeta predeterminada (Downloads)
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'template_importar_ventas.xlsx';
      link.style.display = 'none';
      
      // Agregar al DOM, hacer click, y remover
      document.body.appendChild(link);
      link.click();
      
      // Limpiar después de un breve delay para asegurar que la descarga se complete
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 200);

      showToast('Plantilla descargada exitosamente', 'success');
    } catch (error) {
      console.error('Error al generar plantilla:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showToast(`Error al generar la plantilla: ${errorMsg}`, 'error');
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {importing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Importando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Importar Excel
            </>
          )}
        </button>
        
        <button
          onClick={handleDownloadTemplate}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          title="Descargar plantilla Excel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Plantilla
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal de Resultados */}
      {showResults && importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Resultados de Importación
              </h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {importResult.success > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-400 font-semibold">
                    ✅ {importResult.success} venta(s) importada(s) exitosamente
                  </p>
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-400 font-semibold mb-2">
                    ❌ {importResult.errors.length} error(es) encontrado(s):
                  </p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-medium">Fila {error.row}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

