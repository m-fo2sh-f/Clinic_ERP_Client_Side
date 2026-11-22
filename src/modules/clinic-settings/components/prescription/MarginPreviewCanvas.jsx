import React from 'react';
import SharedPrescriptionRenderer from '../../../clinical/components/SharedPrescriptionRenderer';
import { PAPER_DIMENSIONS } from '../../constants/prescriptionConstants';

/**
 * MarginPreviewCanvas — Authentic live print simulation canvas mirroring the actual
 * monochromatic clinical print output with pure millimeter accuracy.
 */
export default function MarginPreviewCanvas({
  paperSize = 'A4',
  top = 4.5,
  bottom = 3.0,
  left = 1.5,
  right = 1.5,
  showGuides = true,
  settings = {},
  vitalsConfig = null,
}) {
  const isA4 = paperSize === 'A4';
  const paperDim = PAPER_DIMENSIONS[isA4 ? 'A4' : 'A5'];
  const paperWidthMm = paperDim.widthMm;
  const paperHeightMm = paperDim.heightMm;

  // Approximate 96 DPI pixel values for exact scaling
  const paperWidthPx = (paperWidthMm / 25.4) * 96;
  const paperHeightPx = (paperHeightMm / 25.4) * 96;

  const targetWidthPx = 330;
  const scaleRatio = targetWidthPx / paperWidthPx;
  const scaledHeightPx = paperHeightPx * scaleRatio;

  const mode = settings?.mode || 'builtin';
  const modeLabel =
    mode === 'custom_image'
      ? 'Custom Stationery'
      : mode === 'letterhead'
        ? 'Offset Preprinted'
        : 'Built-in Template';

  const syntheticSettings = {
    ...settings,
    paper_size: isA4 ? 'A4' : 'A5',
    layout_mode: 'standard_flow',
    margins: {
      top_cm: top,
      bottom_cm: bottom,
      left_cm: left,
      right_cm: right,
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-2.5 text-left" dir="ltr">
      <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-700 px-1">
        <span>Live Print Simulation ({isA4 ? 'A4 210×297 mm' : 'A5 148×210 mm'})</span>
        <span className="text-[10px] font-semibold text-blue-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
          {modeLabel}
        </span>
      </div>

      {/* Scaled paper viewport container */}
      <div
        style={{
          width: `${targetWidthPx}px`,
          height: `${scaledHeightPx}px`,
          position: 'relative',
        }}
        className="bg-white rounded-lg shadow-lg border border-slate-300 overflow-hidden select-none shrink-0"
      >
        <div
          style={{
            width: `${paperWidthMm}mm`,
            height: `${paperHeightMm}mm`,
            transform: `scale(${scaleRatio})`,
            transformOrigin: 'top left',
          }}
          className="relative bg-white select-none"
        >
          <SharedPrescriptionRenderer
            settings={syntheticSettings}
            vitalsConfig={vitalsConfig || settings?.vitals_config}
            isPreview={true}
            isStudio={false}
            showSafeMargins={showGuides}
          />
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-medium">
        Calibrated Margins: Top {top}cm • Bottom {bottom}cm • Left {left}cm • Right {right}cm
      </div>
    </div>
  );
}
