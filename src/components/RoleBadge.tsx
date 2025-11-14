// Componente para mostrar badges de roles

import { UserRole, getRoleLabel } from '@/lib/roles';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const colorClasses = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    emprendedores: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    usuarios_regulares: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClasses[role]} ${className}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

