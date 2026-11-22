import React from 'react';
import { Sparkles, Stethoscope, Baby, Eye, Sparkle } from 'lucide-react';
import { SPECIALTY_VITALS_PRESETS } from '../../constants/vitalsConstants';

const PRESET_ICONS = {
  internal_medicine: Stethoscope,
  pediatrics: Baby,
  ophthalmology: Eye,
  dermatology: Sparkle,
};

export default function SpecialtyVitalsPresets({ onApplyPreset, disabled }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-clinic-600" />
        <h3 className="text-sm font-bold text-slate-800 m-0">
          قوالب التخصصات الجاهزة بنقرة واحدة (1-Click Specialty Presets)
        </h3>
      </div>
      <p className="text-xs text-slate-500 m-0">
        اختر تخصصك لتفعيل مجموعة القياسات الحيوية الأكثر ملاءمة لطبيعة عيادتك تلقائياً:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SPECIALTY_VITALS_PRESETS.map((preset) => {
          const Icon = PRESET_ICONS[preset.id] || Stethoscope;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onApplyPreset(preset)}
              className="p-3.5 text-right border border-slate-200 hover:border-clinic-500 hover:bg-clinic-50/40 rounded-xl transition-all cursor-pointer disabled:opacity-50 group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-lg bg-clinic-100 text-clinic-700 group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <strong className="text-xs font-bold text-slate-800 group-hover:text-clinic-700">
                  {preset.name}
                </strong>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed m-0">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
