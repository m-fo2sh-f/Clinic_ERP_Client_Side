import React from 'react';

const Button = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'md',
  type = 'button',
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    default: 'bg-clinic-600 hover:bg-clinic-700 text-white shadow focus:ring-clinic-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow focus:ring-emerald-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-500',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-500',
    ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600 focus:ring-slate-500',
    destructive: 'bg-red-600 hover:bg-red-700 text-white shadow focus:ring-red-500',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const combinedStyles = `${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      className={combinedStyles}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
