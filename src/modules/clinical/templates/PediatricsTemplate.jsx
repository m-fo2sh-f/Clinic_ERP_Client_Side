import React from 'react';
import { Baby, Scale, Thermometer, ShieldAlert } from 'lucide-react';
import {
  PrescriptionHeader,
  PatientInfoBar,
  DiagnosisBox,
  MedicationsList,
  AdviceAndFollowUp,
  DoctorSignatureFooter,
} from './TemplateHelpers';

/**
 * PediatricsTemplate — Warm, friendly vector layout for Pediatrics & Neonatology clinics.
 * Prominently highlights Child Weight (kg), Height, Head Circumference, and Temperature,
 * with weight-based dosage guidance and fever management precautions.
 */
export default function PediatricsTemplate({
  settings = {},
  patient = {},
  doctor = {},
  branch = {},
  encounter = {},
  vitals = {},
  diagnoses = [],
  medications = [],
  advice = '',
  followUpDate = '',
}) {
  const primaryColor = settings?.primary_color || '#0284c7';
  const showDiagnosis = settings?.show_diagnosis !== false;
  const showVitals = settings?.show_vitals !== false;
  const showQr = settings?.show_qr !== false;
  const showSerial = settings?.show_serial !== false;

  const weight = vitals?.weight || '12.5';
  const height = vitals?.height || '88';
  const headCirc = vitals?.headCircumference || vitals?.head_circumference || '48';
  const temp = vitals?.temperature || '37.8';

  return (
    <div
      className="relative w-full h-full bg-white text-slate-800 p-6 flex flex-col justify-between selection:bg-none font-sans"
      dir="rtl"
    >
      {/* Friendly Pediatrics Watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <svg width="260" height="260" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
        </svg>
      </div>

      <div className="relative z-10 flex-1">
        {/* Header */}
        <PrescriptionHeader
          clinicName={settings?.clinic_name || branch?.name}
          doctorName={settings?.doctor_name || doctor?.name}
          doctorTitle={settings?.doctor_title || 'استشاري طب الأطفال وحديثي الولادة'}
          clinicAddress={settings?.clinic_address}
          clinicPhone={settings?.clinic_phone}
          logoUrl={settings?.logo_url}
          primaryColor={primaryColor}
          specialtyBadge="طب الأطفال وحديثي الولادة"
        />

        {/* Patient Demographics */}
        <PatientInfoBar
          patient={patient}
          encounter={encounter}
          showSerial={showSerial}
        />

        {/* Pediatric Vital & Growth Signs Card */}
        {showVitals && (
          <section className="mb-3 bg-sky-50/60 border border-sky-200/90 rounded-2xl p-2.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-sky-200">
              <span className="flex items-center gap-1.5 text-xs font-black text-sky-900">
                <Baby className="h-4 w-4 text-sky-600" />
                <span>مؤشرات نمو وصحة الطفل (Pediatric Growth & Vitals):</span>
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                الجرعات مبنية على وزن الطفل
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {/* Weight - Boldest indicator */}
              <div className="bg-white p-2 rounded-xl border border-sky-200 shadow-2xs text-center">
                <span className="text-[10px] font-sans font-bold text-slate-500 block">الوزن (Weight)</span>
                <span className="text-base font-black text-sky-700 flex items-center justify-center gap-1 mt-0.5">
                  <Scale className="h-4 w-4 text-sky-500" />
                  <span>{weight} kg</span>
                </span>
              </div>

              {/* Temperature */}
              <div className="bg-white p-2 rounded-xl border border-sky-200 shadow-2xs text-center">
                <span className="text-[10px] font-sans font-bold text-slate-500 block">الحرارة (Temp)</span>
                <span className="text-base font-black text-amber-700 flex items-center justify-center gap-1 mt-0.5">
                  <Thermometer className="h-4 w-4 text-amber-500" />
                  <span>{temp} °C</span>
                </span>
              </div>

              {/* Height / Length */}
              <div className="bg-white p-2 rounded-xl border border-sky-200 shadow-2xs text-center">
                <span className="text-[10px] font-sans font-bold text-slate-500 block">الطول (Height)</span>
                <span className="text-base font-black text-slate-800 block mt-0.5">
                  {height} cm
                </span>
              </div>

              {/* Head Circumference */}
              <div className="bg-white p-2 rounded-xl border border-sky-200 shadow-2xs text-center">
                <span className="text-[10px] font-sans font-bold text-slate-500 block">محيط الرأس (OFC)</span>
                <span className="text-base font-black text-slate-800 block mt-0.5">
                  {headCirc} cm
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Diagnosis Callout */}
        {showDiagnosis && (
          <DiagnosisBox diagnoses={diagnoses} primaryColor={primaryColor} />
        )}

        {/* Dosage Precision Notice */}
        <div className="my-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-950 font-bold m-0">
            تنبيه للأم: يرجى إعطاء الدواء بالمكيال أو السرنجة المدرجة بدقة، وعدم استخدام ملاعق الطعام المنزلية.
          </p>
        </div>

        {/* Prescribed Medications */}
        <MedicationsList
          medications={medications}
          primaryColor={primaryColor}
        />

        {/* General Advice & Follow-Up */}
        <AdviceAndFollowUp
          generalAdvice={advice || 'الإكثار من السوائل الدافئة والرضاعة الطبيعية، وعمل كمادات ماء فاتر عند ارتفاع الحرارة.'}
          followUpDate={followUpDate}
          primaryColor={primaryColor}
        />
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-2">
        <DoctorSignatureFooter
          doctorName={settings?.doctor_name || doctor?.name || 'د. محمد أحمد'}
          serialNo={encounter?.serial_no || encounter?.prescription_code || 'RX-PED-2026'}
          showQr={showQr}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}
