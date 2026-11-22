import React from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { getNodeMetadata, FONT_SIZE_OPTIONS } from './canvasNodeDefinitions';

export default function SelectedNodeInspector({
  selectedNodeId,
  selectedNode,
  onDeselect,
  onUpdateNode,
}) {
  const meta = selectedNodeId ? getNodeMetadata(selectedNodeId) : null;

  return (
    <div className="space-y-3 pb-4 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-slate-400">لوحة التحكم بالعنصر</span>
        {selectedNodeId && (
          <button
            type="button"
            onClick={onDeselect}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            إلغاء التحديد
          </button>
        )}
      </div>

      {selectedNode ? (
        <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">{meta?.title}</span>
            <span className="text-[9px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
              {selectedNodeId}
            </span>
          </div>

          {/* Visibility, Label, and Unit Toggles */}
          <div className={`grid ${meta?.hasShowUnit ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
            <button
              type="button"
              onClick={() => onUpdateNode(selectedNodeId, { is_visible: !selectedNode.is_visible })}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedNode.is_visible !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="إظهار / إخفاء العنصر"
            >
              {selectedNode.is_visible !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{selectedNode.is_visible !== false ? 'ظاهر' : 'مخفي'}</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateNode(selectedNodeId, { show_label: selectedNode.show_label === false ? true : false })}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedNode.show_label !== false
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="إظهار أو إخفاء التسمية النصية"
            >
              <Check className={`h-3.5 w-3.5 ${selectedNode.show_label !== false ? 'opacity-100' : 'opacity-0'}`} />
              <span>التسمية</span>
            </button>

            {meta?.hasShowUnit && (
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNodeId, { show_unit: selectedNode.show_unit === false ? true : false })}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedNode.show_unit !== false
                    ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title="إظهار أو إخفاء وحدة القياس (مثل mmHg أو °C)"
              >
                <Check className={`h-3.5 w-3.5 ${selectedNode.show_unit !== false ? 'opacity-100' : 'opacity-0'}`} />
                <span>الوحدة</span>
              </button>
            )}
          </div>

          {/* Font Size Selector */}
          {meta?.hasFontSize && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">حجم الخط (Font Size):</label>
              <div className="grid grid-cols-4 gap-1">
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateNode(selectedNodeId, { font_size: opt.value })}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      (selectedNode.font_size || meta.defaultFontSize) === opt.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.value.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Position & Size Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">X (أفقي %)</label>
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
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Y (رأسي %)</label>
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
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">العرض (%)</label>
              <input
                type="number"
                min={5}
                max={100}
                step={0.5}
                value={selectedNode.width_pct}
                onChange={(e) => onUpdateNode(selectedNodeId, { width_pct: Number(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الارتفاع (%)</label>
              <input
                type="number"
                min={3}
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
          انقر على أي عنصر في ورقة الروشتة لتعديل أبعاده وخصائصه.
        </div>
      )}
    </div>
  );
}
