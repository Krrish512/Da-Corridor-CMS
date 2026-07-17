import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { removeToast(id); }, 4000);
  }, [removeToast]);

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return { borderLeftColor: '#D4AF37', iconColor: '#D4AF37' };
      case 'error':
        return { borderLeftColor: '#ef4444', iconColor: '#ef4444' };
      case 'info':
      default:
        return { borderLeftColor: '#0A2540', iconColor: '#0A2540' };
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Portal Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type);
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-neutral-900 shadow-arch-lg transition-all duration-300 animate-slide-in"
              style={{
                borderLeft: `3px solid ${style.borderLeftColor}`,
                border: '1px solid rgba(10,37,64,0.08)',
                borderLeftWidth: '3px',
                borderLeftColor: style.borderLeftColor,
              }}
            >
              {/* Icons */}
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: style.iconColor }} />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: style.iconColor }} />}
              {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: style.iconColor }} />}

              {/* Content */}
              <div className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {toast.message}
              </div>

              {/* Close */}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
