import React, { useState } from 'react';
import { Sliders, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { MARGIN_BOUNDS, PAPER_SIZES } from '../../constants/prescriptionConstants';
import MarginPreviewCanvas from './MarginPreviewCanvas';

export default function VisualMarginCalibrator({
  settings = {},
  margins,
  paperSize = 'A5',
  onMarginChange,
  onPaperSizeChange,
  disabled = false,
}) {
  const [showGuides, setShowGuides] = useState(true);

  const safe = margins || {};
  const rawTop = Number(safe.top_cm ?? MARGIN_BOUNDS.top.default);
  const rawBottom = Number(safe.bottom_cm ?? MARGIN_BOUNDS.bottom.default);
  const rawLeft = Number(safe.left_cm ?? MARGIN_BOUNDS.left.default);
  const rawRight = Number(safe.right_cm ?? MARGIN_BOUNDS.right.default);

  const top = Number.isFinite(rawTop) ? rawTop : MARGIN_BOUNDS.top.default;
  const bottom = Number.isFinite(rawBottom) ? rawBottom : MARGIN_BOUNDS.bottom.default;
  const left = Number.isFinite(rawLeft) ? rawLeft : MARGIN_BOUNDS.left.default;
  const right = Number.isFinite(rawRight) ? rawRight : MARGIN_BOUNDS.right.default;

  const handleSliderChange = (field, val) => {
    const num = parseFloat(parseFloat(val).toFixed(1));
    onMarginChange?.({ ...(margins || {}), [field]: num });
  };

  const resetToDefault = () => {
    onMarginChange?.({
      top_cm: MARGIN_BOUNDS.top.default,
      bottom_cm: MARGIN_BOUNDS.bottom.default,
      left_cm: MARGIN_BOUNDS.left.default,
      right_cm: MARGIN_BOUNDS.right.default,
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-clinic-600" />
            <span>معايرة هوامش الروشتة التفاعلية (Margin Calibrator)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            اضبط مسافات الهوامش بدقة لتفادي الاصطدام برأس وتذييل ورق المطبعة المسبق.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowGuides(!showGuides)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {showGuides ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showGuides ? 'إخفاء الإرشادات' : 'إظهار الإرشادات'}</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={resetToDefault}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>استعادة الافتراضي</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders Form (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">مقاس ورق الطباعة (Paper Size)</label>
            <div className="grid grid-cols-2 gap-2">
              {PAPER_SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPaperSizeChange?.(size.id)}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-start transition-all cursor-pointer ${
                    paperSize === size.id
                      ? 'border-clinic-600 bg-clinic-50/70 text-clinic-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{size.id}</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">{size.label.split('(')[1]?.replace(')', '') || size.id}</span>
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'top_cm', val: top, label: 'الهامش العلوي (مسافة الهيدر):', icon: ArrowUp, bound: MARGIN_BOUNDS.top },
            { key: 'bottom_cm', val: bottom, label: 'الهامش السفلي (مسافة الفوتر):', icon: ArrowDown, bound: MARGIN_BOUNDS.bottom },
          ].map((item) => (
            <div key={item.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <item.icon className="h-3.5 w-3.5 text-clinic-600" />
                  {item.label}
                </span>
                <span className="font-mono text-clinic-700">{item.val} سم</span>
              </div>
              <input
                type="range"
                min={item.bound.min}
                max={item.bound.max}
                step={item.bound.step}
                value={item.val}
                disabled={disabled}
                onChange={(e) => handleSliderChange(item.key, e.target.value)}
                className="w-full accent-clinic-600 cursor-pointer"
              />
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'right_cm', val: right, label: 'الهامش الأيمن:', icon: ArrowRight, bound: MARGIN_BOUNDS.right },
              { key: 'left_cm', val: left, label: 'الهامش الأيسر:', icon: ArrowLeft, bound: MARGIN_BOUNDS.left },
            ].map((item) => (
              <div key={item.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <item.icon className="h-3.5 w-3.5 text-clinic-600" />
                    {item.label}
                  </span>
                  <span className="font-mono text-clinic-700">{item.val} سم</span>
                </div>
                <input
                  type="range"
                  min={item.bound.min}
                  max={item.bound.max}
                  step={item.bound.step}
                  value={item.val}
                  disabled={disabled}
                  onChange={(e) => handleSliderChange(item.key, e.target.value)}
                  className="w-full accent-clinic-600 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Canvas Visual Preview (5 cols) */}
        <div className="lg:col-span-5">
          <MarginPreviewCanvas
            settings={settings}
            paperSize={paperSize}
            top={top}
            bottom={bottom}
            left={left}
            right={right}
            showGuides={showGuides}
          />
        </div>
      </div>
    </div>
  );
}
