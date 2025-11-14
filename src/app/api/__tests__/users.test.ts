/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '../users/route';
import { GET as GET_USER, PUT, DELETE } from '../users/[id]/route';
import { createMockRequest, mockAuth } from '@/__tests__/helpers/test-helpers';
import { userDB } from '@/lib/db';
import { prisma } from '@/lib/prisma';

// Mock de dependencias
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@/lib/db', () => ({
  userDB: {
    getAll: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed-${password}`)),
}));

const { auth } = require('@/lib/auth');

describe('API /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return users list as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          name: 'User 1',
          role: 'usuarios_regulares',
          status: 'active',
          emailVerified: true,
          createdAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          name: 'User 2',
          role: 'emprendedores',
          status: 'active',
          emailVerified: true,
          createdAt: new Date(),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].email).toBe('user1@test.com');
      // No debe incluir password
      expect(data[0].password).toBeUndefined();
    });

    it('should reject access without authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('No autorizado');
    });

    it('should reject access as non-admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.emprendedor());

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('No autorizado');
    });
  });

  describe('POST /api/users', () => {
    it('should create user as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());
      (userDB.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockUser = {
        id: 'user-new',
        email: 'newuser@test.com',
        name: 'New User',
        role: 'emprendedores',
        password: 'hashed-Password123',
        createdAt: new Date(),
      };

      (userDB.create as jest.Mock).mockResolvedValue(mockUser);

      const request = createMockRequest('POST', {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'Password123',
        role: 'emprendedores',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.email).toBe('newuser@test.com');
      expect(data.password).toBeUndefined(); // No debe retornar password
    });

    it('should reject user creation without authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('POST', {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'Password123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('No autorizado');
    });

    it('should reject user creation if email exists', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());
      (userDB.findByEmail as jest.Mock).mockResolvedValue({
        id: 'existing-123',
        email: 'existing@test.com',
      });

      const request = createMockRequest('POST', {
        name: 'New User',
        email: 'existing@test.com',
        password: 'Password123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('ya está registrado');
    });
  });

  describe('GET /api/users/[id]', () => {
    it('should get user by id as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        role: 'usuarios_regulares',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const request = createMockRequest('GET');
      const response = await GET_USER(request, {
        params: Promise.resolve({ id: 'user-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('user-123');
      expect(data.email).toBe('user@test.com');
    });

    it('should return 404 if user not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('GET');
      const response = await GET_USER(request, {
        params: Promise.resolve({ id: 'non-existent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('no encontrado');
    });
  });

  describe('PUT /api/users/[id]', () => {
    it('should update user as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const existingUser = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Old Name',
        role: 'usuarios_regulares',
      };

      const updatedUser = {
        ...existingUser,
        name: 'New Name',
        role: 'emprendedores',
      };

      (userDB.findById as jest.Mock).mockResolvedValue(existingUser);
      (userDB.update as jest.Mock).mockResolvedValue(updatedUser);

      const request = createMockRequest('PUT', {
        name: 'New Name',
        role: 'emprendedores',
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'user-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('New Name');
      expect(data.role).toBe('emprendedores');
    });

    it('should reject update without authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('PUT', { name: 'New Name' });
      const response = await PUT(request, {
        params: Promise.resolve({ id: 'user-123' }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('should delete user as admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAuth.admin());

      const userToDelete = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'User to Delete',
      };

      (userDB.findById as jest.Mock).mockResolvedValue(userToDelete);
      (userDB.delete as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'user-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('eliminado');
    });

    it('should prevent self-deletion', async () => {
      const adminSession = mockAuth.admin();
      (auth as jest.Mock).mockResolvedValue(adminSession);

      const userToDelete = {
        id: adminSession.user.id, // Same as admin
        email: 'admin@test.com',
        name: 'Admin User',
      };

      (userDB.findById as jest.Mock).mockResolvedValue(userToDelete);

      const request = createMockRequest('DELETE');
      const response = await DELETE(request, {
        params: Promise.resolve({ id: adminSession.user.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No puedes eliminar tu propia cuenta');
    });
  });
});

