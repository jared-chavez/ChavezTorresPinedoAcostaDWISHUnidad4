import { describe, it, expect } from '@jest/globals';
import {
  hasPermission,
  getRoleLabel,
  getRoleDescription,
  ROLE_PERMISSIONS,
  type UserRole,
} from '../roles';

describe('Roles and Permissions', () => {
  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      expect(hasPermission('admin', 'canManageUsers')).toBe(true);
      expect(hasPermission('admin', 'canCreateVehicles')).toBe(true);
      expect(hasPermission('admin', 'canDeleteVehicles')).toBe(true);
      expect(hasPermission('admin', 'canViewDashboard')).toBe(true);
      expect(hasPermission('admin', 'canManageSettings')).toBe(true);
    });

    it('should return correct permissions for emprendedores', () => {
      expect(hasPermission('emprendedores', 'canManageUsers')).toBe(false);
      expect(hasPermission('emprendedores', 'canCreateVehicles')).toBe(true);
      expect(hasPermission('emprendedores', 'canEditVehicles')).toBe(true);
      expect(hasPermission('emprendedores', 'canDeleteVehicles')).toBe(false);
      expect(hasPermission('emprendedores', 'canCreateSales')).toBe(true);
      expect(hasPermission('emprendedores', 'canEditSales')).toBe(false);
      expect(hasPermission('emprendedores', 'canViewAnalytics')).toBe(false);
    });

    it('should return correct permissions for usuarios_regulares', () => {
      expect(hasPermission('usuarios_regulares', 'canManageUsers')).toBe(false);
      expect(hasPermission('usuarios_regulares', 'canCreateVehicles')).toBe(false);
      expect(hasPermission('usuarios_regulares', 'canEditVehicles')).toBe(false);
      expect(hasPermission('usuarios_regulares', 'canDeleteVehicles')).toBe(false);
      expect(hasPermission('usuarios_regulares', 'canViewVehicles')).toBe(true);
      expect(hasPermission('usuarios_regulares', 'canViewSales')).toBe(true);
      expect(hasPermission('usuarios_regulares', 'canCreateSales')).toBe(false);
      expect(hasPermission('usuarios_regulares', 'canViewDashboard')).toBe(true);
      expect(hasPermission('usuarios_regulares', 'canViewAnalytics')).toBe(false);
    });
  });

  describe('getRoleLabel', () => {
    it('should return correct Spanish labels for all roles', () => {
      expect(getRoleLabel('admin')).toBe('Administrador');
      expect(getRoleLabel('emprendedores')).toBe('Emprendedor');
      expect(getRoleLabel('usuarios_regulares')).toBe('Usuario Regular');
    });

    it('should return the role itself if not found', () => {
      // TypeScript debería prevenir esto, pero probamos el fallback
      expect(getRoleLabel('unknown' as UserRole)).toBe('unknown');
    });
  });

  describe('getRoleDescription', () => {
    it('should return correct descriptions for all roles', () => {
      const adminDesc = getRoleDescription('admin');
      expect(adminDesc).toContain('Acceso completo');
      expect(adminDesc.length).toBeGreaterThan(0);

      const emprendedoresDesc = getRoleDescription('emprendedores');
      expect(emprendedoresDesc).toContain('Puede crear y editar');
      expect(emprendedoresDesc.length).toBeGreaterThan(0);

      const usuariosDesc = getRoleDescription('usuarios_regulares');
      expect(usuariosDesc).toContain('Solo lectura');
      expect(usuariosDesc.length).toBeGreaterThan(0);
    });

    it('should return empty string for unknown role', () => {
      expect(getRoleDescription('unknown' as UserRole)).toBe('');
    });
  });

  describe('ROLE_PERMISSIONS structure', () => {
    it('should have all three roles defined', () => {
      expect(ROLE_PERMISSIONS.admin).toBeDefined();
      expect(ROLE_PERMISSIONS.emprendedores).toBeDefined();
      expect(ROLE_PERMISSIONS.usuarios_regulares).toBeDefined();
    });

    it('should have all required permission fields for each role', () => {
      const requiredPermissions = [
        'canManageUsers',
        'canViewUsers',
        'canCreateVehicles',
        'canEditVehicles',
        'canDeleteVehicles',
        'canViewVehicles',
        'canCreateSales',
        'canViewSales',
        'canEditSales',
        'canViewDashboard',
        'canViewReports',
        'canViewAnalytics',
        'canManageSettings',
      ];

      Object.keys(ROLE_PERMISSIONS).forEach((role) => {
        const permissions = ROLE_PERMISSIONS[role as UserRole];
        requiredPermissions.forEach((permission) => {
          expect(permissions).toHaveProperty(permission);
          expect(typeof permissions[permission as keyof typeof permissions]).toBe('boolean');
        });
      });
    });

    it('should have admin with all permissions enabled', () => {
      const admin = ROLE_PERMISSIONS.admin;
      expect(admin.canManageUsers).toBe(true);
      expect(admin.canViewUsers).toBe(true);
      expect(admin.canCreateVehicles).toBe(true);
      expect(admin.canEditVehicles).toBe(true);
      expect(admin.canDeleteVehicles).toBe(true);
      expect(admin.canViewVehicles).toBe(true);
      expect(admin.canCreateSales).toBe(true);
      expect(admin.canViewSales).toBe(true);
      expect(admin.canEditSales).toBe(true);
      expect(admin.canViewDashboard).toBe(true);
      expect(admin.canViewReports).toBe(true);
      expect(admin.canViewAnalytics).toBe(true);
      expect(admin.canManageSettings).toBe(true);
    });
  });
});

