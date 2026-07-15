import React from 'react';

const Badge = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors';
  
  const variants = {
    default: 'bg-clinic-100 text-clinic-800 border border-clinic-200',
    secondary: 'bg-slate-100 text-slate-800 border border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    destructive: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  };

  const combinedStyles = `${baseStyles} ${variants[variant] || variants.default} ${className}`;

  return (
    <span className={combinedStyles} {...props}>
      {children}
    </span>
  );
};

export default Badge;
