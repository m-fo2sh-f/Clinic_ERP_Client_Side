import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import PrescriptionPrintWrapper from '../../clinical/components/PrescriptionPrintWrapper';
import { SAMPLE_PRESCRIPTION_DATA } from '../../clinical/templates/TemplateHelpers';

/**
 * VisualMarginCalibrator — Interactive visual calibration tool with sliders for Top, Bottom, Left, Right margins
 * and an exact, live 1:1 replica of the actual printed prescription (نسخة تيبكال للطباعة) using PrescriptionPrintWrapper.
 */
export default function VisualMarginCalibrator({
  values = {
    top_margin_cm: 3.5,
    bottom_margin_cm: 2.5,
    left_margin_cm: 1.5,
    right_margin_cm: 1.5,
  },
  onChange,
}) {
  const [showGuides, setShowGuides] = useState(true);

  const top = Number(values.top_margin_cm ?? 3.5);
  const bottom = Number(values.bottom_margin_cm ?? 2.5);
  const left = Number(values.left_margin_cm ?? 1.5);
  const right = Number(values.right_margin_cm ?? 1.5);

  const updateMargin = (field, val) => {
    const maxVal = field === 'top_margin_cm' ? 25 : field === 'bottom_margin_cm' ? 20 : 10;
    const num = Math.max(0.2, Math.min(maxVal, parseFloat(val) || 0.2));
    onChange?.({
      ...values,
      [field]: parseFloat(num.toFixed(1)),
    });
  };

  const applyPreset = (preset) => {
    onChange?.({
      ...values,
      ...preset,
    });
  };

  // Paper geometry based on active settings (A3, A4, or A5)
  const paperSize = values.paper_size || 'A5';
  const paperDimensions = paperSize === 'A3'
    ? { widthMm: 297, heightMm: 420, width: '297mm', height: '420mm', label: 'A3 (297 x 420 mm)' }
    : paperSize === 'A4'
      ? { widthMm: 210, heightMm: 297, width: '210mm', height: '297mm', label: 'A4 (210 x 297 mm)' }
      : { widthMm: 148, heightMm: 210, width: '148mm', height: '210mm', label: 'A5 (148 x 210 mm)' };

  // Calculate guide overlay percentages based on real paper height and width
  const paperHeightCm = paperDimensions.heightMm / 10;
  const paperWidthCm = paperDimensions.widthMm / 10;

  const topPercent = Math.min(85, (top / paperHeightCm) * 100);
  const bottomPercent = Math.min(60, (bottom / paperHeightCm) * 100);
  const leftPercent = Math.min(45, (left / paperWidthCm) * 100);
  const rightPercent = Math.min(45, (right / paperWidthCm) * 100);

  // Exact scale calculation to fit the 320px wide container with zero distortion
  const containerWidthPx = 320;
  const paperWidthPx = paperDimensions.widthMm * 3.779528; // 1mm = 3.779528px at standard 96 DPI
  const scale = containerWidthPx / paperWidthPx;
  const containerHeightPx = Math.round(containerWidthPx * (paperDimensions.heightMm / paperDimensions.widthMm));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6" dir="ltr">
      {/* Calibrator Header & Quick Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-clinic-600" />
            <span>Interactive Margin Calibrator (معايرة الهوامش التفاعلية)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Adjust top, bottom, and side margins to fit your physical pre-printed pad or custom stationery without colliding.
          </p>
        </div>

        {/* Quick Presets for Different Letterhead Sizes */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 3.5,
                bottom_margin_cm: 2.5,
                left_margin_cm: 1.5,
                right_margin_cm: 1.5,
              })
            }
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-clinic-50 text-slate-700 hover:text-clinic-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            Standard (3.5cm)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 6.0,
                bottom_margin_cm: 2.8,
                left_margin_cm: 1.5,
                right_margin_cm: 1.5,
              })
            }
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-clinic-50 text-slate-700 hover:text-clinic-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            Medium Header (6.0cm)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 8.5,
                bottom_margin_cm: 3.0,
                left_margin_cm: 1.6,
                right_margin_cm: 1.6,
              })
            }
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-clinic-50 text-slate-700 hover:text-clinic-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            High Letterhead (8.5cm)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 12.0,
                bottom_margin_cm: 3.5,
                left_margin_cm: 1.8,
                right_margin_cm: 1.8,
              })
            }
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-clinic-50 text-slate-700 hover:text-clinic-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            Deep Header (12.0cm)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 3.5,
                bottom_margin_cm: 2.5,
                left_margin_cm: 1.5,
                right_margin_cm: 1.5,
              })
            }
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Margin Slider (Extended to 18cm slider / 25cm manual) */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ArrowUp className="h-4 w-4 text-clinic-600" />
                <span>Top Margin (الهامش العلوي لرأس الروشتة):</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="25.0"
                  value={top}
                  onChange={(e) => updateMargin('top_margin_cm', e.target.value)}
                  className="w-16 px-2 py-1 text-right text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                />
                <span className="text-xs font-bold text-slate-500">cm</span>
              </div>
            </div>
            <input
              type="range"
              step="0.1"
              min="0.5"
              max="18.0"
              value={top}
              onChange={(e) => updateMargin('top_margin_cm', e.target.value)}
              className="w-full accent-clinic-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0.5 cm</span>
              <span className="font-bold text-clinic-700">{top} cm</span>
              <span>18.0 cm</span>
            </div>
          </div>

          {/* Bottom Margin Slider (Extended to 12cm slider / 20cm manual) */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ArrowDown className="h-4 w-4 text-clinic-600" />
                <span>Bottom Margin (الهامش السفلي لتذييل الصفحة):</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="20.0"
                  value={bottom}
                  onChange={(e) => updateMargin('bottom_margin_cm', e.target.value)}
                  className="w-16 px-2 py-1 text-right text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                />
                <span className="text-xs font-bold text-slate-500">cm</span>
              </div>
            </div>
            <input
              type="range"
              step="0.1"
              min="0.5"
              max="12.0"
              value={bottom}
              onChange={(e) => updateMargin('bottom_margin_cm', e.target.value)}
              className="w-full accent-clinic-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0.5 cm</span>
              <span className="font-bold text-clinic-700">{bottom} cm</span>
              <span>12.0 cm</span>
            </div>
          </div>

          {/* Left & Right Margins (Extended to 8cm slider / 10cm manual) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left Margin Slider */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ArrowLeft className="h-4 w-4 text-clinic-600" />
                  <span>Left Margin (الهامش الأيسر):</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10.0"
                    value={left}
                    onChange={(e) => updateMargin('left_margin_cm', e.target.value)}
                    className="w-14 px-1.5 py-0.5 text-right text-xs font-mono font-bold bg-white border border-slate-300 rounded"
                  />
                  <span className="text-[11px] font-bold text-slate-500">cm</span>
                </div>
              </div>
              <input
                type="range"
                step="0.1"
                min="0.5"
                max="8.0"
                value={left}
                onChange={(e) => updateMargin('left_margin_cm', e.target.value)}
                className="w-full accent-clinic-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0.5 cm</span>
                <span className="font-bold text-clinic-700">{left} cm</span>
                <span>8.0 cm</span>
              </div>
            </div>

            {/* Right Margin Slider */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-clinic-600" />
                  <span>Right Margin (الهامش الأيمن):</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10.0"
                    value={right}
                    onChange={(e) => updateMargin('right_margin_cm', e.target.value)}
                    className="w-14 px-1.5 py-0.5 text-right text-xs font-mono font-bold bg-white border border-slate-300 rounded"
                  />
                  <span className="text-[11px] font-bold text-slate-500">cm</span>
                </div>
              </div>
              <input
                type="range"
                step="0.1"
                min="0.5"
                max="8.0"
                value={right}
                onChange={(e) => updateMargin('right_margin_cm', e.target.value)}
                className="w-full accent-clinic-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0.5 cm</span>
                <span className="font-bold text-clinic-700">{right} cm</span>
                <span>8.0 cm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Sheet Canvas — EXACT TYPICAL REPLICA OF PRINT DOCUMENT */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-clinic-600" />
              <span>Live Sheet Canvas ({paperDimensions.label})</span>
            </div>

            {/* Toggle Margin Guidelines Overlay */}
            <button
              type="button"
              onClick={() => setShowGuides(!showGuides)}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                showGuides
                  ? 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
              title="تبديل إظهار خطوط الهوامش الإرشادية"
            >
              {showGuides ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <span>{showGuides ? 'إخفاء خطوط الهوامش' : 'إظهار خطوط الهوامش'}</span>
            </button>
          </div>

          {/* Viewport for Scaled Real Prescription Document */}
          <div
            className="relative bg-white rounded-xl shadow-xl border-2 border-slate-300 overflow-hidden select-none"
            style={{
              width: `${containerWidthPx}px`,
              height: `${containerHeightPx}px`,
            }}
          >
            {/* The Actual Real Prescription Component scaled down to fit */}
            <div
              style={{
                width: paperDimensions.width,
                minHeight: paperDimensions.height,
                height: paperDimensions.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}
            >
              <PrescriptionPrintWrapper
                settings={values}
                patient={SAMPLE_PRESCRIPTION_DATA.patient}
                doctor={{ name: values.doctor_name, title: values.doctor_title }}
                branch={{ name: values.clinic_name }}
                encounter={SAMPLE_PRESCRIPTION_DATA.encounter}
                vitals={SAMPLE_PRESCRIPTION_DATA.vitals}
                diagnoses={SAMPLE_PRESCRIPTION_DATA.diagnoses}
                medications={SAMPLE_PRESCRIPTION_DATA.medications}
                advice={SAMPLE_PRESCRIPTION_DATA.advice}
                followUpDate={SAMPLE_PRESCRIPTION_DATA.followUpDate}
                isPreview={true}
              />
            </div>

            {/* Interactive Margin Guidelines Overlay */}
            {showGuides && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* Top Margin Shaded Guide Overlay */}
                <div
                  className="absolute top-0 left-0 right-0 bg-sky-400/20 border-b-2 border-dashed border-sky-600 flex items-center justify-center transition-all duration-100"
                  style={{ height: `${topPercent}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-sky-950 bg-white/95 px-2 py-0.5 rounded shadow-sm border border-sky-300">
                    Top: {top} cm
                  </span>
                </div>

                {/* Bottom Margin Shaded Guide Overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-sky-400/20 border-t-2 border-dashed border-sky-600 flex items-center justify-center transition-all duration-100"
                  style={{ height: `${bottomPercent}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-sky-950 bg-white/95 px-2 py-0.5 rounded shadow-sm border border-sky-300">
                    Bottom: {bottom} cm
                  </span>
                </div>

                {/* Left Margin Shaded Guide Overlay */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-amber-300/20 border-r border-dashed border-amber-500 transition-all duration-100"
                  style={{ width: `${leftPercent}%` }}
                />

                {/* Right Margin Shaded Guide Overlay */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-amber-300/20 border-l border-dashed border-amber-500 transition-all duration-100"
                  style={{ width: `${rightPercent}%` }}
                />
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center max-w-[320px]">
            معاينة حية ومطابقة 100% لما سيتم طباعته على الورق الفعلي مع إمكانية إظهار أو إخفاء خطوط الهوامش الإرشادية.
          </p>
        </div>
      </div>
    </div>
  );
}
