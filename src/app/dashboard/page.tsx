'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DashboardStats from '@/components/DashboardStats';
import PersonalDashboardStats from '@/components/PersonalDashboardStats';
import { ROLE_PERMISSIONS } from '@/lib/roles';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const canViewDashboard = ROLE_PERMISSIONS[session.user.role as keyof typeof ROLE_PERMISSIONS]?.canViewDashboard;

    if (!canViewDashboard) {
      router.push('/inventory');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Redirigiendo...</div>
      </div>
    );
  }

  const canViewDashboard = ROLE_PERMISSIONS[session.user.role as keyof typeof ROLE_PERMISSIONS]?.canViewDashboard;

  if (!canViewDashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Redirigiendo...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 logo-title">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {session.user.role === 'usuarios_regulares' 
                ? 'Tu panel personal y estadísticas de compras'
                : 'Métricas y estadísticas del sistema'}
            </p>
          </div>

          {session.user.role === 'usuarios_regulares' ? (
            <PersonalDashboardStats />
          ) : (
            <DashboardStats />
          )}
        </div>
      </div>
    </>
  );
}

