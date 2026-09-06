import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, X, ExternalLink, Loader2 } from 'lucide-react';

export default function ImpersonateConfirmModal({ isOpen, onClose, onConfirm, tenant, isPending }) {
  if (!isOpen || !tenant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-right overflow-hidden">
        {/* Header with close button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">تأكيد تقمص هوية مالك العيادة</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 mb-1">تنبيه أمني وإجراء مسجل (Audit Logging):</p>
              أنت على وشك الدخول كمالك عيادة <span className="font-bold text-white font-mono">[{tenant.id}]</span>.
              سيتم إنشاء توكن مؤقت مسجل بعنوان الـ IP الخاص بك وحفظه بصورة غير قابلة للتعديل في سجل تدقيق المنصة.
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">اسم العيادة:</span>
              <span className="font-bold text-white">{tenant.clinic_name || tenant.id}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">نطاق الدومين:</span>
              <span className="font-mono text-clinic-400">{tenant.domain}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">مدة صلاحية الجلسة:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                <Clock className="h-3.5 w-3.5" />
                15 دقيقة فقط (تنتهي تلقائياً)
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold text-xs transition-colors"
          >
            إلغاء التراجع
          </button>
          <button
            type="button"
            onClick={() => onConfirm(tenant.id)}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري إنشاء الجلسة والتحويل...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                تأكيد الدخول كمالك العيادة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
