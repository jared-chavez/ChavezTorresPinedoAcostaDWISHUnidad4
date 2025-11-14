'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ResponsiveTable from '@/components/ResponsiveTable';
import RoleBadge from '@/components/RoleBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ToastProvider';
import { UpdateUserInput } from '@/lib/validations';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'emprendedores' as const,
  });

  const [editFormData, setEditFormData] = useState<UpdateUserInput>({
    name: '',
    email: '',
    role: 'usuarios_regulares',
    status: 'active',
  });

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [session, router]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err: any) {
      setError('Error al cargar usuarios: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/users', formData);
      if (response.status === 201) {
        setShowForm(false);
        setFormData({ name: '', email: '', password: '', role: 'emprendedores' });
        fetchUsers();
        showToast('Usuario creado exitosamente', 'success');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al crear usuario';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role as any,
      status: user.status as any || 'active',
    });
    setShowEditModal(true);
    setError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    setError('');

    try {
      // Preparar datos de actualización (solo enviar campos que cambiaron)
      const updateData: UpdateUserInput = {};
      if (editFormData.name && editFormData.name !== editingUser.name) {
        updateData.name = editFormData.name;
      }
      if (editFormData.email && editFormData.email !== editingUser.email) {
        updateData.email = editFormData.email;
      }
      if (editFormData.role && editFormData.role !== editingUser.role) {
        updateData.role = editFormData.role;
      }
      if (editFormData.status && editFormData.status !== editingUser.status) {
        updateData.status = editFormData.status;
      }
      // Solo incluir password si se proporcionó
      if (editFormData.password && editFormData.password.trim() !== '') {
        updateData.password = editFormData.password;
      }

      // Solo actualizar si hay cambios
      if (Object.keys(updateData).length > 0) {
        await apiClient.updateUser(editingUser.id, updateData);
        showToast('Usuario actualizado exitosamente', 'success');
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast('No hay cambios para guardar', 'info');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar usuario';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await apiClient.deleteUser(userToDelete.id);
      showToast('Usuario eliminado exitosamente', 'success');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar usuario';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white logo-title">
              Gestión de Usuarios
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              + Nuevo Usuario
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Crear Nuevo Usuario
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="admin">Administrador</option>
                      <option value="emprendedores">Emprendedor</option>
                      <option value="usuarios_regulares">Usuario Regular</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Crear Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <ResponsiveTable
            data={users}
            columns={[
              {
                key: 'name',
                label: 'Nombre',
                mobileLabel: 'Nombre',
                render: (user) => (
                  <span className="font-medium">{user.name}</span>
                ),
              },
              {
                key: 'email',
                label: 'Email',
                mobileLabel: 'Email',
              },
              {
                key: 'role',
                label: 'Rol',
                mobileLabel: 'Rol',
                render: (user) => (
                  <RoleBadge role={user.role as any} />
                ),
              },
              {
                key: 'status',
                label: 'Estado',
                mobileLabel: 'Estado',
                render: (user) => {
                  const statusLabels: Record<string, string> = {
                    active: 'Activo',
                    pending_verification: 'Pendiente',
                    suspended: 'Suspendido',
                  };
                  const statusColors: Record<string, string> = {
                    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    pending_verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  };
                  const status = user.status || 'active';
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || statusColors.active}`}>
                      {statusLabels[status] || status}
                    </span>
                  );
                },
              },
              {
                key: 'createdAt',
                label: 'Fecha de Registro',
                mobileLabel: 'Fecha de Registro',
                render: (user) => (
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                ),
              },
              {
                key: 'actions',
                label: 'Acciones',
                mobileLabel: 'Acciones',
                render: (user) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      Eliminar
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No hay usuarios registrados"
          />

          {/* Modal de Edición */}
          {showEditModal && editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Editar Usuario
                </h2>

                {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rol *
                      </label>
                      <select
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="admin">Administrador</option>
                        <option value="emprendedores">Emprendedor</option>
                        <option value="usuarios_regulares">Usuario Regular</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado *
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="active">Activo</option>
                        <option value="pending_verification">Pendiente de Verificación</option>
                        <option value="suspended">Suspendido</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nueva Contraseña (opcional)
                      </label>
                      <input
                        type="password"
                        value={editFormData.password || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value || undefined })}
                        placeholder="Dejar vacío para no cambiar"
                        minLength={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Mínimo 8 caracteres, con mayúscula, minúscula y número
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingUser(null);
                        setError('');
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Diálogo de Confirmación de Eliminación */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Eliminar Usuario"
            message={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            type="danger"
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setUserToDelete(null);
            }}
          />
        </div>
      </div>
    </>
  );
}

