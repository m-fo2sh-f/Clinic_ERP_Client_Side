import React from 'react';
import { Eye, EyeOff, Check, AlignHorizontalJustifyStart, AlignVerticalJustifyStart, Table, Grid } from 'lucide-react';
import { getNodeMetadata } from './canvasNodeDefinitions';
import { TYPOGRAPHY_STEPS, normalizeFontSizeKey } from '../../../constants/prescriptionConstants';

export default function SelectedNodeInspector({
  selectedNodeId,
  selectedNode,
  onDeselect,
  onUpdateNode,
  vitalsConfig = null,
}) {
  const meta = selectedNodeId ? getNodeMetadata(selectedNodeId, vitalsConfig) : null;

  const currentFontSizeKey = normalizeFontSizeKey(selectedNode?.font_size || meta?.defaultFontSize || 'md');
  const currentStepIdx = Math.max(
    0,
    TYPOGRAPHY_STEPS.findIndex((s) => s.key === currentFontSizeKey)
  );
  const currentStep = TYPOGRAPHY_STEPS[currentStepIdx] || TYPOGRAPHY_STEPS[2];

  const handleTypographySlider = (e) => {
    const idx = Number(e.target.value);
    const chosen = TYPOGRAPHY_STEPS[idx];
    if (chosen) {
      onUpdateNode(selectedNodeId, { font_size: chosen.key });
    }
  };

  return (
    <div className="space-y-3 pb-4 border-b border-slate-100 text-left" dir="ltr">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-slate-400">Element Inspector</span>
        {selectedNodeId && (
          <button
            type="button"
            onClick={onDeselect}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Deselect
          </button>
        )}
      </div>

      {selectedNode ? (
        <div className="space-y-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">{meta?.title}</span>
            <span className="text-[9px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {selectedNodeId}
            </span>
          </div>

          {/* Visibility, Label, and Unit Toggles */}
          <div className={`grid ${meta?.hasShowUnit ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
            <button
              type="button"
              onClick={() => onUpdateNode(selectedNodeId, { is_visible: !selectedNode.is_visible })}
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedNode.is_visible !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="Toggle Element Visibility"
            >
              {selectedNode.is_visible !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{selectedNode.is_visible !== false ? 'Visible' : 'Hidden'}</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateNode(selectedNodeId, { show_label: selectedNode.show_label === false ? true : false })}
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedNode.show_label !== false
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="Show or Hide Field Title"
            >
              <Check className={`h-3.5 w-3.5 ${selectedNode.show_label !== false ? 'opacity-100' : 'opacity-0'}`} />
              <span>Label</span>
            </button>

            {meta?.hasShowUnit && (
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNodeId, { show_unit: selectedNode.show_unit === false ? true : false })}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedNode.show_unit !== false
                    ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title="Show or Hide Medical Unit (mmHg, bpm, °C)"
              >
                <Check className={`h-3.5 w-3.5 ${selectedNode.show_unit !== false ? 'opacity-100' : 'opacity-0'}`} />
                <span>Unit</span>
              </button>
            )}
          </div>

          {/* Special Control: Vitals Block Direction */}
          {selectedNodeId === 'vitals_block' && (
            <div className="pt-1">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Vitals Orientation:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNodeId, { vitals_direction: 'horizontal' })}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    (selectedNode.vitals_direction || 'horizontal') === 'horizontal'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <AlignHorizontalJustifyStart className="h-3 w-3" />
                  <span>Horizontal</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNodeId, { vitals_direction: 'vertical' })}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    selectedNode.vitals_direction === 'vertical'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <AlignVerticalJustifyStart className="h-3 w-3" />
                  <span>Vertical</span>
                </button>
              </div>
            </div>
          )}

          {/* Special Control: Refraction Block Display Mode */}
          {selectedNodeId === 'refraction_block' && (
            <div className="pt-1">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Refraction Mode:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNodeId, { mode: 'table' })}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    (selectedNode.mode || 'table') === 'table'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Table className="h-3 w-3" />
                  <span>OD/OS Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNodeId, { mode: 'split' })}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    selectedNode.mode === 'split'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Grid className="h-3 w-3" />
                  <span>Split Fields</span>
                </button>
              </div>
            </div>
          )}

          {/* Continuous Range Typography Slider */}
          {meta?.hasFontSize && (
            <div className="pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                <span>Typography Scale:</span>
                <span className="text-blue-700 font-mono font-bold">{currentStep.label}</span>
              </div>
              <input
                type="range"
                min={0}
                max={TYPOGRAPHY_STEPS.length - 1}
                step={1}
                value={currentStepIdx}
                onChange={handleTypographySlider}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-1 px-0.5">
                {TYPOGRAPHY_STEPS.map((s) => (
                  <span
                    key={s.key}
                    className={s.key === currentStep.key ? 'text-blue-600 font-bold' : ''}
                  >
                    {s.key.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Position & Size Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">X (Left %)</label>
              <input
                type="number"
                min={0}
                max={95}
                step={0.5}
                value={selectedNode.x_pct}
                onChange={(e) => onUpdateNode(selectedNodeId, { x_pct: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Y (Top %)</label>
              <input
                type="number"
                min={0}
                max={95}
                step={0.5}
                value={selectedNode.y_pct}
                onChange={(e) => onUpdateNode(selectedNodeId, { y_pct: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Width (%)</label>
              <input
                type="number"
                min={4}
                max={100}
                step={0.5}
                value={selectedNode.width_pct}
                onChange={(e) => onUpdateNode(selectedNodeId, { width_pct: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Height (%)</label>
              <input
                type="number"
                min={2}
                max={100}
                step={0.5}
                value={selectedNode.height_pct}
                onChange={(e) => onUpdateNode(selectedNodeId, { height_pct: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
          Click any element on the paper canvas to adjust coordinates, typography, and properties.
        </div>
      )}
    </div>
  );
}
