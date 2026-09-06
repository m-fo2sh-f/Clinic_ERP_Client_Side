import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'md',
  type = 'button',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled = false,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

  const variants = {
    default: 'bg-clinic-600 hover:bg-clinic-700 text-white shadow focus:ring-clinic-500',
    primary: 'bg-clinic-600 hover:bg-clinic-700 text-white shadow focus:ring-clinic-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow focus:ring-emerald-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-500',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-500',
    ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600 focus:ring-slate-500',
    destructive: 'bg-red-600 hover:bg-red-700 text-white shadow focus:ring-red-500',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  const isActuallyDisabled = disabled || isLoading;
  const combinedStyles = `${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isActuallyDisabled}
      aria-busy={isLoading}
      className={combinedStyles}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
