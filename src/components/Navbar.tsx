'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROLE_PERMISSIONS } from '@/lib/roles';
import RoleBadge from './RoleBadge';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  // Mostrar loading mientras se carga la sesión
  if (status === 'loading') {
    return null;
  }

  // Si no hay sesión, no mostrar navbar
  if (!session) {
    return null;
  }

  const role = session.user.role as keyof typeof ROLE_PERMISSIONS;
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.usuarios_regulares;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-8">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-2 group"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Image
                          src="/logo1.png"
                          alt="Nocturna Genesis Logo"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent logo-title">
                        Nocturna Genesis
                      </span>
                    </Link>
            <div className="hidden md:flex items-center space-x-1">
              {permissions.canViewDashboard && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {permissions.canViewVehicles && (
                <Link
                  href="/inventory"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Inventario
                </Link>
              )}
              {permissions.canViewSales && session.user.role === 'usuarios_regulares' && (
                <Link
                  href="/my-purchases"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Mis Compras
                </Link>
              )}
              {permissions.canViewSales && session.user.role !== 'usuarios_regulares' && (
                <Link
                  href="/sales"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Ventas
                </Link>
              )}
              {permissions.canViewUsers && (
                <Link
                  href="/users"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Usuarios
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.user.name}
                </span>
                <RoleBadge role={role} />
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

