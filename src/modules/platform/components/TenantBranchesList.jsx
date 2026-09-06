import React from 'react';
import { Building2, MapPin, Phone, CheckCircle2, XCircle } from 'lucide-react';

export default function TenantBranchesList({ branches }) {
  if (!branches || branches.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
        <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-300">لا توجد فروع مسجلة</p>
        <p className="text-xs text-slate-500 mt-1">هذه العيادة لم تقم بإنشاء أي فروع حتى الآن.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {branches.map((branch) => (
        <div
          key={branch.id}
          className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-clinic-600/10 border border-clinic-500/20 text-clinic-400 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              {branch.is_active ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  نشط
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircle className="h-3 w-3" />
                  معطل
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-white mb-2 group-hover:text-clinic-400 transition-colors">
              {branch.name}
            </h4>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>{branch.address || 'العنوان غير محدد'}</span>
              </div>
              {branch.phone && (
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{branch.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Branch ID</span>
            <span className="font-mono text-slate-400 truncate max-w-[150px]">{branch.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
