import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({
  className = '',
  children,
  error,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={`w-full appearance-none rounded-lg border border-slate-250 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all focus:border-clinic-500 focus:outline-none focus:ring-1 focus:ring-clinic-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
      </div>
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
