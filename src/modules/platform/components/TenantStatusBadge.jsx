import React from 'react';
import Badge from '../../../components/ui/Badge';

export default function TenantStatusBadge({ isActive, className = '' }) {
  if (isActive) {
    return (
      <Badge
        variant="success"
        className={`font-semibold text-xs gap-1.5 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="destructive"
      className={`font-semibold text-xs gap-1.5 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Suspended
    </Badge>
  );
}
