import React from 'react';
import { VectorQrCode } from '../../../clinical/templates/TemplateHelpers';

const DUMMY_MEDICATIONS = [
  { id: 1, name: '1 - Xoraxone 1gm Vial', dose: 'حقنة عضل كاملة كل 24 ساعة لمدة 5 أيام' },
  { id: 2, name: '2 - Zithrokan 500mg Caps', dose: 'كبسولة على الريق صباحاً والصيام بعدها لمدة ساعة ونصف' },
  { id: 3, name: '3 - Panadol Extra Tablets', dose: 'قرص كل 8 ساعات لمدة أسبوع بعد الأكل' },
  { id: 4, name: '4 - Flamifast 50mg Tab', dose: 'قرص بعد الإفطار والعشاء' },
];

const DUMMY_VITALS = [
  { label: 'الضغط:', val: '125/80' },
  { label: 'النبض:', val: '74 bpm' },
  { label: 'الحرارة:', val: '37.1 °C' },
  { label: 'الوزن:', val: '78 kg' },
  { label: 'الطول:', val: '175 cm' },
  { label: 'السكر:', val: '110 mg' },
  { label: 'SpO2:', val: '99%' },
];

/**
 * MarginPreviewCanvas — Authentic live print simulation canvas mirroring the actual
 * monochromatic clinical print output with pure black typography and transparent content container.
 */
export default function MarginPreviewCanvas({
  paperSize = 'A5',
  top = 4.5,
  bottom = 3.0,
  left = 1.5,
  right = 1.5,
  showGuides = true,
  settings = {},
}) {
  const isA4 = paperSize === 'A4';
  const paperDimensions = isA4
    ? { widthMm: 210, heightMm: 297, label: 'A4 (210×297 مم)' }
    : { widthMm: 148, heightMm: 210, label: 'A5 (148×210 مم)' };

  const paperHeightCm = isA4 ? 29.7 : 21.0;
  const paperWidthCm = isA4 ? 21.0 : 14.8;

  const topPercent = Math.min(50, Math.max(0, (top / paperHeightCm) * 100));
  const bottomPercent = Math.min(45, Math.max(0, (bottom / paperHeightCm) * 100));
  const leftPercent = Math.min(30, Math.max(0, (left / paperWidthCm) * 100));
  const rightPercent = Math.min(30, Math.max(0, (right / paperWidthCm) * 100));

  const customBgUrl =
    settings?.image_url ||
    settings?.custom_image_url ||
    settings?.background_image ||
    settings?.custom_bg_image_url ||
    settings?.direct_storage_url;
  const isCustomMode = settings?.mode === 'custom_image';
  const isBuiltinMode = (settings?.mode || 'builtin') === 'builtin';
  const primaryColor = settings?.primary_color || '#991b1b';

  return (
    <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-700 px-1">
        <span>معاينة ورقة الطباعة الحية ({paperDimensions.label})</span>
        <span className="text-[10px] font-semibold text-clinic-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
          {isCustomMode && customBgUrl ? 'خلفية روشتة مخصصة' : isBuiltinMode ? 'قالب مدمج' : 'ورق مطبعة مسبق'}
        </span>
      </div>

      {/* Simulated Physical Paper Sheet */}
      <div
        className="bg-white rounded-lg shadow-lg border border-slate-300 relative overflow-hidden transition-all select-none"
        style={{
          width: isA4 ? '330px' : '320px',
          height: isA4 ? '466px' : '454px',
        }}
      >
        {/* Layer 1: Stationery Background */}
        {isCustomMode && customBgUrl ? (
          <img
            src={customBgUrl}
            alt="Prescription Stationery Background"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
            style={{ width: '100%', height: '100%', objectFit: 'fill' }}
          />
        ) : isBuiltinMode ? (
          <div className="absolute top-2.5 inset-x-3 text-center z-0 opacity-25 select-none pointer-events-none border-b pb-1" style={{ borderColor: primaryColor }}>
            <p className="text-[9px] font-black m-0" style={{ color: primaryColor }}>{settings?.header_data?.title || 'المركز الطبي لأمراض القلب والباطنة'}</p>
            <p className="text-[7px] text-slate-600 m-0">{settings?.header_data?.specialty || 'عيادات الباطنة والقلب التخصصية'}</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none z-0">
            <span className="text-3xl font-serif font-black tracking-widest text-slate-400">LETTERHEAD</span>
          </div>
        )}

        {/* Layer 2: Authentic Monochromatic Printable Content (bg-transparent, pure black text) */}
        <div
          className="absolute z-10 flex flex-col justify-between overflow-hidden bg-transparent select-none text-black"
          dir="rtl"
          style={{
            top: `${topPercent}%`,
            bottom: `${bottomPercent}%`,
            left: `${leftPercent}%`,
            right: `${rightPercent}%`,
            padding: '3px 4px',
          }}
        >
          {/* Top: Patient Bar */}
          <div className="border-b border-black/30 pb-0.5 mb-1 flex items-center justify-between text-[6.5px] text-black font-semibold leading-tight shrink-0">
            <div><span className="font-bold">المريض: </span><span>أحمد محمود إبراهيم</span></div>
            <div><span className="font-bold">السن / النوع: </span><span>38 سنة / ذكر</span></div>
            <div><span className="font-bold">التاريخ: </span><span className="font-mono">2026/11/04</span></div>
            <div className="font-mono font-bold">RX-2026-9841</div>
          </div>

          {/* 2-Column Body: Right Column (Medications ~72%) + Left Column (Vitals & Diagnoses ~28%) */}
          <div className="flex-1 flex gap-1.5 items-start overflow-hidden min-h-0 text-black py-0.5">
            {/* Right Column (~72%): Medications, Instructions, Next Visit */}
            <div className="w-[72%] flex flex-col justify-between h-full space-y-1 overflow-hidden">
              <div className="space-y-1 overflow-hidden">
                {DUMMY_MEDICATIONS.map((med) => (
                  <div key={med.id}>
                    <div className="text-[7.5px] font-bold text-black leading-tight text-left" dir="ltr">
                      {med.name}
                    </div>
                    <div className="text-[6.5px] text-black font-medium leading-tight text-right" dir="rtl">
                      {med.dose}
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions & Next Visit */}
              <div className="pt-0.5 border-t border-black/15 space-y-0.5 shrink-0">
                <div className="text-[6.5px] text-black leading-tight">
                  <span className="font-bold">التعليمات الطبية: </span>
                  <span>حمية قليلة الملح، الإكثار من الماء، وتجنب المسكنات بدون استشارة.</span>
                </div>
                <div className="text-[6.5px] text-black font-semibold leading-tight">
                  <span>الاستشارة القادمة: الأربعاء ، 18 نوفمبر 2026</span>
                </div>
              </div>
            </div>

            {/* Left Column (~28%): Vitals & Diagnoses with right vertical border */}
            <div className="w-[28%] border-r border-black/25 pr-1 space-y-1 h-full overflow-hidden text-right shrink-0" dir="rtl">
              {settings?.show_vitals !== false && (
                <div className="space-y-0.5">
                  <div className="text-[7px] font-bold text-black border-b border-black/20 pb-0.2">
                    العلامات الحيوية:
                  </div>
                  <div className="space-y-0.2 text-[6px] text-black">
                    {DUMMY_VITALS.map((v, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{v.label}</span>
                        <span className="font-mono font-bold" dir="ltr">{v.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settings?.show_diagnosis !== false && (
                <div className="space-y-0.5 border-t border-black/20 pt-0.5">
                  <div className="text-[7px] font-bold text-black">التشخيص:</div>
                  <div className="text-[5.8px] text-black leading-tight space-y-0.5">
                    <div>• ارتفاع ضغط الدم الأولي (Primary HTN)</div>
                    <div>• عسر هضم وظيفي (Functional Dyspepsia)</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: QR Code + Verification (Left) & Ref Code (Right) */}
          <div className="pt-0.5 border-t border-black/20 flex items-center justify-between text-[6.5px] text-black shrink-0">
            <div className="font-mono font-bold text-black text-[6.5px]">Ref: RX-2026-9841</div>
            {settings?.show_qr !== false && (
              <div className="flex items-center gap-1 text-[6px] text-black font-mono">
                <span className="font-bold text-[6px]">رمز التحقق الإلكتروني</span>
                <VectorQrCode value="RX-2026-9841" size={16} color="#000000" />
              </div>
            )}
          </div>
        </div>

        {/* Layer 3: Visual Margin Guides (when enabled) */}
        {showGuides && (
          <>
            <div
              className="absolute top-0 inset-x-0 bg-red-500/10 border-b border-dashed border-red-500/80 flex items-center justify-center text-[8px] text-red-700 font-bold z-20 pointer-events-none transition-all"
              style={{ height: `${topPercent}%` }}
            >
              <span className="bg-white/95 px-1 py-0.2 rounded shadow-2xs">الهيدر المحجوب ({top} سم)</span>
            </div>
            <div
              className="absolute bottom-0 inset-x-0 bg-blue-500/10 border-t border-dashed border-blue-500/80 flex items-center justify-center text-[8px] text-blue-700 font-bold z-20 pointer-events-none transition-all"
              style={{ height: `${bottomPercent}%` }}
            >
              <span className="bg-white/95 px-1 py-0.2 rounded shadow-2xs">الفوتر المحجوب ({bottom} سم)</span>
            </div>
            <div className="absolute inset-y-0 right-0 bg-emerald-500/5 border-l border-dashed border-emerald-500/60 z-20 pointer-events-none" style={{ width: `${rightPercent}%` }} />
            <div className="absolute inset-y-0 left-0 bg-emerald-500/5 border-r border-dashed border-emerald-500/60 z-20 pointer-events-none" style={{ width: `${leftPercent}%` }} />
            <div
              className="absolute border border-emerald-600/70 rounded-xs pointer-events-none z-20"
              style={{ top: `${topPercent}%`, bottom: `${bottomPercent}%`, left: `${leftPercent}%`, right: `${rightPercent}%` }}
            >
              <span className="absolute -top-2 right-1.5 bg-emerald-600 text-white text-[6.5px] font-bold px-1 py-0.2 rounded shadow-2xs">
                منطقة الطباعة المسموحة
              </span>
            </div>
          </>
        )}
      </div>

      <p className="text-[10px] text-slate-400 font-medium text-center m-0">
        تتحرك الأصناف والتشخيص تلقائياً داخل حدود الهوامش لتفادي الطباعة على الهيدر والفوتر
      </p>
    </div>
  );
}
