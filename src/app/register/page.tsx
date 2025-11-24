'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

// Validaciones JavaScript
const validateName = (name: string): string | null => {
  if (!name) {
    return 'El nombre es requerido';
  }
  if (name.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'El email es requerido';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'La contraseña es requerida';
  }
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }
  return null;
};

const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Confirma tu contraseña';
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null;
};

// Componente de campo con validación
function FormField({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  error,
  touched,
  hint,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string | null;
  touched?: boolean;
  hint?: string;
}) {
  const hasError = touched && error;
  
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-sm font-medium mb-2 ${
          hasError
            ? 'text-red-700 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
            hasError ? 'text-red-500' : 'text-gray-400'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-xl transition-all ${
            hasError
              ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 focus:border-gray-600 dark:focus:border-gray-500 bg-white dark:bg-gray-800'
          } dark:text-white`}
        />
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
      {!hasError && hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para validación de campos
  const [errors, setErrors] = useState<{
    name: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
  }>({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [touched, setTouched] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Validar campos individuales
  const validateField = (name: 'name' | 'email' | 'password' | 'confirmPassword', value: string) => {
    let fieldError: string | null = null;
    
    if (name === 'name') {
      fieldError = validateName(value);
    } else if (name === 'email') {
      fieldError = validateEmail(value);
    } else if (name === 'password') {
      fieldError = validatePassword(value);
    } else if (name === 'confirmPassword') {
      fieldError = validateConfirmPassword(formData.password, value);
    }
    
    setErrors(prev => ({ ...prev, [name]: fieldError }));
    return fieldError === null;
  };

  // Manejar cambios en campos
  const handleFieldChange = (field: 'name' | 'email' | 'password' | 'confirmPassword') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);
      
      // Si el campo ya fue touched, validar en tiempo real
      if (touched[field]) {
        if (field === 'confirmPassword') {
          // Si cambia confirmPassword, validar contra password
          validateField('confirmPassword', value);
        } else if (field === 'password') {
          // Si cambia password, validar password y también confirmPassword si ya fue touched
          validateField('password', value);
          if (touched.confirmPassword) {
            // Usar el nuevo valor de password para validar confirmPassword
            const confirmError = validateConfirmPassword(value, newFormData.confirmPassword);
            setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
          }
        } else {
          validateField(field, value);
        }
      }
    };

  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Marcar todos los campos como touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    
    // Validar todos los campos
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);
    
    // Si hay errores de validación, no continuar
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      // Usar el nuevo endpoint de registro público con verificación
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        // Mostrar mensaje de éxito y redirigir
        router.push('/login?registered=true&verify=true');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 px-4 py-12">
      <div className="w-full max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[700px]">
            {/* Lado Izquierdo - Imagen de fondo */}
            <div className="hidden md:flex relative overflow-hidden">
              {/* Imagen de fondo */}
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80"
                  alt="Registro en agencia"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay oscuro para legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/80"></div>
              </div>
              
              {/* Contenido sobre la imagen */}
              <div className="relative z-10 flex flex-col items-center justify-center p-8 w-full">
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 logo-title drop-shadow-lg">
                    Únete a Nosotros
                  </h2>
                  <p className="text-indigo-100 text-xl md:text-2xl drop-shadow-md">
                    Crea tu cuenta y comienza
                  </p>
                </div>
              </div>
            </div>

            {/* Lado Derecho - Formulario */}
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="w-full max-w-md mx-auto">
                {/* Avatar/Logo */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg ring-4 ring-gray-200 dark:ring-gray-700">
                    <Image
                      src="/logo1.png"
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Título */}
                <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white logo-title">
                  CREAR CUENTA
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                  Regístrate en la agencia
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Campo Nombre */}
                  <FormField
                    id="name"
                    label="Nombre Completo"
                    type="text"
                    value={formData.name}
                    onChange={handleFieldChange('name')}
                    onBlur={() => handleBlur('name')}
                    placeholder="Juan Pérez"
                    icon={() => (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    error={errors.name}
                    touched={touched.name}
                  />

                  {/* Campo Email */}
                  <FormField
                    id="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange('email')}
                    onBlur={() => handleBlur('email')}
                    placeholder="juan@ejemplo.com"
                    icon={() => (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    error={errors.email}
                    touched={touched.email}
                  />

                  {/* Campo Contraseña */}
                  <div>
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium mb-2 ${
                        touched.password && errors.password
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                        touched.password && errors.password ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleFieldChange('password')}
                        onBlur={() => handleBlur('password')}
                        placeholder="••••••••"
                        className={`w-full pl-10 ${touched.password && errors.password ? 'pr-20' : 'pr-12'} py-3 border rounded-xl transition-all ${
                          touched.password && errors.password
                            ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 focus:border-gray-600 dark:focus:border-gray-500 bg-white dark:bg-gray-800'
                        } dark:text-white`}
                      />
                      {touched.password && errors.password && (
                        <div className="absolute inset-y-0 right-12 pr-3 flex items-center pointer-events-none z-10">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-20 cursor-pointer"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </p>
                    )}
                    {!touched.password && !errors.password && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números
                      </p>
                    )}
                  </div>

                  {/* Campo Confirmar Contraseña */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className={`block text-sm font-medium mb-2 ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                        touched.confirmPassword && errors.confirmPassword ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleFieldChange('confirmPassword')}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="••••••••"
                        className={`w-full pl-10 ${touched.confirmPassword && errors.confirmPassword ? 'pr-20' : 'pr-12'} py-3 border rounded-xl transition-all ${
                          touched.confirmPassword && errors.confirmPassword
                            ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-500 focus:border-gray-600 dark:focus:border-gray-500 bg-white dark:bg-gray-800'
                        } dark:text-white`}
                      />
                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className="absolute inset-y-0 right-12 pr-3 flex items-center pointer-events-none z-10">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-20 cursor-pointer"
                        aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Botón de Registro */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {loading ? 'Registrando...' : 'REGISTRARSE'}
                  </button>
                </form>

                {/* Link a Login */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
