import React from 'react';
import { MapPin, Phone, HeartPulse } from 'lucide-react';
import PrescriptionBody from '../components/PrescriptionBody';
import { VectorQrCode } from './TemplateHelpers';

/**
 * EgyptianClinicTemplate — Authentic Egyptian Medical Clinic Prescription.
 *
 * Modeled directly after standard real-world Egyptian medical center prescriptions:
 * 1. Tri-column Header:
 *    - Right: Primary Doctor Name, Specialty, Academic Degrees & Sub-specialties.
 *    - Center: Clinic/Doctor Logo & Clinic Center Name.
 *    - Left: Partner Doctor / English title / Clinic working days.
 * 2. Patient Strip:
 *    - Name, Code/ID, Examination Type (كشف / إعادة), and Date.
 * 3. Modular Body (PrescriptionBody):
 *    - Supports 20/80 two-column layout vs stacked layout.
 *    - Strict two-line medication format (Line 1: English bold, Line 2: Arabic instructions).
 * 4. Egyptian Clinic Footer:
 *    - Services Box (e.g. رسم قلب - سونار - إيكو).
 *    - Next visit appointment line (الزيارة القادمة: إعادة | التاريخ: ...).
 *    - Full contact & address bottom banner.
 */
export default function EgyptianClinicTemplate({
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
  const primaryColor = settings?.primary_color || '#991b1b'; // Deep Crimson / Egyptian Rx Red
  const clinicName = settings?.clinic_name || branch?.name || 'المركز الطبي لأمراض القلب والباطنة';
  const mainDoctorName = doctor?.name || settings?.doctor_name || 'دكتور / وحيد سليمان الحنفي';
  const mainDoctorTitle = doctor?.title || settings?.doctor_title || 'استشاري الأمراض الباطنة والقلب';
  const mainDoctorDegrees = settings?.header_data?.degrees || 'زميل كلية الأطباء الملكية • دكتوراه الأمراض الباطنة';
  const subSpecialties = settings?.header_data?.sub_specialties || 'باطنة عامة — أمراض القلب — سكر وضغط — رسم قلب وإيكو';

  // Secondary partner / doctor or English credentials
  const secondDoctorName = settings?.header_data?.second_doctor?.name || 'دكتور / محمد وحيد سليمان';
  const secondDoctorTitle = settings?.header_data?.second_doctor?.title || 'ماجستير أمراض القلب والأوعية الدموية';
  const secondDoctorDegrees = settings?.header_data?.second_doctor?.degrees || 'زمالة كهرومغناطيسية القلب ومنظمات ضربات القلب';

  // Patient info
  const patientName = patient?.name || patient?.full_name || 'مريض افتراضي';
  const patientCode = encounter?.serial_no || encounter?.prescription_code || patient?.patient_code || patient?.id || '6340778';
  const examType = encounter?.type === 'consultation' || encounter?.appointment_type === 'consultation' ? 'إعادة' : 'كشف';
  const formattedDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  // Footer data
  const servicesText = settings?.footer_data?.services ||
    'فحص القلب الفوري بجهاز الإيكو — رسم القلب الكهربائي — سونار على البطن والحوض — جهاز استنشاق بالموجات الصوتية';
  const clinicPhones = settings?.footer_data?.clinic_phones || settings?.clinic_phone || '0402388422 — 01026758170';
  const doctorPhones = settings?.footer_data?.doctor_phones || '01227117011 — 01025591123';
  const clinicAddress = settings?.footer_data?.address || settings?.clinic_address || 'طنطا — ميدان المشحمة — شارع الجلاء — برج الأطباء';

  const logoUrl = settings?.logo_url;
  const bodyLayout = settings?.body_layout || 'columns';
  const showQr = settings?.show_qr !== false;

  return (
    <div className="w-full flex-1 min-h-full bg-white text-slate-900 p-6 flex flex-col justify-between box-border font-sans select-none" dir="rtl">
      {/* 1. AUTHENTIC EGYPTIAN HEADER & BODY */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="border-b-2 pb-3 shrink-0" style={{ borderColor: primaryColor }}>
          <div className="grid grid-cols-12 gap-2 items-center text-center">
            {/* Right: Primary Doctor Credentials */}
            <div className="col-span-5 text-right space-y-0.5">
              <h1 className="text-base font-black tracking-tight m-0" style={{ color: primaryColor }}>
                {mainDoctorName}
              </h1>
              <p className="text-xs font-bold text-slate-800 m-0">
                {mainDoctorTitle}
              </p>
              <p className="text-[10px] text-slate-600 font-medium m-0 leading-tight">
                {mainDoctorDegrees}
              </p>
              <p className="text-[9px] text-slate-500 font-semibold pt-0.5 m-0 leading-tight">
                {subSpecialties}
              </p>
            </div>

            {/* Center: Clinic Emblem / Logo & Center Name */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Clinic Logo"
                  loading="eager"
                  decoding="sync"
                  className="h-14 w-14 object-contain"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <HeartPulse className="h-7 w-7" />
                </div>
              )}
              <span className="text-[10px] font-black text-slate-800 mt-1 block tracking-tight leading-tight">
                {clinicName}
              </span>
            </div>

            {/* Left: Secondary Doctor / Clinic Partner */}
            <div className="col-span-5 text-left space-y-0.5" dir="rtl">
              <h2 className="text-sm font-black tracking-tight m-0 text-slate-800" style={{ color: primaryColor }}>
                {secondDoctorName}
              </h2>
              <p className="text-xs font-bold text-slate-800 m-0">
                {secondDoctorTitle}
              </p>
              <p className="text-[10px] text-slate-600 font-medium m-0 leading-tight">
                {secondDoctorDegrees}
              </p>
              <div className="text-[9px] text-slate-500 font-semibold pt-0.5">
                عيادات الباطنة والقلب التخصصية
              </div>
            </div>
          </div>
        </header>

        {/* 2. REAL PATIENT STRIP (شريط المريض) */}
        <section className="py-2 px-1 border-b border-slate-200 text-xs flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-bold">الاسم:</span>
            <strong className="font-extrabold text-slate-900">{patientName}</strong>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <span className="text-slate-500 font-bold font-sans">الكود:</span>
            <span className="font-bold text-slate-900">{patientCode}</span>
          </div>

          <div className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {examType}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-bold">التاريخ:</span>
            <span className="font-mono font-bold text-slate-900">{formattedDate}</span>
          </div>
        </section>

        {/* 3. MODULAR BODY */}
        <div className="flex-1 min-h-0 py-2">
          <PrescriptionBody
            medications={medications}
            vitals={vitals}
            diagnoses={diagnoses}
            advice={advice}
            followUpDate={followUpDate}
            layout={bodyLayout}
            showVitals={settings?.show_vitals !== false}
            showDiagnosis={settings?.show_diagnosis !== false}
            fontSize={settings?.font_size || 'md'}
            primaryColor={primaryColor}
          />
        </div>
      </div>

      {/* 4. AUTHENTIC EGYPTIAN FOOTER */}
      <footer className="mt-auto pt-2 space-y-2">
        {/* Next Visit Line + Doctor Signature & QR Barcode */}
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <span>الزيارة القادمة:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
              {followUpDate ? 'إعادة' : 'حسب الحاجة أو موعد الاستشارة'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>التاريخ:</span>
            <span className="font-mono text-slate-900">
              {followUpDate
                ? new Date(followUpDate).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>

          {/* Doctor Signature & Stamp Line */}
          <div className="text-center min-w-32">
            <div className="h-5 border-b border-dashed border-slate-400 mb-0.5" />
            <span className="text-[10px] text-slate-600 font-bold block">
              توقيع وختم الطبيب المعالج
            </span>
          </div>

          {showQr && (
            <div className="flex items-center gap-1.5" dir="ltr">
              <VectorQrCode value={`https://verify.clinic/rx/${patientCode}`} size={32} color={primaryColor} />
              <span className="font-mono text-[9px] text-slate-400">Rx-Verif</span>
            </div>
          )}
        </div>

        {/* Clinic Diagnostics & Services Box */}
        <div className="p-1.5 rounded-lg border border-slate-300 text-center text-[10px] font-bold text-slate-700 bg-slate-50/50 leading-relaxed">
          {servicesText}
        </div>

        {/* Bottom Banner: Address & Phone Numbers */}
        <div
          className="rounded-xl px-3 py-1.5 text-white text-[10px] flex items-center justify-between gap-3 shadow-2xs"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3 w-3 shrink-0 text-red-200" />
            <span className="truncate">{clinicAddress}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0" dir="ltr">
            <span className="flex items-center gap-1 font-mono font-bold">
              <Phone className="h-2.5 w-2.5 text-red-200" />
              <span>العيادة: {clinicPhones}</span>
            </span>
            {doctorPhones && (
              <span className="hidden sm:flex items-center gap-1 font-mono font-bold border-l border-white/30 pl-3">
                <span>الطبيب: {doctorPhones}</span>
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
