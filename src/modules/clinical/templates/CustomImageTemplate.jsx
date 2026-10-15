import React from 'react';
import PrescriptionBody from '../components/PrescriptionBody';
import {
  PatientInfoBar,
  VectorQrCode,
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

  const paperSize = settings?.paper_size || 'A5';
  const paperHeight = paperSize === 'A3' ? '420mm' : paperSize === 'A4' ? '297mm' : '210mm';

  return (
    <div
      className="relative w-full bg-white text-slate-900 font-sans selection:bg-none flex flex-col justify-between"
      dir="rtl"
      style={{
        filter: combinedFilter,
        WebkitFilter: combinedFilter,
        width: '100%',
        height: '100%',
        minHeight: paperHeight,
      }}
    >
      {/* Custom Background Image layer - 100% full coverage, ZERO clipping */}
      {customBgUrl ? (
        <img
          src={customBgUrl}
          alt="Custom Prescription Background"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
          }}
        />
      ) : (
        <div className="absolute inset-0 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 pointer-events-none text-xs">
          [Custom Background Image Area]
        </div>
      )}

      {/* Content Container aligned with custom margins, guaranteed full paper height */}
      <div
        className="relative z-10 flex flex-col justify-between flex-1 w-full"
        style={{
          minHeight: paperHeight,
          paddingTop: `${topMargin}cm`,
          paddingBottom: `${bottomMargin}cm`,
          paddingLeft: `${leftMargin}cm`,
          paddingRight: `${rightMargin}cm`,
        }}
      >
        <div className="space-y-3">
          {/* Patient Info Bar (borderless, transparent, pure black) */}
          <PatientInfoBar
            patient={patient}
            encounter={encounter}
            showSerial={showSerial}
            transparentBg={true}
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

        {/* Doctor Signature & Security QR Line */}
        <div className="pt-2">
          {showQr && (
            <div className="flex items-center justify-between text-xs text-black">
              <div className="text-[10px] text-slate-500 font-mono">
                {showSerial && <span>No: {encounter?.serial_no || encounter?.prescription_code || 'RX-CUST-2026'}</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-left font-mono text-[9px] text-slate-500">
                  <span className="block font-bold">رمز التحقق الإلكتروني</span>
                </div>
                <VectorQrCode
                  value={`https://verify.clinic/rx/${encounter?.serial_no || encounter?.prescription_code || 'RX-CUST-2026'}`}
                  size={42}
                  color="#000000"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
