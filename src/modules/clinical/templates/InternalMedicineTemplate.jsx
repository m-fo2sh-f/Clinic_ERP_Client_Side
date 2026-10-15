import React from 'react';
import PrescriptionBody from '../components/PrescriptionBody';
import {
  PrescriptionHeader,
  PatientInfoBar,
  DoctorSignatureFooter,
} from './TemplateHelpers';

/**
 * InternalMedicineTemplate — Classic dignified vector layout for Internal Medicine & Cardiology clinics.
 * Features prominent vital signs bar (BP, HR, RBS, Weight), structured diagnosis, and clear Rx medicines table.
 */
export default function InternalMedicineTemplate({
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

  return (
    <div
      className="relative w-full h-full bg-white text-slate-800 p-6 flex flex-col justify-between selection:bg-none font-sans"
      dir="rtl"
    >
      {/* Subtle Vector Medical Watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
        <svg width="280" height="280" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h6.28" />
        </svg>
      </div>

      <div className="relative z-10 flex-1">
        {/* Header */}
        <PrescriptionHeader
          clinicName={settings?.clinic_name || branch?.name}
          doctorName={settings?.doctor_name || doctor?.name}
          doctorTitle={settings?.doctor_title || 'استشاري الأمراض الباطنة والقلب والأوعية الدموية'}
          clinicAddress={settings?.clinic_address}
          clinicPhone={settings?.clinic_phone}
          logoUrl={settings?.logo_url}
          primaryColor={primaryColor}
          specialtyBadge="أمراض الباطنة والقلب"
        />

        {/* Patient Demographics */}
        <PatientInfoBar
          patient={patient}
          encounter={encounter}
          showSerial={showSerial}
        />

        {/* Modular Prescription Body (Columns or Stacked, strict two-line medications) */}
        <PrescriptionBody
          medications={medications}
          vitals={vitals}
          diagnoses={diagnoses}
          advice={advice}
          followUpDate={followUpDate}
          layout={settings?.body_layout || 'columns'}
          showVitals={showVitals}
          showDiagnosis={showDiagnosis}
          fontSize={settings?.font_size || 'md'}
          primaryColor={primaryColor}
        />
      </div>

      {/* Footer with Doctor Signature & QR */}
      <div className="relative z-10 pt-2">
        <DoctorSignatureFooter
          doctorName={settings?.doctor_name || doctor?.name || 'د. محمد أحمد'}
          serialNo={encounter?.serial_no || encounter?.prescription_code || 'RX-IM-2026'}
          showQr={showQr}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}
