import React from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Wind,
  Droplet,
} from 'lucide-react';

/**
 * SoloVitalsCard — Single Responsibility Component
 * Standardized vital signs input grid matching clinical guidelines with auto-formatting & BMI calculation.
 */
export default function SoloVitalsCard({
  vitals = {},
  onVitalChange,
  onBloodPressureChange,
  bmi = null,
  bmiCategory = null,
  disabled = false,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Header & Live BMI Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-clinic-600" />
          العلامات الحيوية (Vital Signs)
        </h3>
        {bmi && (
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-2 ${bmiCategory?.color}`}
          >
            <span>مؤشر كتلة الجسم (BMI): {bmi}</span>
            <span className="opacity-75 text-[10px]">({bmiCategory?.label})</span>
          </div>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Blood Pressure */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-red-500" />
            ضغط الدم (BP)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="120/80"
            value={vitals.bloodPressure || vitals.bp || ''}
            onChange={onBloodPressureChange}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>

        {/* Heart Rate / Pulse */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            معدل النبض (Pulse)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="75 bpm"
            value={vitals.heartRate || vitals.pulse || ''}
            onChange={(e) => onVitalChange('heartRate', e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>

        {/* Temperature */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5 text-amber-500" />
            حرارة الجسم (Temp)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="37.0 °C"
            value={vitals.temperature || ''}
            onChange={(e) => onVitalChange('temperature', e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>

        {/* Weight */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Weight className="h-3.5 w-3.5 text-indigo-500" />
            الوزن (Weight)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="70 kg"
            value={vitals.weight || ''}
            onChange={(e) => onVitalChange('weight', e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>

        {/* Height */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5 text-blue-500" />
            الطول (Height)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="175 cm"
            value={vitals.height || ''}
            onChange={(e) => onVitalChange('height', e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>

        {/* SpO2 */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Wind className="h-3.5 w-3.5 text-cyan-500" />
            نسبة الأكسجين (SpO2)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="98 %"
            value={vitals.spo2 || ''}
            onChange={(e) => onVitalChange('spo2', e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>

        {/* Random Blood Sugar */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Droplet className="h-3.5 w-3.5 text-emerald-500" />
            سكر الدم (RBS)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="110 mg/dL"
            value={vitals.randomBloodSugar || vitals.rbs || ''}
            onChange={(e) => onVitalChange('randomBloodSugar', e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>

        {/* Respiratory Rate */}
        <div className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-purple-500" />
            معدل التنفس (Resp)
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="16 /min"
            value={vitals.respiratoryRate || ''}
            onChange={(e) => onVitalChange('respiratoryRate', e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold text-slate-800 disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
