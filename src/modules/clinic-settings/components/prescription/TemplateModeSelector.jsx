import React from 'react';
import { PRESCRIPTION_MODES } from '../../constants/prescriptionConstants';

export default function TemplateModeSelector({ selectedMode = 'builtin', onSelectMode, disabled = false }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">نمط وشكل طباعة الروشتة (Prescription Printing Mode)</h3>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            حدد كيف يتم إخراج الروشتة عند الضغط على أمر الطباعة في شاشة الكشف الطبي.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {PRESCRIPTION_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(mode.id)}
              className={`text-right p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs space-y-3 disabled:opacity-60 disabled:cursor-not-allowed ${
                isSelected
                  ? `${mode.accent} ${mode.ring} shadow-xs font-semibold`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white shadow-2xs' : 'bg-slate-100'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/60">
                    {mode.badge}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs m-0">{mode.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal m-0">{mode.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
