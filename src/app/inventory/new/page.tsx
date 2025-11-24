'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ToastProvider';
import ImageUpload from '@/components/ImageUpload';
import { Vehicle } from '@/types';

export default function NewVehiclePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [externalInfo, setExternalInfo] = useState<{ source: string; info?: Record<string, string> } | null>(null);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<{
    brand: string;
    model: string;
    year: number;
    color: string;
    price: number;
    mileage: number;
    fuelType: Vehicle['fuelType'];
    transmission: Vehicle['transmission'];
    status: Vehicle['status'];
    vin: string;
    description: string;
    images: string[];
  }>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '#000000',
    price: 0,
    mileage: 0,
    fuelType: 'gasoline',
    transmission: 'automatic',
    status: 'available',
    vin: '',
    description: '',
    images: [],
  });

  useEffect(() => {
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'emprendedores')) {
      router.push('/inventory');
    }
  }, [session, router]);

  const handleVINLookup = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      setError('El VIN debe tener 17 caracteres');
      return;
    }

    try {
      const response = await axios.get(`/api/external/vehicle-info?vin=${formData.vin}`);
      setExternalInfo(response.data);
      
      // Pre-llenar campos si están disponibles
      if (response.data.info) {
        if (response.data.info.Make) setFormData(prev => ({ ...prev, brand: response.data.info.Make }));
        if (response.data.info.Model) setFormData(prev => ({ ...prev, model: response.data.info.Model }));
        if (response.data.info['Model Year']) {
          setFormData(prev => ({ ...prev, year: parseInt(response.data.info['Model Year']) || prev.year }));
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError('Error al obtener información del VIN: ' + (axiosError.response?.data?.error || errorMessage));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Si hay imágenes, usar FormData
      if (imageFiles.length > 0) {
        const formDataToSend = new FormData();
        formDataToSend.append('brand', formData.brand);
        formDataToSend.append('model', formData.model);
        formDataToSend.append('year', formData.year.toString());
        formDataToSend.append('color', formData.color);
        formDataToSend.append('price', formData.price.toString());
        formDataToSend.append('mileage', formData.mileage.toString());
        formDataToSend.append('fuelType', formData.fuelType);
        formDataToSend.append('transmission', formData.transmission);
        formDataToSend.append('status', formData.status);
        formDataToSend.append('vin', formData.vin);
        if (formData.description) {
          formDataToSend.append('description', formData.description);
        }
        
        // Agregar imágenes
        imageFiles.forEach((file) => {
          formDataToSend.append('images', file);
        });

        const response = await axios.post('/api/vehicles', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.status === 201) {
          showToast('Vehículo creado exitosamente', 'success');
          router.push('/inventory');
        }
      } else {
        // Sin imágenes, usar JSON normal
        const response = await axios.post('/api/vehicles', formData);
        if (response.status === 201) {
          showToast('Vehículo creado exitosamente', 'success');
          router.push('/inventory');
        }
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string; details?: unknown } } };
      const errorMsg = axiosError.response?.data?.error || 'Error al crear vehículo';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      if (axiosError.response?.data?.details) {
        setError((axiosError.response.data.error || 'Error') + ': ' + JSON.stringify(axiosError.response.data.details));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'emprendedores')) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 logo-title">
            Agregar Nuevo Vehículo
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Consultar Información por VIN (Web Service de Terceros)
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                placeholder="Ingrese VIN (17 caracteres)"
                maxLength={17}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="button"
                onClick={handleVINLookup}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Consultar VIN
              </button>
            </div>
            {externalInfo && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Fuente:</strong> {externalInfo.source}
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {Object.entries(externalInfo.info || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marca *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año *
                </label>
                <input
                  type="number"
                  value={isNaN(formData.year) ? '' : formData.year}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? new Date().getFullYear() : parseInt(value, 10);
                    setFormData({ ...formData, year: isNaN(numValue) ? new Date().getFullYear() : numValue });
                  }}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.color || '#000000'}
                    onChange={(e) => {
                      const colorValue = e.target.value.toUpperCase();
                      setFormData({ ...formData, color: colorValue });
                    }}
                    className="h-12 w-16 border-2 border-gray-300 rounded-lg cursor-pointer dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                    title="Selecciona un color"
                  />
                <input
                  type="text"
                    value={formData.color || '#000000'}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      // Asegurar que empiece con #
                      if (value && !value.startsWith('#')) {
                        value = '#' + value.replace(/#/g, '');
                      }
                      // Validar formato hexadecimal
                      if (value === '' || value === '#' || /^#[0-9A-F]{0,6}$/.test(value)) {
                        setFormData({ ...formData, color: value || '#000000' });
                      }
                    }}
                    onBlur={(e) => {
                      // Asegurar formato completo al perder foco
                      let value = e.target.value.toUpperCase();
                      if (!value || value === '#') {
                        value = '#000000';
                      } else if (!value.startsWith('#')) {
                        value = '#' + value;
                      }
                      // Completar a 7 caracteres si falta
                      if (value.length < 7 && /^#[0-9A-F]{1,6}$/.test(value)) {
                        const hex = value.substring(1);
                        value = '#' + hex.padEnd(6, '0');
                      }
                      setFormData({ ...formData, color: value });
                    }}
                    placeholder="#000000"
                    maxLength={7}
                  required
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                />
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Colores comunes:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: '#000000', name: 'Negro' },
                      { code: '#FFFFFF', name: 'Blanco' },
                      { code: '#FF0000', name: 'Rojo' },
                      { code: '#0000FF', name: 'Azul' },
                      { code: '#00FF00', name: 'Verde' },
                      { code: '#FFFF00', name: 'Amarillo' },
                      { code: '#FFA500', name: 'Naranja' },
                      { code: '#808080', name: 'Gris' },
                      { code: '#800080', name: 'Morado' },
                      { code: '#A52A2A', name: 'Marrón' },
                    ].map(({ code, name }) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: code })}
                        className="flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:scale-105 hover:shadow-sm transition-all"
                        style={{ backgroundColor: code === '#FFFFFF' ? code : 'transparent' }}
                        title={`${name} (${code})`}
                      >
                        <span 
                          className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" 
                          style={{ backgroundColor: code }}
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">{code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio *
                </label>
                <input
                  type="number"
                  value={isNaN(formData.price) ? '' : formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseFloat(value);
                    setFormData({ ...formData, price: isNaN(numValue) ? 0 : numValue });
                  }}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kilometraje *
                </label>
                <input
                  type="number"
                  value={isNaN(formData.mileage) ? '' : formData.mileage}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value, 10);
                    setFormData({ ...formData, mileage: isNaN(numValue) ? 0 : numValue });
                  }}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Combustible *
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as Vehicle['fuelType'] })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="gasoline">Gasolina</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Eléctrico</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transmisión *
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value as Vehicle['transmission'] })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="automatic">Automática</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  VIN (17 caracteres) *
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  required
                  maxLength={17}
                  minLength={17}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Componente de subida de imágenes */}
            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              onFilesChange={(files) => setImageFiles(files)}
              maxImages={5}
              maxSizeMB={5}
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Vehículo'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/inventory')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

