import React from 'react';
import { RotateCcw, Magnet, Image as ImageIcon } from 'lucide-react';

export default function StudioModesControl({
  patientMode,
  vitalsMode,
  onUpdatePageSetting,
  snapGrid = '5mm',
  onSnapGridChange,
  showGuideImage,
  onToggleGuideImage,
  hasGuideImage,
  onResetToDefault,
}) {
  return (
    <div className="space-y-4 text-left" dir="ltr">
      {/* Partition Modes */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <span className="text-[10px] font-black uppercase text-slate-400 block">Layout Grouping Modes</span>

        {/* Patient Info Mode */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Patient Information:</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onUpdatePageSetting('patient_mode', 'unified')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                patientMode !== 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Unified Bar
            </button>
            <button
              type="button"
              onClick={() => onUpdatePageSetting('patient_mode', 'split')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                patientMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Split Fields
            </button>
          </div>
        </div>

        {/* Vitals Mode */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Vital Signs Mode:</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onUpdatePageSetting('vitals_mode', 'unified')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                vitalsMode !== 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Unified Block
            </button>
            <button
              type="button"
              onClick={() => onUpdatePageSetting('vitals_mode', 'split')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                vitalsMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Split Items
            </button>
          </div>
        </div>
      </div>

      {/* Magnetic Snap Selector (Off, 5mm, 10mm) */}
      <div className="space-y-1.5 pb-2">
        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
          <Magnet className="h-3.5 w-3.5 text-blue-600" />
          <span>Magnetic Snap Grid:</span>
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'off', label: 'Off' },
            { id: '5mm', label: '5mm' },
            { id: '10mm', label: '10mm' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSnapGridChange?.(item.id)}
              className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                snapGrid === item.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Image & Reset Actions */}
      <div className="space-y-2 pt-1">
        {hasGuideImage && (
          <button
            type="button"
            onClick={onToggleGuideImage}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showGuideImage ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span>Letterhead Guide</span>
            </span>
            <span className="text-[10px] font-semibold">{showGuideImage ? 'Visible' : 'Hidden'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all canvas coordinates to factory default?')) {
              onResetToDefault?.();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Factory Coordinates</span>
        </button>
      </div>
    </div>
  );
}
