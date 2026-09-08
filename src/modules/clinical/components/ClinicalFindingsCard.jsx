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

/**
 * ClinicalFindingsCard — vital signs inputs with auto-formatting, chief complaint,
 * examination findings, and autocomplete multi-tag diagnosis selector.
 *
 * @param {Object}   props
 * @param {Object}   props.vitals                   – { bloodPressure, heartRate, temperature, weight, height, spo2, randomBloodSugar }
 * @param {Function} props.onUpdateVital            – (field, value) => void
 * @param {Object}   props.clinicalNotes            – { chiefComplaint, examinationFindings }
 * @param {Function} props.onUpdateNote             – (field, value) => void
 * @param {string[]} props.finalDiagnoses           – Selected diagnosis tags
 * @param {string}   props.diagnosisInput           – Current search input value
 * @param {Function} props.onDiagnosisInputChange   – (value) => void
 * @param {boolean}  props.showDiagnosisDropdown    – Whether dropdown is visible
 * @param {Function} props.onShowDropdown           – () => void
 * @param {Object}   props.diagnosisContainerRef    – Ref for click-outside detection
 * @param {string[]} props.filteredDiagnoses        – Filtered autocomplete results
 * @param {Function} props.onAddDiagnosis           – (value) => void
 * @param {Function} props.onRemoveDiagnosis        – (tag) => void
 * @param {Function} props.onDiagnosisKeyDown       – Keyboard handler
 */
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
}) {
  /**
   * Automatic slash insertion for Blood Pressure input e.g. "120" -> "120/"
   */
  const handleBloodPressureChange = (e) => {
    const rawVal = e.target.value;
    const prevVal = vitals.bloodPressure || '';
    const isDeleting = rawVal.length < prevVal.length;

    let formatted = rawVal;
    if (!isDeleting) {
      const clean = rawVal.replace(/[^\d\/]/g, '');
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
          الفحص الطبي والعلامات الحيوية (Clinical Examination &amp; Vitals)
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6 !overflow-visible">
        {/* Vital Signs Grid (بيانات الكشف / العلامات الحيوية) */}
        <div className="p-4 rounded-xl border border-clinic-200/80 bg-clinic-50/30 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-clinic-900 m-0 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-clinic-600 shrink-0" />
            العلامات الحيوية (Vital Signs)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Blood Pressure */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Activity className="h-3 w-3 text-red-500" />
                ضغط الدم (BP)
              </label>
              <input
                type="text"
                placeholder="120/80"
                value={vitals.bloodPressure || ''}
                onChange={handleBloodPressureChange}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
              />
            </div>

            {/* Heart Rate */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Heart className="h-3 w-3 text-rose-500" />
                نبض القلب (Pulse)
              </label>
              <input
                type="text"
                placeholder="75 bpm"
                value={vitals.heartRate || ''}
                onChange={(e) => onUpdateVital('heartRate', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-amber-500" />
                الحرارة (Temp)
              </label>
              <input
                type="text"
                placeholder="37.0 °C"
                value={vitals.temperature || ''}
                onChange={(e) => onUpdateVital('temperature', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Weight className="h-3 w-3 text-indigo-500" />
                الوزن (Weight)
              </label>
              <input
                type="text"
                placeholder="70 kg"
                value={vitals.weight || ''}
                onChange={(e) => onUpdateVital('weight', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Ruler className="h-3 w-3 text-blue-500" />
                الطول (Height)
              </label>
              <input
                type="text"
                placeholder="175 cm"
                value={vitals.height || ''}
                onChange={(e) => onUpdateVital('height', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
              />
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Wind className="h-3 w-3 text-cyan-500" />
                أكسجين الدم (SpO2)
              </label>
              <input
                type="text"
                placeholder="98 %"
                value={vitals.spo2 || ''}
                onChange={(e) => onUpdateVital('spo2', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
              />
            </div>

            {/* Random Blood Sugar */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Droplet className="h-3 w-3 text-emerald-500" />
                سكر الدم (RBS)
              </label>
              <input
                type="text"
                placeholder="110 mg/dL"
                value={vitals.randomBloodSugar || ''}
                onChange={(e) => onUpdateVital('randomBloodSugar', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Text fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              الشكوى الرئيسية (Chief Complaint) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={clinicalNotes.chiefComplaint}
              onChange={(e) => onUpdateNote('chiefComplaint', e.target.value)}
              placeholder="مثال: آلام شديدة بالحلق مع ارتفاع في درجة الحرارة..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500"
            />
          </div>

          {/* Physical Examination */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              الفحص الإكلينيكي (Physical Examination)
            </label>
            <textarea
              rows={3}
              value={clinicalNotes.examinationFindings}
              onChange={(e) =>
                onUpdateNote('examinationFindings', e.target.value)
              }
              placeholder="مثال: التهاب واحمرار باللوزتين..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500"
            />
          </div>
        </div>

        {/* Diagnosis autocomplete multi-tag */}
        <div className="relative" ref={diagnosisContainerRef}>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
            التشخيص النهائي (Final Diagnosis) <span className="text-red-500">*</span>
          </label>

          <div
            className="min-h-[46px] p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-clinic-500 flex flex-wrap items-center gap-2 cursor-text"
            onClick={onShowDropdown}
          >
            {finalDiagnoses.map((diag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-clinic-100 text-clinic-900 border border-clinic-200 rounded-lg text-xs font-bold"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{diag}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDiagnosis(diag);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={diagnosisInput}
              onChange={(e) => {
                onDiagnosisInputChange(e.target.value);
                onShowDropdown();
              }}
              onKeyDown={onDiagnosisKeyDown}
              placeholder={
                finalDiagnoses.length === 0
                  ? 'ابحث عن التشخيص أو اكتب تشخيصاً جديداً...'
                  : 'أضف تشخيصاً آخر...'
              }
              className="flex-1 min-w-[200px] border-none bg-transparent text-xs font-semibold focus:outline-none p-1"
            />
          </div>

          {/* Dropdown */}
          {showDiagnosisDropdown &&
            (diagnosisInput.trim().length > 0 ||
              filteredDiagnoses.length > 0) && (
              <div className="absolute top-full left-0 right-0 z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1">
                {filteredDiagnoses.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onAddDiagnosis(diagnosisInput)}
                    className="w-full text-left px-4 py-2.5 hover:bg-clinic-50 text-xs font-semibold text-clinic-700"
                  >
                    إضافة تشخيص مخصص: &quot;{diagnosisInput}&quot;
                  </button>
                ) : (
                  filteredDiagnoses.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onAddDiagnosis(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-clinic-50 text-xs font-medium text-slate-800 flex justify-between"
                    >
                      {item}{' '}
                      <span className="font-bold text-clinic-600">+ إضافة</span>
                    </button>
                  ))
                )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
