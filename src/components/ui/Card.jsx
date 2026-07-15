import React from 'react';

export const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = ({ className = '', ...props }) => (
  <div className={`p-5 flex flex-col space-y-1.5 border-b border-slate-100 ${className}`} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`text-base font-semibold leading-none tracking-tight text-slate-900 ${className}`} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className = '', ...props }) => (
  <p className={`text-xs text-slate-500 ${className}`} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className = '', ...props }) => (
  <div className={`p-5 ${className}`} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className = '', ...props }) => (
  <div className={`p-5 flex items-center border-t border-slate-100 bg-slate-50/50 ${className}`} {...props} />
);
CardFooter.displayName = 'CardFooter';
