'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Popup, PopupType } from '@/components/Popup';

interface PopupData {
  id: string;
  type: PopupType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showPopup: (type: PopupType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [popups, setPopups] = useState<PopupData[]>([]);

  const showPopup = useCallback((type: PopupType, message: string, title?: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPopups((prev) => [...prev, { id, type, message, title, duration }]);
  }, []);

  const success = useCallback((message: string, title?: string, duration?: number) => {
    showPopup('success', message, title, duration);
  }, [showPopup]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    showPopup('error', message, title, duration);
  }, [showPopup]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    showPopup('info', message, title, duration);
  }, [showPopup]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    showPopup('warning', message, title, duration);
  }, [showPopup]);

  const removePopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((popup) => popup.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showPopup, success, error, info, warning }}>
      {children}
      
      {/* Popup Container - Only show the last popup */}
      {popups.length > 0 && (
        <Popup
          key={popups[popups.length - 1].id}
          id={popups[popups.length - 1].id}
          type={popups[popups.length - 1].type}
          title={popups[popups.length - 1].title}
          message={popups[popups.length - 1].message}
          duration={popups[popups.length - 1].duration}
          onClose={removePopup}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
