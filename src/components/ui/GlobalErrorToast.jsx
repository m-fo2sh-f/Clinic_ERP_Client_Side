import React, { useState, useEffect } from 'react';
import { AlertCircle, X, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function GlobalErrorToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleApiError = (e) => {
      const { status, message, errorCode } = e.detail || {};
      const id = Date.now() + Math.random().toString(36).substring(2, 6);

      const newToast = {
        id,
        status,
        message: message || 'حدث خطأ في معالجة طلبك.',
        errorCode,
      };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    window.addEventListener('app:api-error', handleApiError);
    return () => window.removeEventListener('app:api-error', handleApiError);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isForbidden = toast.status === 403;
        const isConflict = toast.status === 409;
        const isValidation = toast.status === 422;

        const borderClass = isForbidden
          ? 'border-amber-300 bg-amber-50 text-amber-900'
          : isConflict
          ? 'border-orange-300 bg-orange-50 text-orange-900'
          : isValidation
          ? 'border-sky-300 bg-sky-50 text-sky-900'
          : 'border-rose-300 bg-rose-50 text-rose-900';

        const IconComponent = isForbidden ? ShieldAlert : isConflict ? AlertTriangle : AlertCircle;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg backdrop-blur-xs animate-slideUp transition-all ${borderClass}`}
          >
            <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug">{toast.message}</p>
              {toast.errorCode && (
                <p className="text-[10px] opacity-75 font-mono mt-0.5">{toast.errorCode}</p>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
