/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST } from '../auth/register/route';
import { createMockRequest } from '@/__tests__/helpers/test-helpers';

// Mock de dependencias
jest.mock('@/lib/db');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    emailVerification: {
      create: jest.fn(),
    },
  },
}));
jest.mock('@/lib/ip-utils', () => ({
  getClientIp: jest.fn(() => '127.0.0.1'),
  isIpBlacklisted: jest.fn(() => Promise.resolve(false)),
  checkIpRateLimit: jest.fn(() => Promise.resolve({ allowed: true, remaining: 3, resetAt: new Date() })),
}));
jest.mock('@/lib/email', () => ({
  sendVerificationEmail: jest.fn(() => Promise.resolve({ success: true, messageId: 'test-id' })),
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed-${password}`)),
}));
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'test-token-1234567890abcdef'),
  })),
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const { userDB } = require('@/lib/db');
    const { prisma } = require('@/lib/prisma');

    (userDB.findByEmail as jest.Mock).mockResolvedValueOnce(null);
    (userDB.create as jest.Mock).mockResolvedValueOnce({
      id: 'user-123',
      email: 'newuser@test.com',
      name: 'New User',
      role: 'usuarios_regulares',
      password: 'hashed-Password123',
      createdAt: new Date(),
    });
    (prisma.emailVerification.create as jest.Mock).mockResolvedValueOnce({
      id: 'verification-123',
      userId: 'user-123',
      token: 'test-token',
      email: 'newuser@test.com',
      ipAddress: '127.0.0.1',
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    const request = createMockRequest('POST', {
      name: 'New User',
      email: 'newuser@test.com',
      password: 'Password123',
      role: 'usuarios_regulares',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toContain('Registro exitoso');
    expect(data.email).toBe('newuser@test.com');
    expect(userDB.findByEmail).toHaveBeenCalledWith('newuser@test.com');
    expect(userDB.create).toHaveBeenCalled();
  });

  it('should reject registration with invalid email', async () => {
    const request = createMockRequest('POST', {
      name: 'New User',
      email: 'invalid-email',
      password: 'Password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should reject registration with weak password', async () => {
    const request = createMockRequest('POST', {
      name: 'New User',
      email: 'user@test.com',
      password: 'weak',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should reject registration if email already exists', async () => {
    const { userDB } = require('@/lib/db');
    (userDB.findByEmail as jest.Mock).mockResolvedValueOnce({
      id: 'existing-123',
      email: 'existing@test.com',
      name: 'Existing User',
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

  it('should reject registration if IP is blacklisted', async () => {
    const { isIpBlacklisted } = require('@/lib/ip-utils');
    (isIpBlacklisted as jest.Mock).mockResolvedValueOnce(true);

    const request = createMockRequest('POST', {
      name: 'New User',
      email: 'user@test.com',
      password: 'Password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('IP ha sido bloqueada');
  });

  it('should reject registration if rate limit exceeded', async () => {
    const { checkIpRateLimit } = require('@/lib/ip-utils');
    (checkIpRateLimit as jest.Mock).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
    });

    const request = createMockRequest('POST', {
      name: 'New User',
      email: 'user@test.com',
      password: 'Password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Demasiados intentos');
  });
});

