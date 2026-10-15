import React from 'react';
import { Eye } from 'lucide-react';
import {
  PrescriptionHeader,
  PatientInfoBar,
  DiagnosisBox,
  AdviceAndFollowUp,
  DoctorSignatureFooter,
} from './TemplateHelpers';

/**
 * OphthalmologyTemplate — Tailored layout for Ophthalmology & Vision clinics.
 * Features a compact vision measurement chart (OD / OS: SPH, CYL, AXIS, VA, ADD, PD)
 * along with dedicated eye drops & ophthalmic medications section.
 */
export default function OphthalmologyTemplate({
  settings = {},
  patient = {},
  doctor = {},
  branch = {},
  encounter = {},
  diagnoses = [],
  medications = [],
  advice = '',
  followUpDate = '',
  visionData = {},
}) {
  const primaryColor = settings?.primary_color || '#0284c7';
  const showDiagnosis = settings?.show_diagnosis !== false;
  const showQr = settings?.show_qr !== false;
  const showSerial = settings?.show_serial !== false;

  // Default / passed ophthalmic measurements
  const od = visionData?.od || { sph: '-1.50', cyl: '-0.75', axis: '90°', va: '6/9', add: '+1.50' };
  const os = visionData?.os || { sph: '-1.25', cyl: '-0.50', axis: '85°', va: '6/6', add: '+1.50' };
  const pd = visionData?.pd || '63 mm';

  return (
    <div
      className="relative w-full h-full bg-white text-slate-800 p-6 flex flex-col justify-between selection:bg-none font-sans"
      dir="rtl"
    >
      {/* Ophthalmology Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none">
        <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>

      <div className="relative z-10 flex-1">
        {/* Header */}
        <PrescriptionHeader
          clinicName={settings?.clinic_name || branch?.name}
          doctorName={settings?.doctor_name || doctor?.name}
          doctorTitle={settings?.doctor_title || 'استشاري طب وجراحة العيون والليزك'}
          clinicAddress={settings?.clinic_address}
          clinicPhone={settings?.clinic_phone}
          logoUrl={settings?.logo_url}
          primaryColor={primaryColor}
          specialtyBadge="طب وجراحة العيون"
        />

        {/* Patient Demographics */}
        <PatientInfoBar
          patient={patient}
          encounter={encounter}
          showSerial={showSerial}
        />

        {/* Compact Vision Refraction Chart (OD / OS) */}
        <section className="mb-3 border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div
            className="px-3 py-1 text-white text-[11px] font-bold flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>قياسات النظر والانكسار البصري (Refraction & Visual Acuity)</span>
            </span>
            <span className="font-mono text-[10px]">PD: {pd}</span>
          </div>

          <table className="w-full text-center text-xs border-collapse" dir="ltr">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px]">
                <th className="py-1 px-2 border-r border-slate-200 text-slate-900">Eye</th>
                <th className="py-1 px-2 border-r border-slate-200">SPH (كروي)</th>
                <th className="py-1 px-2 border-r border-slate-200">CYL (أسطواني)</th>
                <th className="py-1 px-2 border-r border-slate-200">AXIS (المحور)</th>
                <th className="py-1 px-2 border-r border-slate-200">VA (الحدة)</th>
                <th className="py-1 px-2">ADD (القراءة)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              <tr className="hover:bg-slate-50/50">
                <td className="py-1.5 px-2 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                  OD (Right / اليمنى)
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">{od.sph || '-'}</td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">{od.cyl || '-'}</td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">{od.axis || '-'}</td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-bold text-slate-900">{od.va || '6/6'}</td>
                <td className="py-1.5 px-2 font-semibold">{od.add || '-'}</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-1.5 px-2 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                  OS (Left / اليسرى)
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">{os.sph || '-'}</td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">{os.cyl || '-'}</td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">{os.axis || '-'}</td>
                <td className="py-1.5 px-2 border-r border-slate-200 font-bold text-slate-900">{os.va || '6/6'}</td>
                <td className="py-1.5 px-2 font-semibold">{os.add || '-'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Diagnosis Callout */}
        {showDiagnosis && (
          <DiagnosisBox diagnoses={diagnoses} primaryColor={primaryColor} />
        )}

        {/* Eye Drops & Medications Section */}
        <div className="my-2 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200" dir="rtl">
            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 m-0">
              <span className="text-base font-black font-serif" style={{ color: primaryColor }}>
                ℞
              </span>
              <span>قطرات ومراهم العين والعلاج الدوائي (Eye Drops & Medications)</span>
            </h3>
            <span className="text-[10px] font-bold font-mono text-slate-400">
              {medications.length} items
            </span>
          </div>

          {medications.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-xl">
              لا توجد قطرات أو أدوية مسجلة.
            </div>
          ) : (
            <div className="space-y-2 divide-y divide-slate-100">
              {medications.map((med, index) => {
                const drugName = med?.drug_name || med?.name || 'Eye Drops';
                const dose = med?.dose || med?.dosage || '';
                const frequency = med?.frequency || '';
                const duration = med?.duration || '';
                const instructions = med?.instruction || med?.instructions || '';

                return (
                  <div key={med.id || index} className="pt-2 first:pt-0">
                    <div className="flex items-start justify-between gap-3 text-left" dir="ltr">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-mono font-bold text-xs px-1.5 py-0.5 rounded text-white shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-sans font-extrabold text-sm text-slate-900 tracking-wide">
                            {drugName}
                          </span>
                          {dose && (
                            <span className="ml-2 font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {dose}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {frequency && (
                          <span className="font-sans font-bold text-xs text-slate-800 block">
                            {frequency}
                          </span>
                        )}
                        {duration && (
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Duration: {duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {instructions && (
                      <div className="mt-1 pr-6 text-right" dir="rtl">
                        <p className="text-xs font-bold text-slate-700 m-0 bg-slate-50/70 p-1.5 rounded-lg border-r-2" style={{ borderRightColor: primaryColor }}>
                          {instructions}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* General Advice & Eye Care Guidelines */}
        <AdviceAndFollowUp
          generalAdvice={advice || 'رج قطرة العين جيداً قبل الاستعمال، وترك فاصل 5 دقائق على الأقل بين كل قطرة وأخرى.'}
          followUpDate={followUpDate}
          primaryColor={primaryColor}
        />
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-2">
        <DoctorSignatureFooter
          doctorName={settings?.doctor_name || doctor?.name || 'د. محمد أحمد'}
          serialNo={encounter?.serial_no || encounter?.prescription_code || 'RX-EYE-2026'}
          showQr={showQr}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}
