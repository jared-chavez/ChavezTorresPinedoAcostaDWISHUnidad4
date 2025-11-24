'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Validaciones JavaScript
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
  if (password.length < 1) {
    return 'La contraseña es requerida';
  }
  return null;
};

// 🔹 Componente reutilizable para inputs con validación
function InputField({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  onBlur,
  icon: Icon, 
  placeholder,
  error,
  touched
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  error?: string | null;
  touched?: boolean;
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
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
          hasError ? 'text-red-500' : 'text-gray-400'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
            hasError
              ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-gray-50 dark:bg-gray-800'
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
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const registered = searchParams.get('registered');
  const verify = searchParams.get('verify');
  const verified = searchParams.get('verified');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para validación de campos
  const [errors, setErrors] = useState<{
    email: string | null;
    password: string | null;
  }>({
    email: null,
    password: null,
  });
  const [touched, setTouched] = useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  });

  useEffect(() => {
    if (registered === 'true' && verify === 'true') {
      setSuccess('Registro exitoso. Por favor verifica tu email antes de iniciar sesión.');
    }
    if (verified === 'true') {
      setSuccess('Email verificado exitosamente. Ya puedes iniciar sesión.');
    }
  }, [registered, verify, verified]);

  // Validar campos individuales
  const validateField = (name: 'email' | 'password', value: string) => {
    let fieldError: string | null = null;
    
    if (name === 'email') {
      fieldError = validateEmail(value);
    } else if (name === 'password') {
      fieldError = validatePassword(value);
    }
    
    setErrors(prev => ({ ...prev, [name]: fieldError }));
    return fieldError === null;
  };

  // Manejar cambios en campos
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      validateField('email', value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      validateField('password', value);
    }
  };

  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, field === 'email' ? email : password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Marcar todos los campos como touched
    setTouched({ email: true, password: true });
    
    // Validar todos los campos
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    // Si hay errores de validación, no continuar
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Manejar error de cuenta no verificada
        if (result.error.includes('verificada')) {
          setError('Tu cuenta no está verificada. Por favor verifica tu email antes de iniciar sesión.');
        } else {
          setError('Credenciales inválidas');
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800 px-4 py-12 font-sans">
      <div className="w-full max-w-6xl">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            
            {/* 🔹 Lado Izquierdo - Imagen */}
            <div className="hidden md:flex relative overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80"
                alt="Agencia de vehículos"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center p-8 w-full text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg logo-title">
                  Nocturna Genesis
                </h2>
                <p className="text-gray-200 text-xl md:text-2xl drop-shadow-md">
                  Tu agencia de confianza
                </p>
              </div>
            </div>

            {/* 🔹 Lado Derecho - Formulario */}
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="w-full max-w-md mx-auto animate-fadeIn">
                
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40 md:w-64 md:h-64 transition-transform hover:scale-105">
                    <Image
                      src="/logo1.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Título */}
                <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white logo-title">
                  BIENVENIDO
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                  Inicia sesión en tu cuenta
                </p>

                {success && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-center">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <InputField
                    id="email"
                    label="Correo"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    icon={User}
                    placeholder="admin@agencia.com"
                    error={errors.email}
                    touched={touched.email}
                  />

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
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="••••••••"
                        className={`w-full pl-10 ${touched.password && errors.password ? 'pr-20' : 'pr-12'} py-3 border rounded-xl transition-all duration-200 ${
                          touched.password && errors.password
                            ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-gray-50 dark:bg-gray-800'
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
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r
                               from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800
                               hover:from-gray-900 hover:to-black dark:hover:from-gray-600 dark:hover:to-gray-700
                               text-white font-bold py-3 px-6 rounded-xl
                               transition-all duration-200 shadow-md hover:shadow-lg
                               transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" /> Iniciando sesión...
                      </>
                    ) : (
                      'INICIAR SESIÓN'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  ¿No tienes cuenta?{' '}
                  <Link
                    href="/register"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors"
                  >
                    Regístrate
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

// 🔹 Página principal
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800">
          <div className="text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5" /> Cargando...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
