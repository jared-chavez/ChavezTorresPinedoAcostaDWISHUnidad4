'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no proporcionado');
      return;
    }

    // Llamar a la API de verificación
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verificado exitosamente');
          // Redirigir a login después de 3 segundos
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar el email');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setStatus('error');
        setMessage('Error al conectar con el servidor');
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg ring-4 ring-white/20">
                <Image
                  src="/logo1.png"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 logo-title">
              Verificación de Email
            </h1>
          </div>

          {/* Content */}
          <div className="p-8">
            {status === 'loading' && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Verificación Exitosa!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Redirigiendo al login...
                </p>
                <Link
                  href="/login?verified=true"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Ir al Login
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Error de Verificación
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link
                    href="/register"
                    className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
                  >
                    Intentar Registrarse Nuevamente
                  </Link>
                  <Link
                    href="/login"
                    className="block px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-lg transition-colors text-center"
                  >
                    Ir al Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600">
          <div className="text-white">Cargando...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

