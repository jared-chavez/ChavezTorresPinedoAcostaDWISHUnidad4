// Definición de roles y permisos del sistema

export type UserRole = 'admin' | 'emprendedores' | 'usuarios_regulares';

export interface RolePermissions {
  // Gestión de usuarios
  canManageUsers: boolean;
  canViewUsers: boolean;
  
  // Gestión de vehículos
  canCreateVehicles: boolean;
  canEditVehicles: boolean;
  canDeleteVehicles: boolean;
  canViewVehicles: boolean;
  
  // Gestión de ventas
  canCreateSales: boolean;
  canViewSales: boolean;
  canEditSales: boolean;
  
  // Dashboard y reportes
  canViewDashboard: boolean;
  canViewReports: boolean;
  canViewAnalytics: boolean;
  
  // Configuración
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    // Usuarios
    canManageUsers: true,
    canViewUsers: true,
    
    // Vehículos
    canCreateVehicles: true,
    canEditVehicles: true,
    canDeleteVehicles: true,
    canViewVehicles: true,
    
    // Ventas
    canCreateSales: true,
    canViewSales: true,
    canEditSales: true,
    
    // Dashboard
    canViewDashboard: true,
    canViewReports: true,
    canViewAnalytics: true,
    
    // Configuración
    canManageSettings: true,
  },
  
  emprendedores: {
    // Usuarios
    canManageUsers: false,
    canViewUsers: false,
    
    // Vehículos
    canCreateVehicles: true,
    canEditVehicles: true,
    canDeleteVehicles: false,
    canViewVehicles: true,
    
    // Ventas
    canCreateSales: true,
    canViewSales: true,
    canEditSales: false,
    
    // Dashboard
    canViewDashboard: true,
    canViewReports: true,
    canViewAnalytics: false,
    
    // Configuración
    canManageSettings: false,
  },
  
  usuarios_regulares: {
    // Usuarios
    canManageUsers: false,
    canViewUsers: false,
    
    // Vehículos
    canCreateVehicles: false,
    canEditVehicles: false,
    canDeleteVehicles: false,
    canViewVehicles: true,  // Puede ver catálogo completo
    
    // Ventas
    canCreateSales: false,
    canViewSales: true,      // Solo puede ver sus propias compras (filtrado por email)
    canEditSales: false,
    
    // Dashboard
    canViewDashboard: true,  // Dashboard personalizado con sus estadísticas
    canViewReports: false,
    canViewAnalytics: false,
    
    // Configuración
    canManageSettings: false,
  },
};

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Administrador',
    emprendedores: 'Emprendedor',
    usuarios_regulares: 'Usuario Regular',
  };
  return labels[role] || role;
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: 'Acceso completo al sistema. Puede gestionar usuarios, vehículos, ventas y configuración.',
    emprendedores: 'Puede crear y editar vehículos, registrar ventas y ver reportes básicos. Ideal para vendedores y emprendedores.',
    usuarios_regulares: 'Cliente final. Puede ver catálogo de vehículos, sus propias compras y estadísticas personales. Ideal para clientes que compran vehículos.',
  };
  return descriptions[role] || '';
}

