import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { CLINICAL_TOGGLES } from '../../constants/templateOptions';

export default function ClinicalTogglesCard({
  settings = {},
  onToggleChange,
  disabled = false,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in text-left" dir="ltr">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">Clinical Content &amp; Print Controls</h3>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            Configure clinical sections, medical diagnostics, refraction cards, and verification elements rendered on the prescription.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {CLINICAL_TOGGLES.map((item) => {
          const Icon = item.icon;
          const isEnabled = settings?.[item.key] !== false;

          return (
            <div
              key={item.key}
              onClick={() => !disabled && onToggleChange?.(item.key, !isEnabled)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs select-none ${
                isEnabled
                  ? 'border-blue-300 bg-blue-50/40 text-slate-800 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50/60 text-slate-600'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${isEnabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs m-0">{item.label}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal mt-0.5 m-0">{item.desc}</p>
                </div>
              </div>

              <div className="shrink-0">
                {isEnabled ? (
                  <ToggleRight className="h-6 w-6 text-blue-600 drop-shadow-xs" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
