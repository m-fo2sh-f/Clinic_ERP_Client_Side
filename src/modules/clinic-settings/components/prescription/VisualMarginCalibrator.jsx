import React, { useState } from 'react';
import { Sliders, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { MARGIN_BOUNDS, PAPER_SIZES } from '../../constants/prescriptionConstants';
import MarginPreviewCanvas from './MarginPreviewCanvas';

export default function VisualMarginCalibrator({
  settings = {},
  margins,
  paperSize = 'A4',
  onMarginChange,
  onPaperSizeChange,
  vitalsConfig = null,
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
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in text-left" dir="ltr">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600" />
            <span>Interactive Margin Calibrator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            Calibrate print margins in centimeters to avoid overlapping with offset preprinted stationery letterheads.
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
            <span>{showGuides ? 'Hide Margin Guides' : 'Show Margin Guides'}</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={resetToDefault}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders Form (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Paper Sheet Standard</label>
            <div className="grid grid-cols-2 gap-2">
              {PAPER_SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPaperSizeChange?.(size.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-start transition-all cursor-pointer ${
                    paperSize === size.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{size.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">{size.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'top_cm', val: top, label: 'Top Margin (Header Offset):', icon: ArrowUp, bound: MARGIN_BOUNDS.top },
            { key: 'bottom_cm', val: bottom, label: 'Bottom Margin (Footer Offset):', icon: ArrowDown, bound: MARGIN_BOUNDS.bottom },
          ].map((item) => (
            <div key={item.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <item.icon className="h-3.5 w-3.5 text-blue-600" />
                  {item.label}
                </span>
                <span className="font-mono text-blue-700">{item.val} cm</span>
              </div>
              <input
                type="range"
                min={item.bound.min}
                max={item.bound.max}
                step={item.bound.step}
                value={item.val}
                disabled={disabled}
                onChange={(e) => handleSliderChange(item.key, e.target.value)}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'left_cm', val: left, label: 'Left Margin:', icon: ArrowLeft, bound: MARGIN_BOUNDS.left },
              { key: 'right_cm', val: right, label: 'Right Margin:', icon: ArrowRight, bound: MARGIN_BOUNDS.right },
            ].map((item) => (
              <div key={item.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <item.icon className="h-3.5 w-3.5 text-blue-600" />
                    {item.label}
                  </span>
                  <span className="font-mono text-blue-700">{item.val} cm</span>
                </div>
                <input
                  type="range"
                  min={item.bound.min}
                  max={item.bound.max}
                  step={item.bound.step}
                  value={item.val}
                  disabled={disabled}
                  onChange={(e) => handleSliderChange(item.key, e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Canvas Visual Preview (5 cols) */}
        <div className="lg:col-span-5">
          <MarginPreviewCanvas
            settings={settings}
            vitalsConfig={vitalsConfig}
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
