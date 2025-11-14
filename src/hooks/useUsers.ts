// Hook personalizado para gestión de usuarios usando el cliente API

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { apiClient, handleApiError } from '@/lib/api-client';
import { RegisterInput } from '@/lib/validations';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: RegisterInput) => {
    try {
      const newUser = await apiClient.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
  };
}

