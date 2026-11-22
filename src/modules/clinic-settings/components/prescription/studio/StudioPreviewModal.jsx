import React from 'react';
import { X } from 'lucide-react';
import NodePreviewContent from './NodePreviewContent';

export default function StudioPreviewModal({
  isOpen,
  onClose,
  pageLayout,
  paperSize = 'A5',
  customImageUrl = null,
}) {
  if (!isOpen) return null;

  const isA4 = paperSize === 'A4';
  const paperAspect = isA4 ? '210 / 297' : '148 / 210';

  const patientNodeKeys = pageLayout?.patient_mode === 'split'
    ? ['patient_name', 'patient_age', 'patient_date', 'patient_rx_code', 'patient_phone']
    : ['patient_unified'];

  const vitalsNodeKeys = pageLayout?.vitals_mode === 'split'
    ? Object.keys(pageLayout?.vitals_items || {})
    : ['vitals_block'];

  const clinicalNodeKeys = [
    'diagnosis_block',
    ...(pageLayout?.refraction_block ? ['refraction_block'] : []),
    'medications_block',
    'advice_block',
    'qr_block',
  ];

  const allActiveKeys = [...patientNodeKeys, ...vitalsNodeKeys, ...clinicalNodeKeys];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">معاينة الروشتة الحرة للطباعة</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">محاكاة دقيقة لشكل المخرجات الورقية بالمقاس المحدد ({paperSize})</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Paper Simulation Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100/80 flex items-center justify-center">
          <div
            style={{ aspectRatio: paperAspect }}
            className="relative bg-white rounded shadow-lg border border-slate-300 w-full max-w-[420px] overflow-hidden select-none"
          >
            {customImageUrl && (
              <img
                src={customImageUrl}
                alt="Stationery Background"
                loading="eager"
                decoding="sync"
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
              />
            )}

            {allActiveKeys.map((key) => {
              const isVitalItem = pageLayout?.vitals_mode === 'split' && pageLayout?.vitals_items && key in pageLayout.vitals_items;
              const node = isVitalItem ? pageLayout.vitals_items[key] : pageLayout?.[key];

              if (!node || node.is_visible === false) return null;

              return (
                <div
                  key={key}
                  style={{
                    position: 'absolute',
                    left: `${node.x_pct}%`,
                    top: `${node.y_pct}%`,
                    width: `${node.width_pct}%`,
                    height: `${node.height_pct}%`,
                  }}
                  className="overflow-hidden z-10"
                >
                  <NodePreviewContent nodeId={key} node={node} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            تأكد من ملاءمة الأحجام والهوامش قبل الاعتماد النهائي.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
}
