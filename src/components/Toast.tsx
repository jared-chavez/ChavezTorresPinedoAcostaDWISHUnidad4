'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${typeStyles[type]} border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-xl font-bold">{icons[type]}</span>
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}


