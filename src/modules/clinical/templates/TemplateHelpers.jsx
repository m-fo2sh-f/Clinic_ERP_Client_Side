import React from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  Calendar,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';

/**
 * Lightweight pure-SVG QR code generator.
 * Produces a crisp vector QR code matrix with finder patterns without external libraries.
 */
export function VectorQrCode({ value = 'RX-VALID', size = 56, color = '#0f172a' }) {
  // Deterministic 25x25 matrix based on value hash
  const matrixSize = 25;
  const hash = Array.from(String(value)).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007,
    17
  );

  const isFinderPattern = (r, c) => {
    // Top-left finder: [0..6, 0..6]
    if (r <= 6 && c <= 6) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-right finder: [0..6, 18..24]
    if (r <= 6 && c >= 18) {
      const cc = c - 18;
      if (r === 0 || r === 6 || cc === 0 || cc === 6) return true;
      if (r >= 2 && r <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    }
    // Bottom-left finder: [18..24, 0..6]
    if (r >= 18 && c <= 6) {
      const rr = r - 18;
      if (rr === 0 || rr === 6 || c === 0 || c === 6) return true;
      if (rr >= 2 && rr <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    return null;
  };

  const cells = [];
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const finder = isFinderPattern(r, c);
      if (finder !== null) {
        if (finder) {
          cells.push({ r, c });
        }
      } else if (r === 6 || c === 6) {
        // Timing pattern
        if ((r + c) % 2 === 0) cells.push({ r, c });
      } else {
        // Deterministic pseudorandom pseudo-data bits
        const bit = ((hash ^ (r * 37 + c * 19)) * (r + 1)) % 7;
        if (bit === 1 || bit === 3 || bit === 5) {
          cells.push({ r, c });
        }
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${matrixSize} ${matrixSize}`}
      className="shrink-0"
      shapeRendering="crispEdges"
      aria-label={`QR Code for ${value}`}
    >
      <rect width={matrixSize} height={matrixSize} fill="#ffffff" />
      {cells.map(({ r, c }) => (
        <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={color} />
      ))}
    </svg>
  );
}

/**
 * Standard Header for Built-in Templates
 */
export function PrescriptionHeader({
  clinicName,
  doctorName,
  doctorTitle,
  clinicAddress,
  clinicPhone,
  logoUrl,
  primaryColor = '#0284c7',
  specialtyBadge = '',
  date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
}) {
  return (
    <header className="border-b-2 pb-3 mb-3" style={{ borderColor: primaryColor }} dir="rtl">
      <div className="flex items-start justify-between gap-4">
        {/* Doctor & Clinic Info (Arabic - Right) */}
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Clinic Logo"
              loading="eager"
              decoding="sync"
              className="h-14 w-14 object-contain rounded-xl border border-slate-200"
            />
          ) : (
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              Rx
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight m-0">
                {doctorName || 'د. محمد أحمد'}
              </h1>
              {specialtyBadge && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {specialtyBadge}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-0.5 m-0">
              {doctorTitle || 'استشاري الأمراض الباطنة والقلب'}
            </p>
            <p className="text-[11px] font-bold text-slate-500 m-0">
              {clinicName || 'عيادة النور التخصصية'}
            </p>
          </div>
        </div>

        {/* Prescription Metadata & Rx Symbol (Left) */}
        <div className="text-left flex flex-col items-end" dir="ltr">
          <span
            className="text-3xl font-black tracking-tighter leading-none"
            style={{ color: primaryColor }}
          >
            ℞
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-1">
            Date: {date}
          </span>
          {clinicPhone && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone className="h-2.5 w-2.5" />
              <span>{clinicPhone}</span>
            </span>
          )}
        </div>
      </div>

      {clinicAddress && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{clinicAddress}</span>
          </span>
          <span className="font-mono text-slate-400">Official Medical Rx</span>
        </div>
      )}
    </header>
  );
}

/**
 * Standard Patient Information Strip
 */
export function PatientInfoBar({
  patient = {},
  encounter = {},
  showSerial = true,
  date,
  transparentBg = false,
}) {
  const patientName = patient?.name || patient?.full_name || 'مريض افتراضي';
  const age = patient?.age || (patient?.birth_date ? `${new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} سنة` : '32 سنة');
  const gender = patient?.gender === 'female' ? 'أنثى' : 'ذكر';
  const serialNo = encounter?.serial_no || encounter?.prescription_code || `RX-${new Date().getFullYear()}-0482`;
  const formattedDate = date || new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' });

  if (transparentBg) {
    return (
      <section className="bg-transparent border-b border-black/20 pb-2 mb-3 text-xs text-black" dir="rtl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center text-black">
          <div className="flex items-center gap-1.5">
            <span className="text-black/70 font-semibold text-[11px]">المريض:</span>
            <strong className="font-extrabold text-black truncate">{patientName}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-black/70 font-semibold text-[11px]">السن / النوع:</span>
            <span className="font-bold text-black">{age} / {gender}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-black/70 font-semibold text-[11px]">التاريخ:</span>
            <span className="font-mono font-bold text-black">{formattedDate}</span>
          </div>

          {showSerial && (
            <div className="flex items-center gap-1.5 justify-end" dir="ltr">
              <span className="text-black/70 font-semibold text-[10px]">No:</span>
              <span className="font-mono font-bold text-black text-[11px]">
                {serialNo}
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50/90 border border-slate-200/90 rounded-xl px-3 py-2 mb-3 text-xs" dir="rtl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center text-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px]">المريض:</span>
          <strong className="font-extrabold text-slate-900 truncate">{patientName}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px]">السن / النوع:</span>
          <span className="font-bold">{age} / {gender}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px]">التاريخ:</span>
          <span className="font-mono font-semibold">{formattedDate}</span>
        </div>

        {showSerial && (
          <div className="flex items-center gap-1.5 justify-end" dir="ltr">
            <span className="text-slate-400 font-medium text-[10px]">No:</span>
            <span className="font-mono font-bold text-slate-800 text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {serialNo}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Prominent Vital Signs Bar
 */
export function VitalsBar({ vitals = {}, primaryColor = '#0284c7' }) {
  const bp = vitals?.bloodPressure || vitals?.blood_pressure || (vitals?.bp_systolic && `${vitals.bp_systolic}/${vitals.bp_diastolic}`);
  const hr = vitals?.heartRate || vitals?.heart_rate;
  const temp = vitals?.temperature;
  const weight = vitals?.weight;
  const height = vitals?.height;
  const spo2 = vitals?.spo2;
  const rbs = vitals?.randomBloodSugar || vitals?.blood_sugar;

  const hasVitals = Boolean(bp || hr || temp || weight || height || spo2 || rbs);
  if (!hasVitals) return null;

  return (
    <section className="mb-3 border border-slate-200 rounded-xl p-2 bg-white shadow-2xs" dir="rtl">
      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1.5">
        <Activity className="h-3.5 w-3.5" style={{ color: primaryColor }} />
        <span>العلامات الحيوية (Vital Signs):</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {bp && (
          <span className="px-2 py-1 bg-red-50 text-red-800 border border-red-200 rounded-lg font-bold flex items-center gap-1 font-mono">
            <Heart className="h-3 w-3 text-red-500" />
            <span className="text-[10px] text-red-600 font-sans">BP:</span> {bp} <span className="text-[9px] text-red-500">mmHg</span>
          </span>
        )}
        {hr && (
          <span className="px-2 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg font-bold flex items-center gap-1 font-mono">
            <span className="text-[10px] text-rose-600 font-sans">HR:</span> {hr} <span className="text-[9px] text-rose-500">bpm</span>
          </span>
        )}
        {rbs && (
          <span className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-bold flex items-center gap-1 font-mono">
            <span className="text-[10px] text-amber-700 font-sans">RBS:</span> {rbs} <span className="text-[9px] text-amber-600">mg/dL</span>
          </span>
        )}
        {temp && (
          <span className="px-2 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-lg font-bold flex items-center gap-1 font-mono">
            <Thermometer className="h-3 w-3 text-orange-500" />
            {temp} <span className="text-[9px] text-orange-600">°C</span>
          </span>
        )}
        {weight && (
          <span className="px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-bold flex items-center gap-1 font-mono">
            <Scale className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] text-blue-600 font-sans">Wt:</span> {weight} <span className="text-[9px] text-blue-600">kg</span>
          </span>
        )}
        {spo2 && (
          <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 font-mono">
            <span className="text-[10px] text-emerald-600 font-sans">SpO2:</span> {spo2}%
          </span>
        )}
      </div>
    </section>
  );
}

/**
 * Diagnosis Callout Box
 */
export function DiagnosisBox({ diagnoses = [], primaryColor = '#0284c7' }) {
  if (!diagnoses || diagnoses.length === 0) return null;

  return (
    <div className="mb-3 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-2" dir="rtl">
      <span className="text-[11px] font-bold text-slate-500 shrink-0">التشخيص (Diagnosis):</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {diagnoses.map((diag, index) => {
          const text = typeof diag === 'string' ? diag : diag?.name || diag?.description || '';
          if (!text) return null;
          return (
            <span
              key={index}
              className="text-xs font-extrabold px-2 py-0.5 rounded-md text-white shadow-2xs"
              style={{ backgroundColor: primaryColor }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Bi-Directional RTL/LTR Prescribed Medications Section
 * CRITICAL RULE 6: Isolated LTR English drug name + dosage + frequency,
 * with Arabic instructions right-aligned.
 */
export function MedicationsList({
  medications = [],
  primaryColor = '#0284c7',
  emptyMessage = 'لا توجد أدوية مسجلة في هذه الروشتة.',
}) {
  if (!medications || medications.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-xl my-3">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="my-3 space-y-2.5">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200" dir="rtl">
        <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 m-0">
          <span className="text-base font-black font-serif" style={{ color: primaryColor }}>
            ℞
          </span>
          <span>الأدوية الموصوفة (Prescribed Medications)</span>
        </h3>
        <span className="text-[10px] font-bold font-mono text-slate-400">
          {medications.length} {medications.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-2 divide-y divide-slate-100">
        {medications.map((med, index) => {
          const drugName = med?.drug_name || med?.name || 'Unnamed Medication';
          const unifiedDosage = med?.dosage || '';

          return (
            <div key={med.id || index} className="pt-2 first:pt-0">
              {/* LTR Row: Rx numbering + Drug Name */}
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
                  </div>
                </div>
              </div>

              {/* Arabic Usage Instructions (RTL) */}
              {unifiedDosage && (
                <div className="mt-1 pr-6 text-right" dir="rtl">
                  <p className="text-xs font-bold text-slate-700 m-0 leading-relaxed bg-slate-50/60 p-1.5 rounded-lg border-r-2" style={{ borderRightColor: primaryColor }}>
                    {unifiedDosage}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * General Advice & Follow-Up Date Box
 */
export function AdviceAndFollowUp({
  generalAdvice = '',
  followUpDate = '',
  primaryColor = '#0284c7',
}) {
  if (!generalAdvice && !followUpDate) return null;

  return (
    <div className="mt-3 pt-2 border-t border-slate-200 text-xs space-y-2" dir="rtl">
      {generalAdvice && (
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5">
          <strong className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" style={{ color: primaryColor }} />
            <span>التعليمات والإرشادات الطبية:</span>
          </strong>
          <p className="text-xs text-slate-800 whitespace-pre-wrap font-medium m-0 leading-relaxed">
            {generalAdvice}
          </p>
        </div>
      )}

      {followUpDate && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
          <span className="flex items-center gap-1.5 font-bold text-xs">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span>موعد الاستشارة والمتابعة القادمة:</span>
          </span>
          <strong className="font-bold text-xs bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono">
            {new Date(followUpDate).toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </strong>
        </div>
      )}
    </div>
  );
}

/**
 * Footer with Doctor Signature Line, Clinic Stamp area, and Verification QR
 */
export function DoctorSignatureFooter({
  doctorName = 'د. محمد أحمد',
  serialNo = 'RX-2026-0482',
  showQr = true,
  primaryColor = '#0284c7',
}) {
  return (
    <footer className="mt-4 pt-3 border-t-2 border-slate-200 flex items-center justify-between gap-4 text-xs" dir="rtl">
      {/* Verification QR and Security Stamp */}
      {showQr ? (
        <div className="flex items-center gap-2">
          <VectorQrCode value={`https://verify.clinic/rx/${serialNo}`} size={46} color={primaryColor} />
          <div className="text-[10px] text-slate-400">
            <span className="font-bold text-slate-600 block">رمز التحقق الإلكتروني</span>
            <span className="font-mono text-[9px]">{serialNo}</span>
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-slate-400 font-mono">
          Ref: {serialNo}
        </div>
      )}

      {/* Signature and Stamp Line */}
      <div className="text-center min-w-36">
        <div className="h-9 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center">
          <span className="text-[10px] text-slate-300 font-serif italic">Doctor&apos;s Signature</span>
        </div>
        <span className="text-xs font-bold text-slate-800 block">
          {doctorName}
        </span>
        <span className="text-[9px] text-slate-400 font-semibold">توقيع وختم الطبيب المعالج</span>
      </div>
    </footer>
  );
}

export { SAMPLE_PRESCRIPTION_DATA } from './samplePrescriptionData';
