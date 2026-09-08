import React from 'react';
import { Building2, CheckCircle2, UserCheck, CalendarDays, Clock, Loader2 } from 'lucide-react';

export default function MetricsGrid({ metrics, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between animate-pulse shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-bl-xl" />
            </div>
            <div className="h-7 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalTenants = metrics?.total_tenants ?? 0;
  const activeTenants = metrics?.active_tenants ?? 0;
  const activePercent = totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) : 100;

  const items = [
    {
      title: 'Total Clinics',
      value: totalTenants,
      icon: Building2,
      iconColor: 'text-clinic-600',
      iconBg: 'bg-clinic-50',
      badge: 'Platform Wide',
      badgeClass: 'text-slate-500 bg-slate-100',
    },
    {
      title: 'Active Clinics',
      value: activeTenants,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      badge: `${activePercent}% Active`,
      badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    },
    {
      title: 'Verified Doctors',
      value: metrics?.total_doctors ?? 0,
      icon: UserCheck,
      iconColor: 'text-clinic-600',
      iconBg: 'bg-clinic-50',
      badge: 'Medical Staff',
      badgeClass: 'text-slate-500 bg-slate-100',
    },
    {
      title: 'Total Bookings',
      value: metrics?.total_appointments ?? 0,
      icon: CalendarDays,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      badge: 'All Branches',
      badgeClass: 'text-slate-500 bg-slate-100',
    },
    {
      title: "Today's Bookings",
      value: metrics?.today_appointments ?? 0,
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      badge: 'Today',
      badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-clinic-300 transition-all"
          >
            {/* Top-right corner icon container */}
            <div className={`absolute top-0 right-0 p-3.5 ${item.iconBg} ${item.iconColor} rounded-bl-xl transition-colors`}>
              <Icon className="h-5 w-5" />
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {item.title}
            </p>

            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {Number(item.value).toLocaleString()}
            </p>

            <div className="flex items-center gap-1.5 mt-3 text-xs">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${item.badgeClass}`}>
                {item.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
