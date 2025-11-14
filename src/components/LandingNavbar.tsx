'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const menuItems = [
    { name: 'Inventario', href: '/inventory', requiresAuth: true },
    { name: 'Promociones', href: '#promociones' },
    { name: 'Financiamiento', href: '#financiamiento' },
    { name: 'Servicio', href: '#servicio' },
    { name: 'Seminuevos', href: '/inventory?status=available' },
    { name: 'Contáctanos', href: '#contacto' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* La altura del nav se mantiene en h-24 para dar espacio al logo más grande */}
        <div className="flex justify-between items-center h-24"> 
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4">
            {/* Ícono de logo más grande: w-16 h-16 (antes w-14 h-14) */}
            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-xl shadow-blue-500/30 flex-shrink-0 transition-all duration-300 hover:scale-105"> 
              <Image
                src="/logo1.png"
                alt="Nocturna Genesis Logo"
                width={64} // Ajustado a 64 (w-16)
                height={64} // Ajustado a 64 (h-16)
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              {/* Texto del logo con tipografía Trade Winds (logo-title) */}
              <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300 logo-title">
                Nocturna Genesis
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Agencia de Vehículos</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => {
              if (item.requiresAuth && !session) return null;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20"
                >
                  Mi Cuenta
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                if (item.requiresAuth && !session) return null;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold"
                    >
                      Mi Cuenta
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}