import React from 'react';
import { Sun, Moon, Sparkles, AlertCircle } from 'lucide-react';
import {
  PrescriptionHeader,
  PatientInfoBar,
  DiagnosisBox,
  MedicationsList,
  AdviceAndFollowUp,
  DoctorSignatureFooter,
} from './TemplateHelpers';

/**
 * DermatologyTemplate — Modern minimalist layout for Dermatology & Aesthetics clinics.
 * Features Morning / Evening skincare routine splits, cosmetic procedure notes,
 * and elegant typography tailored for aesthetic medicine.
 */
export default function DermatologyTemplate({
  settings = {},
  patient = {},
  doctor = {},
  branch = {},
  encounter = {},
  diagnoses = [],
  medications = [],
  advice = '',
  followUpDate = '',
  routineData = {},
}) {
  const primaryColor = settings?.primary_color || '#0284c7';
  const showDiagnosis = settings?.show_diagnosis !== false;
  const showQr = settings?.show_qr !== false;
  const showSerial = settings?.show_serial !== false;

  // Split routines (custom or defaults)
  const morningRoutine = routineData?.morning || [
    'غسول لطيف للبشرة صباحاً بالماء الفاتر.',
    'مرطب خفيف غير دهني (Oil-Free).',
    'واقي شمس واسع المدى SPF 50+ قبل الخروج بنصف ساعة ويجدد كل ساعتين.',
  ];

  const eveningRoutine = routineData?.evening || [
    'تنظيف البشرة بالغسول المخصص.',
    'دهان العلاج الموضعي / المقشر على أماكن الحبوب فقط قبل النوم.',
    'مرطب مرمم لحاجز البشرة (Barrier Repair Cream).',
  ];

  const procedureNotes = routineData?.procedureNotes || '';

  return (
    <div
      className="relative w-full h-full bg-white text-slate-800 p-6 flex flex-col justify-between selection:bg-none font-sans"
      dir="rtl"
    >
      {/* Aesthetics Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
        <svg width="280" height="280" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2Z" />
          <path d="M12 6v12" />
          <path d="M6 12h12" />
        </svg>
      </div>

      <div className="relative z-10 flex-1">
        {/* Header */}
        <PrescriptionHeader
          clinicName={settings?.clinic_name || branch?.name}
          doctorName={settings?.doctor_name || doctor?.name}
          doctorTitle={settings?.doctor_title || 'استشاري الأمراض الجلدية والتجميل والليزر'}
          clinicAddress={settings?.clinic_address}
          clinicPhone={settings?.clinic_phone}
          logoUrl={settings?.logo_url}
          primaryColor={primaryColor}
          specialtyBadge="الجلدية والتجميل والليزر"
        />

        {/* Patient Demographics */}
        <PatientInfoBar
          patient={patient}
          encounter={encounter}
          showSerial={showSerial}
        />

        {/* Diagnosis Callout */}
        {showDiagnosis && (
          <DiagnosisBox diagnoses={diagnoses} primaryColor={primaryColor} />
        )}

        {/* Morning & Evening Routine Split Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          {/* Morning Routine Card */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5 pb-1 border-b border-amber-200">
              <Sun className="h-4 w-4 text-amber-600" />
              <span>روتين الصباح (Morning Routine)</span>
            </div>
            <ul className="space-y-1 text-slate-800 text-[11px] list-disc list-inside m-0 p-0 font-medium">
              {morningRoutine.map((step, idx) => (
                <li key={idx} className="leading-snug">{step}</li>
              ))}
            </ul>
          </div>

          {/* Evening Routine Card */}
          <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-xl p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1.5 pb-1 border-b border-indigo-200">
              <Moon className="h-4 w-4 text-indigo-600" />
              <span>روتين المساء (Evening Routine)</span>
            </div>
            <ul className="space-y-1 text-slate-800 text-[11px] list-disc list-inside m-0 p-0 font-medium">
              {eveningRoutine.map((step, idx) => (
                <li key={idx} className="leading-snug">{step}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Procedure & Laser Notes if present */}
        {procedureNotes && (
          <div className="mb-3 p-2 bg-pink-50/60 border border-pink-200/80 rounded-xl text-xs text-pink-950 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[11px] font-bold text-pink-900">ملاحظات جلسات الليزر والتجميل:</strong>
              <p className="text-[11px] m-0 font-medium mt-0.5 leading-relaxed">{procedureNotes}</p>
            </div>
          </div>
        )}

        {/* Prescribed Medications (Topical & Systemic) */}
        <MedicationsList
          medications={medications}
          primaryColor={primaryColor}
        />

        {/* Sunscreen Alert & General Advice */}
        <div className="my-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-[11px] text-slate-700 m-0 font-semibold">
            تنبيه: تجنب التعرض المباشر لأشعة الشمس والحرارة العالية، وتجنب حك أو فرك البشرة أثناء فترة العلاج.
          </p>
        </div>

        {/* Advice and Follow Up */}
        <AdviceAndFollowUp
          generalAdvice={advice}
          followUpDate={followUpDate}
          primaryColor={primaryColor}
        />
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-2">
        <DoctorSignatureFooter
          doctorName={settings?.doctor_name || doctor?.name || 'د. سارة عادل'}
          serialNo={encounter?.serial_no || encounter?.prescription_code || 'RX-DERM-2026'}
          showQr={showQr}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}
