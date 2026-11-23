import React from 'react';
import { X } from 'lucide-react';
import SharedPrescriptionRenderer from '../../../../clinical/components/SharedPrescriptionRenderer';

export default function StudioPreviewModal({
  isOpen,
  onClose,
  pageLayout,
  paperSize = 'A4',
  customImageUrl = null,
  vitalsConfig = null,
}) {
  if (!isOpen) return null;

  const syntheticSettings = {
    paper_size: paperSize,
    layout_mode: 'freeform_canvas',
    mode: customImageUrl ? 'custom_image' : 'builtin',
    image_url: customImageUrl,
    laser_contrast_opt: true,
    grayscale_mode: false,
    freeform_layout: {
      [paperSize]: pageLayout,
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir="ltr">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Print Simulation Preview ({paperSize})</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">1:1 Exact Physical Replica of Print Document Output</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Paper Simulation Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100/80 flex items-center justify-center">
          <SharedPrescriptionRenderer
            settings={syntheticSettings}
            vitalsConfig={vitalsConfig}
            isPreview={true}
            isStudio={false}
            showSafeMargins={false}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Physical layout coordinates and typography are locked to millimeter precision.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
