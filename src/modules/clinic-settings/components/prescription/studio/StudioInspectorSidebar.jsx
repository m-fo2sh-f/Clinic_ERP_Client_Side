import React from 'react';
import SelectedNodeInspector from './SelectedNodeInspector';
import StudioModesControl from './StudioModesControl';

export default function StudioInspectorSidebar({
  pageLayout,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onUpdatePageSetting,
  isSnapEnabled,
  onToggleSnap,
  showGuideImage,
  onToggleGuideImage,
  hasGuideImage,
  onResetToDefault,
}) {
  const isVitalSplitItem = Boolean(
    pageLayout?.vitals_mode === 'split' &&
    pageLayout?.vitals_items &&
    selectedNodeId in pageLayout.vitals_items
  );

  const selectedNode = isVitalSplitItem
    ? pageLayout.vitals_items[selectedNodeId]
    : pageLayout?.[selectedNodeId];

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4 text-right" dir="rtl">
      {/* Selected Node Properties */}
      <SelectedNodeInspector
        selectedNodeId={selectedNodeId}
        selectedNode={selectedNode}
        onDeselect={() => onSelectNode(null)}
        onUpdateNode={onUpdateNode}
      />

      {/* Global Studio Partition Modes & Grid */}
      <StudioModesControl
        patientMode={pageLayout?.patient_mode}
        vitalsMode={pageLayout?.vitals_mode}
        onUpdatePageSetting={onUpdatePageSetting}
        isSnapEnabled={isSnapEnabled}
        onToggleSnap={onToggleSnap}
        showGuideImage={showGuideImage}
        onToggleGuideImage={onToggleGuideImage}
        hasGuideImage={hasGuideImage}
        onResetToDefault={onResetToDefault}
      />
    </aside>
  );
}
