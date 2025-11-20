// Middleware de seguridad para proteger rutas

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  
  // Rutas completamente públicas (sin autenticación)
  const publicRoutes = [
    '/',                    // Landing page
    '/login', 
    '/register', 
    '/api/auth',
    '/inventory',           // Inventario público (solo lectura)
  ];
  
  // APIs públicas (solo lectura)
  const publicApiRoutes = [
    '/api/vehicles',        // GET de vehículos es público
    '/api/health',          // Health check para Docker/load balancers
  ];
  
  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Verificar si es una API pública (solo GET)
  const isPublicApi = publicApiRoutes.some(route => 
    pathname.startsWith(route) && request.method === 'GET'
  );
  
  // Si es una ruta pública o API pública, permitir acceso
  if (isPublicRoute || isPublicApi) {
    return NextResponse.next();
  }
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/sales',
    '/my-purchases',        // Compras del cliente
    '/checkout',            // Checkout de compra
    '/users',
    '/inventory/new',       // Crear vehículo requiere auth
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Si es una ruta protegida y no hay sesión, redirigir a login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Proteger rutas de API que requieren autenticación
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    // APIs públicas ya fueron manejadas arriba
    if (isPublicApi) {
      return NextResponse.next();
    }
    
    // Si no hay sesión, devolver JSON error (no HTML redirect)
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar roles para rutas administrativas
    if (pathname.startsWith('/api/users') && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

