import React from 'react';
import { Building2, CheckCircle2, UserCheck, CalendarDays, Clock, Loader2 } from 'lucide-react';

export default function MetricsGrid({ metrics, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center animate-pulse"
          >
            <Loader2 className="h-6 w-6 text-slate-600 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'إجمالي العيادات',
      value: metrics?.total_tenants ?? 0,
      icon: Building2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      badge: 'المنصة كاملة',
    },
    {
      title: 'العيادات النشطة',
      value: metrics?.active_tenants ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: `${metrics?.total_tenants ? Math.round(((metrics?.active_tenants || 0) / metrics.total_tenants) * 100) : 100}% نشط`,
    },
    {
      title: 'إجمالي الأطباء',
      value: metrics?.total_doctors ?? 0,
      icon: UserCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      badge: 'طاقم طبي معتمد',
    },
    {
      title: 'إجمالي الحجوزات',
      value: metrics?.total_appointments ?? 0,
      icon: CalendarDays,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
      badge: 'كافة الفروع',
    },
    {
      title: 'حجوزات اليوم',
      value: metrics?.today_appointments ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'اليوم',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all rounded-2xl p-5 shadow-xl backdrop-blur-md group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wide">
                {item.title}
              </span>
              <div className={`p-2 rounded-xl border ${item.bg} ${item.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {Number(item.value).toLocaleString('ar-EG')}
              </span>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                {item.badge}
              </span>
            </div>

            {/* Subtle glow accent on hover */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          </div>
        );
      })}
    </div>
  );
}
