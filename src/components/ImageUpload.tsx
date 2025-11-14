'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageFile {
  file: File;
  preview: string; // URL temporal para preview
  id: string; // ID temporal para identificar antes de subir
}

interface ImageUploadProps {
  images: string[]; // Array de IDs de imágenes (después de subir) o URLs legacy
  onChange: (images: string[]) => void;
  onFilesChange?: (files: File[]) => void; // Callback con archivos para subir
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUpload({
  images,
  onChange,
  onFilesChange,
  maxImages = 5,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP');
      return false;
    }

    // Validar tamaño
    const maxSize = maxSizeMB * 1024 * 1024; // Convertir MB a bytes
    if (file.size > maxSize) {
      setError(`La imagen no debe exceder ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar cantidad máxima
    if (imageFiles.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);
    const newImageFiles: ImageFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!validateFile(file)) {
          setUploading(false);
          return;
        }

        // Crear preview URL
        const preview = URL.createObjectURL(file);
        const id = `temp-${Date.now()}-${i}`;
        
        newImageFiles.push({
          file,
          preview,
          id,
        });
      }

      setImageFiles([...imageFiles, ...newImageFiles]);
      
      // Notificar archivos seleccionados
      if (onFilesChange) {
        onFilesChange([...imageFiles, ...newImageFiles].map(img => img.file));
      }
      
      setError('');
    } catch (err) {
      setError('Error al procesar las imágenes');
      console.error(err);
    } finally {
      setUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = imageFiles[index];
    // Revocar URL del preview
    URL.revokeObjectURL(imageToRemove.preview);
    
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);
    
    // Notificar archivos actualizados
    if (onFilesChange) {
      onFilesChange(newImageFiles.map(img => img.file));
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Imágenes del Vehículo {images.length > 0 && `(${images.length}/${maxImages})`}
      </label>

      {/* Input de archivo */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {uploading ? 'Subiendo...' : 'Agregar Imágenes'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Máximo {maxImages} imágenes, {maxSizeMB}MB cada una
        </p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Preview de imágenes nuevas (aún no subidas) */}
      {imageFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageFiles.map((imageFile, index) => (
            <div key={imageFile.id} className="relative group">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <Image
                  src={imageFile.preview}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar imagen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Información sobre almacenamiento */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Las imágenes se almacenan como BLOB en PostgreSQL. Se subirán al guardar el vehículo.
      </p>
    </div>
  );
}

