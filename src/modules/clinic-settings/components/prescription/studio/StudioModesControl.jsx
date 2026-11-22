import React from 'react';
import { RotateCcw, Magnet, Image as ImageIcon } from 'lucide-react';

export default function StudioModesControl({
  patientMode,
  vitalsMode,
  onUpdatePageSetting,
  isSnapEnabled,
  onToggleSnap,
  showGuideImage,
  onToggleGuideImage,
  hasGuideImage,
  onResetToDefault,
}) {
  return (
    <div className="space-y-4">
      {/* Partition Modes */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <span className="text-[10px] font-black uppercase text-slate-400 block">خيارات وأنماط التقسيم</span>

        {/* Patient Info Mode */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">بيانات المريض:</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onUpdatePageSetting('patient_mode', 'unified')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                patientMode !== 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              شريط موحد
            </button>
            <button
              type="button"
              onClick={() => onUpdatePageSetting('patient_mode', 'split')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                patientMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              عناصر منفصلة
            </button>
          </div>
        </div>

        {/* Vitals Mode */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">العلامات الحيوية:</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onUpdatePageSetting('vitals_mode', 'unified')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                vitalsMode !== 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              كتلة موحدة
            </button>
            <button
              type="button"
              onClick={() => onUpdatePageSetting('vitals_mode', 'split')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                vitalsMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              عناصر منفصلة
            </button>
          </div>
        </div>
      </div>

      {/* Snap, Guide & Reset Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onToggleSnap}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            isSnapEnabled ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Magnet className="h-4 w-4" />
            <span>محاذاة الشبكة (Snap 0.5%)</span>
          </span>
          <span className="text-[10px]">{isSnapEnabled ? 'مفعل' : 'معطل'}</span>
        </button>

        {hasGuideImage && (
          <button
            type="button"
            onClick={onToggleGuideImage}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              showGuideImage ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span>دليل ورقة المطبعة (Guide)</span>
            </span>
            <span className="text-[10px]">{showGuideImage ? 'ظاهر' : 'مخفي'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في استعادة التخطيط القياسي للورقة؟')) {
              onResetToDefault();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50/60 hover:bg-red-100 border border-red-200 transition-colors mt-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>استعادة التخطيط القياسي للورقة</span>
        </button>
      </div>
    </div>
  );
}
