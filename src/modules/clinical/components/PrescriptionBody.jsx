import React from 'react';

/**
 * PrescriptionBody — Minimalist, authentic clinical body for Egyptian prescriptions.
 *
 * Implements:
 * 1. Monochromatic Pure Black Text (text-black) across all body elements.
 * 2. Borderless, calm Vitals displayed on the same line (الاسم والقيمة على نفس السطر) with tight spacing.
 * 3. Direct medication list without wasteful banner headers.
 * 4. Strict Two-Line Medication Format:
 *    - Line 1: Drug Name (English Bold, pure black).
 *    - Line 2: Dose & instructions (Arabic, pure black, directly underneath).
 * 5. Customizable Font Size ('sm' | 'md' | 'lg' | 'xl').
 * 6. Supports 20/80 column layout vs stacked layout.
 */
export default function PrescriptionBody({
  medications = [],
  vitals = {},
  diagnoses = [],
  advice = '',
  followUpDate = '',
  layout = 'columns', // 'columns' | 'stacked'
  showVitals = true,
  showDiagnosis = true,
  fontSize = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
}) {
  // Extract and normalize vitals
  const bp = vitals?.bloodPressure || vitals?.blood_pressure || (vitals?.bp_systolic && `${vitals.bp_systolic}/${vitals.bp_diastolic}`);
  const hr = vitals?.heartRate || vitals?.heart_rate;
  const temp = vitals?.temperature;
  const weight = vitals?.weight;
  const height = vitals?.height;
  const spo2 = vitals?.spo2;
  const rbs = vitals?.randomBloodSugar || vitals?.blood_sugar;

  const hasVitals = Boolean(bp || hr || temp || weight || height || spo2 || rbs);
  const shouldRenderVitals = showVitals && hasVitals;

  // Normalized diagnoses
  const validDiagnoses = Array.isArray(diagnoses)
    ? diagnoses
        .map((d) => (typeof d === 'string' ? d : d?.name || d?.description || ''))
        .filter(Boolean)
    : [];
  const shouldRenderDiagnoses = showDiagnosis && validDiagnoses.length > 0;

  // Dynamic font sizing classes
  const getFontClasses = () => {
    switch (fontSize) {
      case 'sm':
        return {
          drugTitle: 'text-xs font-bold text-black',
          doseLine: 'text-[11px] font-semibold text-black',
          spacing: 'space-y-2',
        };
      case 'lg':
        return {
          drugTitle: 'text-base font-bold text-black',
          doseLine: 'text-sm font-semibold text-black',
          spacing: 'space-y-3.5',
        };
      case 'xl':
        return {
          drugTitle: 'text-lg font-extrabold text-black',
          doseLine: 'text-base font-semibold text-black',
          spacing: 'space-y-4',
        };
      case 'md':
      default:
        return {
          drugTitle: 'text-sm font-bold text-black',
          doseLine: 'text-xs font-semibold text-black',
          spacing: 'space-y-2.5',
        };
    }
  };

  const fontClasses = getFontClasses();

  // Render Vitals in Calm, Borderless Stacked Side Column (20% Column)
  const renderStackedVitalsColumn = () => (
    <div className="space-y-1.5 text-right text-black select-none" dir="rtl">
      <div className="pb-1 border-b border-black/20 text-[11px] font-extrabold text-black">
        العلامات الحيوية:
      </div>

      <div className="space-y-1 text-xs text-black">
        {bp && (
          <div className="flex items-center justify-between text-xs text-black">
            <span className="font-bold text-[11px]">الضغط:</span>
            <span className="font-mono font-bold" dir="ltr">{bp}</span>
          </div>
        )}
        {hr && (
          <div className="flex items-center justify-between text-xs text-black">
            <span className="font-bold text-[11px]">النبض:</span>
            <span className="font-mono font-bold" dir="ltr">{hr} bpm</span>
          </div>
        )}
        {temp && (
          <div className="flex items-center justify-between text-xs text-black">
            <span className="font-bold text-[11px]">الحرارة:</span>
            <span className="font-mono font-bold" dir="ltr">{temp} °C</span>
          </div>
        )}
        {weight && (
          <div className="flex items-center justify-between text-xs text-black">
            <span className="font-bold text-[11px]">الوزن:</span>
            <span className="font-mono font-bold" dir="ltr">{weight} kg</span>
          </div>
        )}
        {height && (
          <div className="flex items-center justify-between text-xs text-black">
            <span className="font-bold text-[11px]">الطول:</span>
            <span className="font-mono font-bold" dir="ltr">{height} cm</span>
          </div>
        )}
        {rbs && (
          <div className="flex items-center justify-between text-xs text-black">
            <span className="font-bold text-[11px]">السكر:</span>
            <span className="font-mono font-bold" dir="ltr">{rbs} mg</span>
          </div>
        )}
        {spo2 && (
          <div className="flex items-center justify-between text-xs text-black">
            <span className="font-bold text-[11px]">الأكسجين:</span>
            <span className="font-mono font-bold" dir="ltr">{spo2}%</span>
          </div>
        )}
      </div>

      {/* Diagnoses in Sidebar if enabled */}
      {shouldRenderDiagnoses && (
        <div className="pt-2 mt-2 border-t border-black/20 space-y-1 text-black">
          <div className="text-[10px] font-bold text-black">التشخيص:</div>
          {validDiagnoses.map((diag, idx) => (
            <div key={idx} className="text-[11px] font-semibold text-black leading-tight">
              • {diag}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Vitals in Horizontal Row (Stacked Layout)
  const renderHorizontalVitalsBar = () => (
    <div className="mb-2 pb-1.5 border-b border-black/20 text-xs text-black" dir="rtl">
      <div className="flex items-center gap-3 flex-wrap text-black font-semibold">
        <span className="font-bold text-[11px]">العلامات الحيوية:</span>
        {bp && <span className="font-mono"><span className="font-sans font-bold">الضغط:</span> {bp}</span>}
        {hr && <span className="font-mono"><span className="font-sans font-bold">النبض:</span> {hr} bpm</span>}
        {temp && <span className="font-mono"><span className="font-sans font-bold">الحرارة:</span> {temp}°C</span>}
        {weight && <span className="font-mono"><span className="font-sans font-bold">الوزن:</span> {weight} kg</span>}
        {rbs && <span className="font-mono"><span className="font-sans font-bold">السكر:</span> {rbs} mg</span>}
        {spo2 && <span className="font-mono"><span className="font-sans font-bold">SpO2:</span> {spo2}%</span>}
      </div>

      {shouldRenderDiagnoses && (
        <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-black">
          <span className="font-bold">التشخيص:</span>
          {validDiagnoses.map((diag, idx) => (
            <span key={idx} className="font-semibold text-black">
              {idx > 0 && '— '}
              {diag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Render Medications List (Strict Two-Line Format, Pure Black)
  const renderMedications = () => {
    if (!medications || medications.length === 0) {
      return (
        <div className="py-6 text-center text-xs text-black/40 italic my-2">
          لا توجد أدوية مسجلة في هذه الروشتة.
        </div>
      );
    }

    return (
      <div className={fontClasses.spacing}>
        {medications.map((med, index) => {
          const drugName = med?.drug_name || med?.name || 'Unnamed Medication';
          const unifiedDosage = med?.dosage || '';

          // Construct Arabic dosage line
          const arabicInstructionLine = unifiedDosage || 'حسب إرشادات الطبيب المعالج';

          return (
            <div key={med.id || index} className="pt-1.5 first:pt-0">
              {/* LINE 1: English Bold Drug Name in Pure Black */}
              <div className="flex items-baseline justify-between gap-2 text-left" dir="ltr">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-black text-black select-none text-xs">
                    {index + 1} -
                  </span>
                  <div>
                    <span className={`font-sans tracking-tight text-black ${fontClasses.drugTitle}`}>
                      {drugName}
                    </span>
                  </div>
                </div>
              </div>

              {/* LINE 2: Clear Arabic Dosage & Instructions directly underneath in Pure Black */}
              <div className="mt-0.5 pr-6 text-right" dir="rtl">
                <p className={`m-0 leading-relaxed tracking-wide text-black ${fontClasses.doseLine}`}>
                  {arabicInstructionLine}
                </p>
              </div>
            </div>
          );
        })}

        {/* General Medical Advice underneath medications */}
        {advice && (
          <div className="mt-3 pt-2 border-t border-black/15 text-right text-black" dir="rtl">
            <span className="font-bold text-xs text-black block mb-0.5">
              التعليمات الطبية:
            </span>
            <p className="text-xs text-black whitespace-pre-wrap font-medium m-0 leading-relaxed">
              {advice}
            </p>
          </div>
        )}

        {/* Follow-up date if present */}
        {followUpDate && (
          <div className="mt-2 flex items-center justify-between text-xs text-black font-semibold pt-1 border-t border-black/10" dir="rtl">
            <span>الاستشارة القادمة:</span>
            <strong className="font-mono font-bold text-black">
              {new Date(followUpDate).toLocaleDateString('ar-EG', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </strong>
          </div>
        )}
      </div>
    );
  };

  // LAYOUT 1: Two Columns (20% Vitals side column + 80% Medications)
  if (layout === 'columns' && shouldRenderVitals) {
    return (
      <div className={`prescription-body-root py-1 text-black ${className}`}>
        <div className="grid grid-cols-12 gap-3 items-start">
          {/* Main Medications Column (80%) */}
          <div className="col-span-9 pl-2">
            {renderMedications()}
          </div>

          {/* Vitals Sidebar Column (20%) — borderless and calm */}
          <div className="col-span-3 border-r border-black/20 pr-2">
            {renderStackedVitalsColumn()}
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 2: Stacked (Top Vitals row + Full width Medications)
  return (
    <div className={`prescription-body-root py-1 text-black ${className}`}>
      {shouldRenderVitals && renderHorizontalVitalsBar()}
      {renderMedications()}
    </div>
  );
}
