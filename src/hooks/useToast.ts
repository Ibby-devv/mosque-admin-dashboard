// ============================================================================
// HOOK: Toast Management
// Location: mosque-admin-dashboard/src/hooks/useToast.ts
// ============================================================================

import { useState, useCallback } from 'react';
import { ToastItem } from '../components/ui/ToastContainer';
import { ToastVariant } from '../components/ui/Toast';

export interface ShowToastOptions {
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((options: ShowToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = {
      id,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({ variant: 'success', message, title });
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast({ variant: 'error', message, title });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({ variant: 'warning', message, title });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({ variant: 'info', message, title });
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
