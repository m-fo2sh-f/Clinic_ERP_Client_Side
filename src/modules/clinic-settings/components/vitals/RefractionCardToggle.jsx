import React from 'react';
import { Eye, Check } from 'lucide-react';

export default function RefractionCardToggle({
  enableRefraction = false,
  onToggleRefraction,
  disabled,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 m-0">
              بطاقة قياس وفحص النظر وانكسار العين (OD / OS Eye Refraction Card)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 m-0">
              تفعيل جدول فحص النظر المخصص لعيادات العيون (SPH, CYL, AXIS, VA, IOP, PD) في شاشة الكشف والروشتة.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggleRefraction(!enableRefraction)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
            enableRefraction ? 'bg-clinic-600' : 'bg-slate-200'
          }`}
          role="switch"
          aria-checked={enableRefraction}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              enableRefraction ? '-translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {enableRefraction && (
        <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl text-xs text-sky-900 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-sky-600 shrink-0" />
          <span>
            تم تفعيل بطاقة انكسار العين: ستظهر شبكة تفصيلية للعين اليمنى (OD) واليسرى (OS) في شاشة كشف الطبيب وعند إدراجها بالروشتة.
          </span>
        </div>
      )}
    </div>
  );
}
