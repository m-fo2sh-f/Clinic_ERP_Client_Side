import React, { useMemo } from 'react';
import { Activity, Gauge, Flame, Wind, Scale, Ruler } from 'lucide-react';

const getVitalIcon = (key) => {
  switch (key) {
    case 'bp_systolic':
    case 'bp_diastolic':
      return Gauge;
    case 'heart_rate':
      return Activity;
    case 'temperature':
      return Flame;
    case 'respiratory_rate':
    case 'spo2':
      return Wind;
    case 'weight':
      return Scale;
    case 'height':
      return Ruler;
    default:
      return Activity;
  }
};

export default function DynamicVitalsForm({ vitalsConfig = [], vitals = {}, onChange, disabled = false }) {
  // Real-time BMI calculation if weight (kg) and height (cm) exist
  const bmi = useMemo(() => {
    const weight = parseFloat(vitals?.weight);
    const height = parseFloat(vitals?.height);
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const val = weight / (heightInMeters * heightInMeters);
      return val.toFixed(1);
    }
    return null;
  }, [vitals?.weight, vitals?.height]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const num = parseFloat(bmi);
    if (num < 18.5) return { label: 'نقص في الوزن (Underweight)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (num < 25) return { label: 'وزن مثالي (Normal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (num < 30) return { label: 'زيادة في الوزن (Overweight)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'سمنة (Obese)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  }, [bmi]);

  if (!Array.isArray(vitalsConfig) || vitalsConfig.length === 0) {
    return (
      <div className="p-4 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl text-center">
        لا توجد علامات حيوية مهيأة في إعدادات العيادة
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-clinic-600" />
          العلامات الحيوية (Vital Signs)
        </h3>
        {bmi && (
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-2 ${bmiCategory?.color}`}>
            <span>مؤشر كتلة الجسم (BMI): {bmi}</span>
            <span className="opacity-75 text-[10px]">({bmiCategory?.label})</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {vitalsConfig.map((field) => {
          const Icon = getVitalIcon(field.key);
          const val = vitals?.[field.key] ?? '';

          return (
            <div
              key={field.key}
              className="bg-white border border-slate-200/90 rounded-xl p-2.5 hover:border-clinic-300 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-500 truncate" title={field.label}>
                  {field.label}
                </span>
                <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </div>
              <div className="flex items-center gap-1">
                <input
                  type={field.type || 'text'}
                  step={field.step || '1'}
                  disabled={disabled}
                  value={val}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder="--"
                  className="w-full text-sm font-semibold text-slate-800 bg-transparent border-0 p-0 focus:ring-0 outline-none"
                />
                {field.unit && (
                  <span className="text-[10px] font-medium text-slate-400 shrink-0">
                    {field.unit}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
