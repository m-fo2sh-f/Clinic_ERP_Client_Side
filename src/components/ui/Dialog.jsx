import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Dialog = ({ isOpen, onClose, children }) => {
  // Prevent body scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Modal Contents */}
      <div className="relative z-50 w-full max-w-lg scale-100 rounded-xl bg-white p-6 shadow-2xl border border-slate-200/80 transition-all m-4 hover:shadow-clinic-100/50">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ children, className = '' }) => (
  <div className={`mb-4 flex flex-col space-y-1.5 ${className}`}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold text-slate-900 tracking-tight ${className}`}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 leading-relaxed ${className}`}>
    {children}
  </p>
);

export const DialogFooter = ({ children, className = '' }) => (
  <div className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 ${className}`}>
    {children}
  </div>
);

export const DialogClose = ({ onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer ${className}`}
  >
    <X className="h-5 w-5" />
    <span className="sr-only">Close</span>
  </button>
);
