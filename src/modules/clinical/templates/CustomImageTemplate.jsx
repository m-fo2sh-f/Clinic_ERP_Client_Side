import React from 'react';
import {
  PatientInfoBar,
  VitalsBar,
  DiagnosisBox,
  MedicationsList,
  AdviceAndFollowUp,
  DoctorSignatureFooter,
} from './TemplateHelpers';

/**
 * CustomImageTemplate — Prints prescription content over a user-uploaded custom stationery background image.
 *
 * CRITICAL RULE 3 (Laser Printer Filter):
 * When settings.laser_contrast_opt is active, applies CSS filter:
 * contrast(1.06) brightness(1.03) [with optional grayscale(100%)]
 * for ultra-sharp laser output without faint or washed-out backgrounds.
 */
export default function CustomImageTemplate({
  settings = {},
  patient = {},
  doctor = {},
  encounter = {},
  vitals = {},
  diagnoses = [],
  medications = [],
  advice = '',
  followUpDate = '',
}) {
  const topMargin = Number(settings?.top_margin_cm) || 3.5;
  const bottomMargin = Number(settings?.bottom_margin_cm) || 2.5;
  const leftMargin = Number(settings?.left_margin_cm) || 1.5;
  const rightMargin = Number(settings?.right_margin_cm) || 1.5;

  const primaryColor = settings?.primary_color || '#0284c7';
  const showDiagnosis = settings?.show_diagnosis !== false;
  const showVitals = settings?.show_vitals !== false;
  const showQr = settings?.show_qr !== false;
  const showSerial = settings?.show_serial !== false;

  const customBgUrl = settings?.custom_bg_image_url;
  const laserOpt = Boolean(settings?.laser_contrast_opt);
  const grayscaleMode = Boolean(settings?.grayscale_mode);

  // Compute CSS filter for laser printers
  const filterStyles = [];
  if (laserOpt) {
    filterStyles.push('contrast(1.06) brightness(1.03)');
  }
  if (grayscaleMode) {
    filterStyles.push('grayscale(100%)');
  }
  const combinedFilter = filterStyles.length > 0 ? filterStyles.join(' ') : 'none';

  return (
    <div
      className="relative w-full h-full bg-white text-slate-900 font-sans selection:bg-none"
      dir="rtl"
      style={{
        filter: combinedFilter,
        WebkitFilter: combinedFilter,
      }}
    >
      {/* Custom Background Image layer */}
      {customBgUrl ? (
        <img
          src={customBgUrl}
          alt="Custom Prescription Background"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        />
      ) : (
        <div className="absolute inset-0 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 pointer-events-none text-xs">
          [Custom Background Image Area]
        </div>
      )}

      {/* Content Container aligned with custom margins */}
      <div
        className="relative z-10 flex flex-col justify-between min-h-full"
        style={{
          paddingTop: `${topMargin}cm`,
          paddingBottom: `${bottomMargin}cm`,
          paddingLeft: `${leftMargin}cm`,
          paddingRight: `${rightMargin}cm`,
        }}
      >
        <div className="space-y-3">
          {/* Header Rx Marker */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span
              className="text-3xl font-black font-serif tracking-tight leading-none"
              style={{ color: primaryColor }}
              dir="ltr"
            >
              ℞
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              Medical Prescription
            </span>
          </div>

          {/* Patient Info Bar */}
          <PatientInfoBar
            patient={patient}
            encounter={encounter}
            showSerial={showSerial}
          />

          {/* Vitals Bar */}
          {showVitals && (
            <VitalsBar vitals={vitals} primaryColor={primaryColor} />
          )}

          {/* Diagnosis Box */}
          {showDiagnosis && (
            <DiagnosisBox diagnoses={diagnoses} primaryColor={primaryColor} />
          )}

          {/* Medications List */}
          <MedicationsList
            medications={medications}
            primaryColor={primaryColor}
          />

          {/* General Advice & Follow-Up Date */}
          <AdviceAndFollowUp
            generalAdvice={advice}
            followUpDate={followUpDate}
            primaryColor={primaryColor}
          />
        </div>

        {/* Doctor Signature & QR Line */}
        <div className="pt-4">
          <DoctorSignatureFooter
            doctorName={settings?.doctor_name || doctor?.name || 'د. الطبيب المعالج'}
            serialNo={encounter?.serial_no || encounter?.prescription_code || 'RX-CUST-2026'}
            showQr={showQr}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </div>
  );
}
