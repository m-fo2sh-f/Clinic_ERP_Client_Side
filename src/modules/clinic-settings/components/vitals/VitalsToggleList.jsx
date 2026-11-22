import React from 'react';
import { Activity, Plus, Trash2, Check } from 'lucide-react';
import { STANDARD_VITALS_CONFIG } from '../../constants/vitalsConstants';

export default function VitalsToggleList({
  enabledKeys = [],
  customVitals = [],
  onToggleKey,
  onRemoveCustomVital,
  onOpenAddModal,
  disabled,
}) {
  const isKeyActive = (key) => enabledKeys.includes(key);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-clinic-600" />
          <h3 className="text-sm font-bold text-slate-800 m-0">
            (Active Vital Signs)
          </h3>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenAddModal}
          className="px-3 py-1.5 bg-clinic-50 text-clinic-700 hover:bg-clinic-100 border border-clinic-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة علامة حيوية مخصصة</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 m-0">
        قم بتفعيل أو تعطيل العلامات التي ترغب بظهورها في بطاقة الكشف الطبي وعند كتابة الروشتة:
      </p>

      {/* Standard Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STANDARD_VITALS_CONFIG.map((vital) => {
          const active = isKeyActive(vital.key);
          return (
            <div
              key={vital.key}
              onClick={() => !disabled && onToggleKey(vital.key)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${active
                ? 'border-clinic-500 bg-clinic-50/50 text-slate-900 shadow-xs'
                : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:border-slate-300'
                }`}
            >
              <div>
                <strong className={`block text-xs font-bold ${active ? 'text-slate-800' : 'text-slate-500'}`}>
                  {vital.label}
                </strong>
                <span className="text-[10px] text-slate-400 font-mono">
                  {vital.labelEn} ({vital.unit})
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${active ? 'bg-clinic-600 text-white' : 'border border-slate-300 bg-white'
                  }`}
              >
                {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Vitals Section */}
      {customVitals.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 m-0">
            العلامات الحيوية المخصصة (Custom Vitals):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {customVitals.map((custom) => {
              const active = isKeyActive(custom.key);
              return (
                <div
                  key={custom.key}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${active ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                >
                  <div
                    onClick={() => !disabled && onToggleKey(custom.key)}
                    className="flex-1 cursor-pointer select-none"
                  >
                    <strong className="block text-xs font-bold text-slate-800">
                      {custom.label}
                    </strong>
                    <span className="text-[10px] text-amber-700 font-mono">
                      وحدة: {custom.unit || '-'}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemoveCustomVital(custom.key)}
                    className="p-1 hover:bg-red-100 text-red-500 rounded-md transition-colors cursor-pointer"
                    title="حذف القياس المخصص"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
