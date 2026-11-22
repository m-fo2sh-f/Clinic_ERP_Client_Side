import React from 'react';
import SelectedNodeInspector from './SelectedNodeInspector';
import StudioModesControl from './StudioModesControl';

export default function StudioInspectorSidebar({
  pageLayout,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onUpdatePageSetting,
  snapGrid = '5mm',
  onSnapGridChange,
  showGuideImage,
  onToggleGuideImage,
  hasGuideImage,
  onResetToDefault,
  vitalsConfig = null,
}) {
  const isVitalSplitItem = Boolean(
    pageLayout?.vitals_mode === 'split' &&
    pageLayout?.vitals_items &&
    selectedNodeId in pageLayout.vitals_items
  );

  const isRefractionSplitItem = Boolean(
    pageLayout?.refraction_block?.mode === 'split' &&
    pageLayout?.refraction_block?.split_items &&
    selectedNodeId in pageLayout.refraction_block.split_items
  );

  const selectedNode = isVitalSplitItem
    ? pageLayout.vitals_items[selectedNodeId]
    : isRefractionSplitItem
      ? pageLayout.refraction_block.split_items[selectedNodeId]
      : pageLayout?.[selectedNodeId];

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4 text-left" dir="ltr">
      {/* Selected Node Properties */}
      <SelectedNodeInspector
        selectedNodeId={selectedNodeId}
        selectedNode={selectedNode}
        onDeselect={() => onSelectNode(null)}
        onUpdateNode={onUpdateNode}
        vitalsConfig={vitalsConfig}
      />

      {/* Global Studio Partition Modes & Grid */}
      <StudioModesControl
        patientMode={pageLayout?.patient_mode}
        vitalsMode={pageLayout?.vitals_mode}
        onUpdatePageSetting={onUpdatePageSetting}
        snapGrid={snapGrid}
        onSnapGridChange={onSnapGridChange}
        showGuideImage={showGuideImage}
        onToggleGuideImage={onToggleGuideImage}
        hasGuideImage={hasGuideImage}
        onResetToDefault={onResetToDefault}
      />
    </aside>
  );
}
