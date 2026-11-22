import React from 'react';
import DraggableCanvasNode from './DraggableCanvasNode';
import NodePreviewContent from './NodePreviewContent';

export default function InteractivePaperCanvas({
  canvasRef,
  pageLayout,
  paperSize = 'A4',
  selectedNodeId,
  onSelectNode,
  onPointerDown,
  isSnapEnabled = true,
  showGuideImage = true,
  guideImageUrl = null,
  customImageUrl = null,
}) {
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

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-backdrop')) {
      onSelectNode?.(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/5 rounded-3xl border border-slate-200/80 shadow-inner overflow-auto w-full">
      {/* Physical Paper Sheet Canvas */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ aspectRatio: paperAspect }}
        className={`canvas-backdrop relative bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-[440px] sm:max-w-[480px] overflow-hidden select-none transition-all ${isSnapEnabled ? 'bg-paper-grid' : ''
          }`}
      >
        {/* Layer 1: Custom Background Stationery (if custom image mode) */}
        {customImageUrl && (
          <img
            src={customImageUrl}
            alt="Prescription Custom Background"
            loading="eager"
            decoding="sync"
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
          />
        )}

        {/* Layer 2: Letterhead Guide Image (for alignment against preprinted stationery) */}
        {showGuideImage && guideImageUrl && !customImageUrl && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={guideImageUrl}
              alt="Letterhead Alignment Guide"
              className="w-full h-full object-fill opacity-35"
            />
            <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-2xs">
              دليل المطبعة (Guide)
            </div>
          </div>
        )}

        {/* Layer 3: Grid overlay (subtle visual assistance) */}
        {isSnapEnabled && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25 z-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
        )}

        {/* Layer 4: Interactive Canvas Nodes */}
        {allActiveKeys.map((key) => {
          const isVitalItem = pageLayout?.vitals_mode === 'split' && pageLayout?.vitals_items && key in pageLayout.vitals_items;
          const node = isVitalItem ? pageLayout.vitals_items[key] : pageLayout?.[key];

          if (!node) return null;

          return (
            <DraggableCanvasNode
              key={key}
              id={key}
              node={node}
              isSelected={selectedNodeId === key}
              onSelect={onSelectNode}
              onPointerDown={onPointerDown}
            >
              <NodePreviewContent nodeId={key} node={node} />
            </DraggableCanvasNode>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] font-bold text-slate-500">
        <span>ورقة الطباعة: {isA4 ? 'A4 (210×297 مم)' : 'A5 (148×210 مم)'}</span>
        <span>•</span>
        <span>الشبكة: {isSnapEnabled ? 'المحاذاة الذكية مفعلة (Snap 0.5%)' : 'محاذاة حرة'}</span>
      </div>
    </div>
  );
}
