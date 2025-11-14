// Helpers para tests de integración

import { NextRequest } from 'next/server';
import { User } from '@/types';

/**
 * Crea un mock de NextRequest para testing
 */
export function createMockRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
  headers?: Record<string, string>,
  searchParams?: Record<string, string>
): NextRequest {
  const url = new URL('http://localhost:3000/api/test');
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const headerMap = new Headers();
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      headerMap.set(key, value);
    });
  }

  if (body) {
    headerMap.set('Content-Type', 'application/json');
  }

  const requestInit: {
    method: string;
    headers: Headers;
    body?: string;
  } = {
    method,
    headers: headerMap,
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(url.toString(), requestInit as any);
}

/**
 * Crea un mock de sesión de usuario
 */
export function createMockSession(user: Partial<User> & { id: string; role: string }) {
  return {
    user: {
      id: user.id,
      email: user.email || 'test@example.com',
      name: user.name || 'Test User',
      role: user.role as 'admin' | 'emprendedores' | 'usuarios_regulares',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Mock de auth() para testing
 */
export const mockAuth = {
  admin: () => createMockSession({
    id: 'admin-123',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
  }),
  emprendedor: () => createMockSession({
    id: 'emprendedor-123',
    email: 'emprendedor@test.com',
    name: 'Emprendedor User',
    role: 'emprendedores',
  }),
  usuarioRegular: () => createMockSession({
    id: 'usuario-123',
    email: 'usuario@test.com',
    name: 'Usuario Regular',
    role: 'usuarios_regulares',
  }),
  null: () => null,
};

