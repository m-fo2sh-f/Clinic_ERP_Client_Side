import React, { useRef, useState, useEffect } from 'react';
import SharedPrescriptionRenderer from '../../../../clinical/components/SharedPrescriptionRenderer';
import { PAPER_DIMENSIONS } from '../../../constants/prescriptionConstants';

export default function InteractivePaperCanvas({
  canvasRef,
  pageLayout,
  paperSize = 'A4',
  selectedNodeId,
  onSelectNode,
  onPointerDown,
  snapGrid = '5mm',
  isSnapEnabled = true,
  showGuideImage = true,
  guideImageUrl = null,
  customImageUrl = null,
  vitalsConfig = null,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(480);

  const activePaperSize = paperSize === 'A5' ? 'A5' : 'A4';
  const paperDim = PAPER_DIMENSIONS[activePaperSize];
  const paperWidthMm = paperDim.widthMm;
  const paperHeightMm = paperDim.heightMm;

  // Approximate 96 DPI pixel values for exact scaling
  const paperWidthPx = (paperWidthMm / 25.4) * 96;
  const paperHeightPx = (paperHeightMm / 25.4) * 96;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute scale ratio so paper fits comfortably inside studio container
  const paddingPx = 32;
  const availableWidth = Math.max(280, containerWidth - paddingPx);
  const scaleRatio = Math.min(1.0, Math.max(0.35, availableWidth / paperWidthPx));
  const scaledHeight = paperHeightPx * scaleRatio;

  const handleCanvasBackdropClick = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-backdrop')) {
      onSelectNode?.(null);
    }
  };

  const activeSnap = snapGrid || (isSnapEnabled ? '5mm' : 'off');

  // Synthetic settings passed to SharedPrescriptionRenderer
  const syntheticSettings = {
    paper_size: activePaperSize,
    layout_mode: 'freeform_canvas',
    mode: customImageUrl ? 'custom_image' : 'builtin',
    image_url: customImageUrl,
    guide_image_url: showGuideImage ? guideImageUrl : null,
    laser_contrast_opt: false,
    grayscale_mode: false,
    freeform_layout: {
      [activePaperSize]: pageLayout,
    },
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center p-3 sm:p-5 bg-slate-900/5 rounded-3xl border border-slate-200/80 shadow-inner overflow-hidden w-full select-none"
      dir="ltr"
    >
      {/* Scaled paper viewport container */}
      <div
        style={{
          width: `${paperWidthPx * scaleRatio}px`,
          height: `${scaledHeight}px`,
          position: 'relative',
        }}
        className="mx-auto shrink-0 select-none"
      >
        {/* Inner Physical Paper Canvas rendered at exact millimeter size */}
        <div
          ref={canvasRef}
          onClick={handleCanvasBackdropClick}
          style={{
            width: `${paperWidthMm}mm`,
            height: `${paperHeightMm}mm`,
            transform: `scale(${scaleRatio})`,
            transformOrigin: 'top left',
          }}
          className="canvas-backdrop relative bg-white shadow-2xl border border-slate-300 overflow-hidden select-none"
        >
          {/* Subtle Magnetic Snap Visual Grid Overlay */}
          {activeSnap !== 'off' && (
            <div
              className="absolute inset-0 pointer-events-none z-1"
              style={{
                backgroundImage: 'radial-gradient(circle, #2563eb 0.75px, transparent 0.75px)',
                backgroundSize: activeSnap === '10mm' ? '10mm 10mm' : '5mm 5mm',
                opacity: 0.3,
              }}
            />
          )}

          {/* Letterhead Guide Label Badge */}
          {showGuideImage && guideImageUrl && !customImageUrl && (
            <div className="absolute top-2 left-2 z-40 bg-amber-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-2xs pointer-events-none">
              Letterhead Guide (Offset Stationery)
            </div>
          )}

          {/* Pure Single DRY Prescription Engine in Studio Mode */}
          <SharedPrescriptionRenderer
            settings={syntheticSettings}
            vitalsConfig={vitalsConfig}
            isStudio={true}
            isPreview={true}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            onPointerDown={onPointerDown}
            showSafeMargins={true}
          />
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="mt-3 flex items-center justify-center flex-wrap gap-2 text-[11px] font-bold text-slate-500">
        <span>Sheet: {activePaperSize === 'A4' ? 'A4 (210×297 mm)' : 'A5 (148×210 mm)'}</span>
        <span>•</span>
        <span>
          Magnetic Snap: {activeSnap !== 'off' ? `${activeSnap} Grid (Active)` : 'Freeform (Off)'}
        </span>
        <span>•</span>
        <span className="text-blue-600 font-mono">1:1 WYSIWYG Locked</span>
      </div>
    </div>
  );
}
