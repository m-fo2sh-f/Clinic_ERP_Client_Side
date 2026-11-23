import React from 'react';
import {
  FileText,
  Check,
  X,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Wind,
  Droplet,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import EyeRefractionForm from './EyeRefractionForm';

export default function ClinicalFindingsCard({
  vitals = {},
  onUpdateVital,
  clinicalNotes,
  onUpdateNote,
  finalDiagnoses,
  diagnosisInput,
  onDiagnosisInputChange,
  showDiagnosisDropdown,
  onShowDropdown,
  diagnosisContainerRef,
  filteredDiagnoses,
  onAddDiagnosis,
  onRemoveDiagnosis,
  onDiagnosisKeyDown,
  vitalsConfig = null,
}) {
  const isEnabled = (key) => {
    if (!vitalsConfig?.enabled_keys || !Array.isArray(vitalsConfig.enabled_keys)) return true;
    const enabled = vitalsConfig.enabled_keys;
    if (enabled.includes(key)) return true;
    if ((key === 'blood_glucose' || key === 'blood_sugar') && (enabled.includes('blood_glucose') || enabled.includes('blood_sugar') || enabled.includes('rbs'))) return true;
    if ((key === 'oxygen_saturation' || key === 'spo2') && (enabled.includes('oxygen_saturation') || enabled.includes('spo2'))) return true;
    if ((key === 'respiratory_rate' || key === 'rr') && (enabled.includes('respiratory_rate') || enabled.includes('rr'))) return true;
    return false;
  };

  const handleBloodPressureChange = (e) => {
    const rawVal = e.target.value;
    const prevVal = vitals.bloodPressure || '';
    const isDeleting = rawVal.length < prevVal.length;

    let formatted = rawVal;
    if (!isDeleting) {
      const clean = rawVal.replace(/[^\d/]/g, '');
      const digitsOnly = clean.replace(/\D/g, '');

      if (digitsOnly.length === 3 && !clean.includes('/')) {
        formatted = `${digitsOnly}/`;
      } else if (digitsOnly.length > 3 && !clean.includes('/')) {
        formatted = `${digitsOnly.slice(0, 3)}/${digitsOnly.slice(3, 6)}`;
      } else {
        formatted = clean;
      }
    }

    onUpdateVital('bloodPressure', formatted);
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white rounded-2xl !overflow-visible">
      <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
          <FileText className="h-5 w-5 text-clinic-600 shrink-0" />
          Clinical Examination &amp; Vitals
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6 !overflow-visible">
        {/* Vital Signs Grid */}
        <div className="p-4 rounded-xl border border-clinic-200/80 bg-clinic-50/30 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-clinic-900 m-0 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-clinic-600 shrink-0" />
            Vital Signs
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {isEnabled('blood_pressure') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-red-500" />
                  Blood Pressure (BP)
                </label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={vitals.bloodPressure || ''}
                  onChange={handleBloodPressureChange}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {isEnabled('heart_rate') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-rose-500" />
                  Heart Rate (Pulse)
                </label>
                <input
                  type="text"
                  placeholder="75 bpm"
                  value={vitals.heartRate || ''}
                  onChange={(e) => onUpdateVital('heartRate', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {isEnabled('temperature') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-amber-500" />
                  Temperature (Temp)
                </label>
                <input
                  type="text"
                  placeholder="37.0 °C"
                  value={vitals.temperature || ''}
                  onChange={(e) => onUpdateVital('temperature', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {isEnabled('weight') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Weight className="h-3 w-3 text-indigo-500" />
                  Weight
                </label>
                <input
                  type="text"
                  placeholder="70 kg"
                  value={vitals.weight || ''}
                  onChange={(e) => onUpdateVital('weight', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {isEnabled('height') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-blue-500" />
                  Height
                </label>
                <input
                  type="text"
                  placeholder="175 cm"
                  value={vitals.height || ''}
                  onChange={(e) => onUpdateVital('height', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {isEnabled('oxygen_saturation') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Wind className="h-3 w-3 text-cyan-500" />
                  Blood Oxygen (SpO2)
                </label>
                <input
                  type="text"
                  placeholder="98 %"
                  value={vitals.spo2 || ''}
                  onChange={(e) => onUpdateVital('spo2', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {isEnabled('blood_glucose') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Droplet className="h-3 w-3 text-emerald-500" />
                  Blood Sugar (RBS)
                </label>
                <input
                  type="text"
                  placeholder="110 mg/dL"
                  value={vitals.randomBloodSugar || ''}
                  onChange={(e) => onUpdateVital('randomBloodSugar', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {isEnabled('respiratory_rate') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Wind className="h-3 w-3 text-teal-500" />
                  Respiratory Rate (RR)
                </label>
                <input
                  type="text"
                  placeholder="16 bpm"
                  value={vitals.respiratoryRate || vitals.respiratory_rate || ''}
                  onChange={(e) => {
                    onUpdateVital('respiratoryRate', e.target.value);
                    onUpdateVital('respiratory_rate', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                />
              </div>
            )}

            {/* Custom Vitals Dynamically (excluding ophthalmology refraction metrics) */}
            {vitalsConfig?.custom_vitals
              ?.filter((cv) => !['intraocular_pressure', 'visual_acuity', 'iop', 'va', 'sph', 'cyl', 'axis', 'refraction'].includes(cv.key.toLowerCase()))
              .map((cv) => (
                <div key={cv.key}>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-amber-500" />
                    {cv.label} {cv.unit ? `(${cv.unit})` : ''}
                  </label>
                  <input
                    type="text"
                    placeholder={cv.placeholder || '--'}
                    value={vitals[cv.key] || ''}
                    onChange={(e) => onUpdateVital(cv.key, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Refraction Card (Ophthalmology) */}
        {Boolean(vitalsConfig?.enable_refraction || vitalsConfig?.refraction_card_enabled) && (
          <EyeRefractionForm
            refractionData={vitals.refraction || vitals.visionData || {}}
            onChangeRefraction={(data) => onUpdateVital('refraction', data)}
          />
        )}

        {/* Text fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Chief Complaint <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={clinicalNotes.chiefComplaint}
              onChange={(e) => onUpdateNote('chiefComplaint', e.target.value)}
              placeholder="e.g. Severe sore throat with high fever..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Physical Examination
            </label>
            <textarea
              rows={3}
              value={clinicalNotes.examinationFindings}
              onChange={(e) => onUpdateNote('examinationFindings', e.target.value)}
              placeholder="e.g. Erythematous pharynx, enlarged tonsils..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500"
            />
          </div>
        </div>

        {/* Diagnosis autocomplete multi-tag */}
        <div className="relative" ref={diagnosisContainerRef}>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
            Final Diagnosis <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-clinic-500 focus-within:bg-white min-h-[42px]">
            {finalDiagnoses.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-clinic-600 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveDiagnosis(tag)}
                  className="hover:bg-clinic-700 p-0.5 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            <input
              type="text"
              value={diagnosisInput}
              onChange={(e) => onDiagnosisInputChange(e.target.value)}
              onFocus={onShowDropdown}
              onKeyDown={onDiagnosisKeyDown}
              placeholder={finalDiagnoses.length === 0 ? 'Type diagnosis...' : 'Add another...'}
              className="flex-1 min-w-[140px] bg-transparent border-0 text-xs focus:outline-hidden p-1 font-medium text-slate-800"
            />
          </div>

          {showDiagnosisDropdown && filteredDiagnoses.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {filteredDiagnoses.map((diag) => {
                const isSelected = finalDiagnoses.includes(diag);
                return (
                  <button
                    key={diag}
                    type="button"
                    onClick={() => onAddDiagnosis(diag)}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0"
                  >
                    <span className="font-semibold text-slate-800">{diag}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-clinic-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
