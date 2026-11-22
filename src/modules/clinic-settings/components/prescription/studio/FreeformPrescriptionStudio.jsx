import React, { useState, useRef } from 'react';
import useFreeformCanvasStudio from '../../../hooks/useFreeformCanvasStudio';
import InteractivePaperCanvas from './InteractivePaperCanvas';
import StudioInspectorSidebar from './StudioInspectorSidebar';
import StudioPreviewModal from './StudioPreviewModal';
import StudioToolbar from './StudioToolbar';

export default function FreeformPrescriptionStudio({
  layout,
  onChangeLayout,
  paperSize = 'A4',
  onPaperSizeChange,
  guideImageUrl = null,
  onUploadGuideImage,
  onDeleteGuideImage,
  customImageUrl = null,
  vitalsConfig = null,
  isUploading = false,
  isDeleting = false,
  disabled = false,
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const guideFileInputRef = useRef(null);

  const {
    canvasRef,
    paperSize: activePaperSize,
    setPaperSize,
    activePageLayout,
    selectedNodeId,
    setSelectedNodeId,
    snapGrid,
    setSnapGrid,
    isSnapEnabled,
    setIsSnapEnabled,
    showGuideImage,
    setShowGuideImage,
    updateNode,
    updatePageSetting,
    resetToDefault,
    handlePointerDown,
  } = useFreeformCanvasStudio(layout, paperSize, onChangeLayout, onPaperSizeChange);

  const handleGuideFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadGuideImage) {
      onUploadGuideImage(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-4" dir="ltr">
      {/* 1. Studio Toolbar */}
      <StudioToolbar
        paperSize={activePaperSize}
        onPaperSizeChange={setPaperSize}
        snapGrid={snapGrid}
        onSnapGridChange={setSnapGrid}
        isSnapEnabled={isSnapEnabled}
        onToggleSnap={() => setIsSnapEnabled((prev) => !prev)}
        showGuideImage={showGuideImage}
        onToggleGuideImage={() => setShowGuideImage((prev) => !prev)}
        guideImageUrl={guideImageUrl}
        onUploadClick={() => guideFileInputRef.current?.click()}
        onDeleteGuideImage={onDeleteGuideImage}
        onOpenPreview={() => setIsPreviewOpen(true)}
        isUploading={isUploading}
        isDeleting={isDeleting}
        disabled={disabled}
      />

      <input
        ref={guideFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleGuideFileChange}
        className="hidden"
      />

      {/* 2. Main Studio Work Area */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Canvas Viewport */}
        <div className="flex-1 w-full overflow-hidden">
          <InteractivePaperCanvas
            canvasRef={canvasRef}
            pageLayout={activePageLayout}
            paperSize={activePaperSize}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onPointerDown={handlePointerDown}
            snapGrid={snapGrid}
            isSnapEnabled={isSnapEnabled}
            showGuideImage={showGuideImage}
            guideImageUrl={guideImageUrl}
            customImageUrl={customImageUrl}
            vitalsConfig={vitalsConfig}
          />
        </div>

        {/* Inspector Sidebar */}
        <StudioInspectorSidebar
          pageLayout={activePageLayout}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNode={updateNode}
          onUpdatePageSetting={updatePageSetting}
          snapGrid={snapGrid}
          onSnapGridChange={setSnapGrid}
          showGuideImage={showGuideImage}
          onToggleGuideImage={() => setShowGuideImage((prev) => !prev)}
          hasGuideImage={Boolean(guideImageUrl)}
          onResetToDefault={resetToDefault}
          vitalsConfig={vitalsConfig}
        />
      </div>

      {/* 3. Quick Print Simulation Modal */}
      <StudioPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pageLayout={activePageLayout}
        paperSize={activePaperSize}
        customImageUrl={customImageUrl}
        vitalsConfig={vitalsConfig}
      />
    </div>
  );
}
