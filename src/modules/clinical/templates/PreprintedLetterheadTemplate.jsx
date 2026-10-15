import React from 'react';
import PrescriptionBody from '../components/PrescriptionBody';
import {
  PatientInfoBar,
  DoctorSignatureFooter,
} from './TemplateHelpers';

/**
 * PreprintedLetterheadTemplate — Printing template for clinics with pre-printed physical stationery pads.
 *
 * CRITICAL RULE 4 (Multi-Page Overflow):
 * Uses a native HTML <table> print structure where:
 * - <thead> has height = top_margin_cm
 * - <tfoot> has height = bottom_margin_cm
 * When printing across multiple pages, browsers automatically repeat <thead> and <tfoot> on every
 * physical page, ensuring that the prescription content never crashes into the pre-printed letterhead or footer!
 */
export default function PreprintedLetterheadTemplate({
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

  return (
    <div
      className="w-full min-h-full bg-transparent text-slate-900 font-sans selection:bg-none"
      dir="rtl"
    >
      <table
        className="w-full border-collapse"
        style={{ tableLayout: 'fixed', borderSpacing: 0 }}
      >
        {/* Multi-page Repeating Top Spacer for Pre-printed Letterhead */}
        <thead>
          <tr>
            <td
              style={{
                height: `${topMargin}cm`,
                padding: 0,
                margin: 0,
                border: 'none',
              }}
              aria-hidden="true"
            >
              <div style={{ height: `${topMargin}cm` }} />
            </td>
          </tr>
        </thead>

        {/* Prescription Body Content with exact dynamic padding */}
        <tbody>
          <tr>
            <td
              className="align-top"
              style={{
                paddingLeft: `${leftMargin}cm`,
                paddingRight: `${rightMargin}cm`,
                paddingTop: 0,
                paddingBottom: 0,
                border: 'none',
              }}
            >
              <div className="flex flex-col justify-between min-h-[14cm]">
                <div className="space-y-3">
                  {/* Patient Demographics Bar */}
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
                  />
                </div>

                {/* Doctor Signature & Security QR Line */}
                <div className="pt-4">
                  <DoctorSignatureFooter
                    doctorName={settings?.doctor_name || doctor?.name || 'د. الطبيب المعالج'}
                    serialNo={encounter?.serial_no || encounter?.prescription_code || 'RX-LP-2026'}
                    showQr={showQr}
                    primaryColor={primaryColor}
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        {/* Multi-page Repeating Bottom Spacer for Pre-printed Footer */}
        <tfoot>
          <tr>
            <td
              style={{
                height: `${bottomMargin}cm`,
                padding: 0,
                margin: 0,
                border: 'none',
              }}
              aria-hidden="true"
            >
              <div style={{ height: `${bottomMargin}cm` }} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
