import React from 'react';
import { Sliders, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye } from 'lucide-react';

/**
 * VisualMarginCalibrator — Interactive visual calibration tool with sliders for Top, Bottom, Left, Right margins
 * and a live virtual A5 canvas displaying real-time placement and bounding boundaries.
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
  const top = Number(values.top_margin_cm ?? 3.5);
  const bottom = Number(values.bottom_margin_cm ?? 2.5);
  const left = Number(values.left_margin_cm ?? 1.5);
  const right = Number(values.right_margin_cm ?? 1.5);

  const updateMargin = (field, val) => {
    const num = Math.max(0.5, Math.min(10, parseFloat(val) || 0.5));
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

  // Convert cm to percentage for a virtual A5 sheet (14.8cm width x 21.0cm height)
  const a5WidthCm = 14.8;
  const a5HeightCm = 21.0;

  const topPercent = Math.min(45, (top / a5HeightCm) * 100);
  const bottomPercent = Math.min(40, (bottom / a5HeightCm) * 100);
  const leftPercent = Math.min(30, (left / a5WidthCm) * 100);
  const rightPercent = Math.min(30, (right / a5WidthCm) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6" dir="ltr">
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

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 3.8,
                bottom_margin_cm: 2.8,
                left_margin_cm: 1.5,
                right_margin_cm: 1.5,
              })
            }
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-clinic-50 text-slate-700 hover:text-clinic-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            Standard Pad
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 2.4,
                bottom_margin_cm: 1.8,
                left_margin_cm: 1.2,
                right_margin_cm: 1.2,
              })
            }
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-clinic-50 text-slate-700 hover:text-clinic-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            Compact Pad
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                top_margin_cm: 5.0,
                bottom_margin_cm: 2.5,
                left_margin_cm: 1.6,
                right_margin_cm: 1.6,
              })
            }
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-clinic-50 text-slate-700 hover:text-clinic-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            High Header (5cm)
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
          {/* Top Margin Slider */}
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
                  min="0.5"
                  max="10.0"
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
              max="8.0"
              value={top}
              onChange={(e) => updateMargin('top_margin_cm', e.target.value)}
              className="w-full accent-clinic-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0.5 cm</span>
              <span className="font-bold text-clinic-700">{top} cm</span>
              <span>8.0 cm</span>
            </div>
          </div>

          {/* Bottom Margin Slider */}
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
                  min="0.5"
                  max="8.0"
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
              max="6.0"
              value={bottom}
              onChange={(e) => updateMargin('bottom_margin_cm', e.target.value)}
              className="w-full accent-clinic-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0.5 cm</span>
              <span className="font-bold text-clinic-700">{bottom} cm</span>
              <span>6.0 cm</span>
            </div>
          </div>

          {/* Left & Right Margins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left Margin Slider */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ArrowLeft className="h-4 w-4 text-clinic-600" />
                  <span>Left Margin (الهامش الأيسر):</span>
                </label>
                <span className="text-xs font-mono font-bold text-clinic-700">{left} cm</span>
              </div>
              <input
                type="range"
                step="0.1"
                min="0.5"
                max="4.0"
                value={left}
                onChange={(e) => updateMargin('left_margin_cm', e.target.value)}
                className="w-full accent-clinic-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0.5 cm</span>
                <span>4.0 cm</span>
              </div>
            </div>

            {/* Right Margin Slider */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-clinic-600" />
                  <span>Right Margin (الهامش الأيمن):</span>
                </label>
                <span className="text-xs font-mono font-bold text-clinic-700">{right} cm</span>
              </div>
              <input
                type="range"
                step="0.1"
                min="0.5"
                max="4.0"
                value={right}
                onChange={(e) => updateMargin('right_margin_cm', e.target.value)}
                className="w-full accent-clinic-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0.5 cm</span>
                <span>4.0 cm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Virtual A5 Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-clinic-600" />
            <span>Live Virtual A5 Canvas (محاكاة ورقة A5 حية)</span>
          </div>

          {/* Virtual A5 Sheet (Proportion 148:210, e.g. 296px x 420px) */}
          <div className="relative w-[280px] h-[396px] bg-white rounded-lg shadow-xl border-2 border-slate-300 overflow-hidden select-none">
            {/* Top Margin Shaded Guide */}
            <div
              className="absolute top-0 left-0 right-0 bg-sky-200/50 border-b border-dashed border-sky-400 flex items-center justify-center transition-all duration-150 z-20"
              style={{ height: `${topPercent}%` }}
            >
              <span className="text-[10px] font-mono font-bold text-sky-800 bg-white/80 px-1.5 py-0.5 rounded shadow-2xs">
                Top: {top} cm (Preprinted Header)
              </span>
            </div>

            {/* Bottom Margin Shaded Guide */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-sky-200/50 border-t border-dashed border-sky-400 flex items-center justify-center transition-all duration-150 z-20"
              style={{ height: `${bottomPercent}%` }}
            >
              <span className="text-[10px] font-mono font-bold text-sky-800 bg-white/80 px-1.5 py-0.5 rounded shadow-2xs">
                Bottom: {bottom} cm (Preprinted Footer)
              </span>
            </div>

            {/* Left Margin Shaded Guide */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-amber-100/40 border-r border-dashed border-amber-400 transition-all duration-150 z-10"
              style={{ width: `${leftPercent}%` }}
            />

            {/* Right Margin Shaded Guide */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-amber-100/40 border-l border-dashed border-amber-400 transition-all duration-150 z-10"
              style={{ width: `${rightPercent}%` }}
            />

            {/* Printable Content Area Simulated Content */}
            <div
              className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none transition-all duration-150 text-[9px]"
              style={{
                paddingTop: `${topPercent}%`,
                paddingBottom: `${bottomPercent}%`,
                paddingLeft: `${leftPercent}%`,
                paddingRight: `${rightPercent}%`,
              }}
              dir="rtl"
            >
              <div className="space-y-1.5">
                {/* Simulated Rx Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-serif font-black text-sm text-clinic-600" dir="ltr">℞</span>
                  <span className="font-bold text-slate-700">أحمد محمود (38 سنة)</span>
                </div>

                {/* Simulated Vitals */}
                <div className="bg-slate-50 border border-slate-200 rounded p-1 flex justify-between font-mono text-[8px] text-slate-600">
                  <span>BP: 120/80</span>
                  <span>HR: 72</span>
                  <span>Wt: 75kg</span>
                </div>

                {/* Simulated Medications */}
                <div className="space-y-1 pt-1" dir="ltr">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="font-bold text-slate-800">1. Augmentin 1g tab</span>
                    <span className="text-slate-500 font-mono">1x2 (7d)</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="font-bold text-slate-800">2. Panadol 500mg tab</span>
                    <span className="text-slate-500 font-mono">PRN</span>
                  </div>
                </div>

                {/* Simulated Advice */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded p-1 text-[8px] text-emerald-800 mt-1">
                  شرب سوائل دافئة ومراجعة العيادة بعد 7 أيام.
                </div>
              </div>

              {/* Simulated Doctor Stamp */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[8px] text-slate-400">
                <span>توقيع الطبيب</span>
                <span className="font-mono">RX-2026</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center max-w-[280px]">
            Blue shaded zones represent reserved pre-printed paper headers & footers.
          </p>
        </div>
      </div>
    </div>
  );
}
