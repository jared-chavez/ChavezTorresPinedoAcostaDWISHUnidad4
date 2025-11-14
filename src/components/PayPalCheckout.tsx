'use client';

import { useState } from 'react';

interface PayPalCheckoutProps {
  amount: number;
  vehicleId: string;
  onPaymentSuccess: (paymentData: {
    paymentMethod: 'credit' | 'paypal';
    cardNumber?: string;
    notes?: string;
  }) => void;
  processing: boolean;
}

export default function PayPalCheckout({
  amount,
  onPaymentSuccess,
  processing,
}: PayPalCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'paypal'>('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'credit') {
      // Validar número de tarjeta
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (!cleanCardNumber || cleanCardNumber.trim() === '') {
        newErrors.cardNumber = 'El número de tarjeta es requerido';
      } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        newErrors.cardNumber = 'El número de tarjeta debe tener entre 13 y 19 dígitos';
      } else if (!/^\d+$/.test(cleanCardNumber)) {
        newErrors.cardNumber = 'El número de tarjeta solo puede contener dígitos';
      }

      // Validar fecha de vencimiento
      if (!expiryDate || expiryDate.trim() === '') {
        newErrors.expiryDate = 'La fecha de vencimiento es requerida';
      } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        newErrors.expiryDate = 'Formato inválido. Use MM/YY (ej: 12/25)';
      } else {
        // Validar que el mes sea válido (01-12)
        const [month, year] = expiryDate.split('/');
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        if (monthNum < 1 || monthNum > 12) {
          newErrors.expiryDate = 'El mes debe estar entre 01 y 12';
        } else if (yearNum < 0 || yearNum > 99) {
          newErrors.expiryDate = 'Año inválido';
        }
      }

      // Validar CVV
      if (!cvv || cvv.trim() === '') {
        newErrors.cvv = 'El código de seguridad es requerido';
      } else if (!/^\d{3,4}$/.test(cvv)) {
        newErrors.cvv = 'El CVV debe tener 3 o 4 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    const isValid = validateForm();
    
    if (!isValid) {
      // El mensaje de error ya se muestra en los campos individuales
      // Hacer scroll al primer campo con error
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
          // Buscar el input correspondiente
          const inputs = document.querySelectorAll('input');
          let targetInput: HTMLInputElement | null = null;
          
          if (firstErrorKey === 'cardNumber') {
            targetInput = Array.from(inputs).find(input => input.value === cardNumber || input.placeholder.includes('tarjeta')) as HTMLInputElement;
          } else if (firstErrorKey === 'expiryDate') {
            targetInput = Array.from(inputs).find(input => input.value === expiryDate || input.placeholder === 'MM/YY') as HTMLInputElement;
          } else if (firstErrorKey === 'cvv') {
            targetInput = Array.from(inputs).find(input => input.value === cvv || input.placeholder === '123') as HTMLInputElement;
          }
          
          if (targetInput) {
            targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetInput.focus();
          }
        }
      }, 100);
      return;
    }

    // Solo proceder si la validación pasó
    onPaymentSuccess({
      paymentMethod,
      cardNumber: paymentMethod === 'credit' ? cardNumber : undefined,
      notes,
    });
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Pagar Factura
      </h2>

      {/* Métodos de pago */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Método de Pago
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('credit')}
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              paymentMethod === 'credit'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M1 10h22" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="font-semibold text-gray-900 dark:text-white">VISA</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              paymentMethod === 'paypal'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0070ba">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.193zm-.4-12.403c-.115.74-.176 1.399-.23 2.02l-.653 4.19h2.19c3.5 0 6.664-1.35 7.664-5.785.04-.22.07-.43.095-.64.226-1.325.12-2.26-.365-3.08-.5-.87-1.5-1.31-3.13-1.31H6.64l-1.964 12.625z"/>
              </svg>
              <span className="font-semibold text-gray-900 dark:text-white">PayPal</span>
            </div>
          </button>
        </div>
      </div>

      {/* Monto a pagar */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Monto a pagar
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Formulario de tarjeta (solo si es crédito) */}
      {paymentMethod === 'credit' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de tarjeta *
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de vencimiento *
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                Código de seguridad *
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  title="El CVV es el código de 3 o 4 dígitos en el reverso de tu tarjeta"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales para tu pedido..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagar {formatCurrency(amount)}
              </>
            )}
          </button>
        </form>
      )}

      {/* PayPal (simulado) */}
      {paymentMethod === 'paypal' && (
        <div className="space-y-4">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Serás redirigido a PayPal para completar tu pago de forma segura.
            </p>
            <button
              type="button"
              onClick={() => {
                // Simular redirección a PayPal
                setTimeout(() => {
                  onPaymentSuccess({
                    paymentMethod: 'paypal',
                    notes: 'Pago realizado mediante PayPal',
                  });
                }, 1000);
              }}
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.193zm-.4-12.403c-.115.74-.176 1.399-.23 2.02l-.653 4.19h2.19c3.5 0 6.664-1.35 7.664-5.785.04-.22.07-.43.095-.64.226-1.325.12-2.26-.365-3.08-.5-.87-1.5-1.31-3.13-1.31H6.64l-1.964 12.625z"/>
                  </svg>
                  Pagar con PayPal
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales para tu pedido..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Mensaje de seguridad */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Tu información está protegida y encriptada</span>
      </div>
    </div>
  );
}

