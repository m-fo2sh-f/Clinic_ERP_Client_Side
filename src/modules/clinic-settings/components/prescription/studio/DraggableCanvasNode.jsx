import React from 'react';
import { EyeOff } from 'lucide-react';
import { getNodeMetadata } from './canvasNodeDefinitions';

export default function DraggableCanvasNode({
  id,
  node,
  isSelected = false,
  onPointerDown,
  onSelect,
  children,
}) {
  if (!node) return null;

  const { x_pct, y_pct, width_pct, height_pct, is_visible = true } = node;
  const meta = getNodeMetadata(id);

  const handleNodePointerDown = (e) => {
    onSelect?.(id);
    onPointerDown?.(e, id, 'drag');
  };

  const handleResizePointerDown = (e) => {
    e.stopPropagation();
    onSelect?.(id);
    onPointerDown?.(e, id, 'resize');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={meta.title}
      onPointerDown={handleNodePointerDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect?.(id);
        }
      }}
      style={{
        left: `${x_pct}%`,
        top: `${y_pct}%`,
        width: `${width_pct}%`,
        height: `${height_pct}%`,
      }}
      className={`absolute select-none transition-shadow touch-none group ${
        isSelected
          ? 'ring-2 ring-blue-600 bg-blue-50/20 z-30 shadow-md cursor-grab active:cursor-grabbing'
          : 'border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/10 z-10 cursor-grab'
      } ${!is_visible ? 'opacity-40 bg-stripes-slate' : ''}`}
    >
      {/* Node Label Badge Header (Studio Mode) */}
      <div
        className={`absolute -top-3.5 right-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold flex items-center gap-1 shadow-2xs pointer-events-none transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white z-40'
            : 'bg-slate-700/80 text-white/95 group-hover:bg-blue-600'
        }`}
      >
        <span>{meta.title}</span>
        {!is_visible && (
          <span className="flex items-center gap-0.5 text-amber-300">
            <EyeOff className="h-2.5 w-2.5" />
            <span className="text-[7.5px]">(مخفي)</span>
          </span>
        )}
      </div>

      {/* Node Preview Content */}
      <div className="w-full h-full overflow-hidden pointer-events-none">
        {children}
      </div>

      {/* Resize Handle (Corner) */}
      <div
        onPointerDown={handleResizePointerDown}
        title="سحب لتغيير الحجم"
        className={`absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize flex items-center justify-center transition-all z-40 ${
          isSelected
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-400 opacity-0 group-hover:opacity-100 text-white'
        } rounded-tl-sm`}
      >
        <svg viewBox="0 0 6 6" className="w-2 h-2 fill-current">
          <path d="M6 6H0L6 0V6Z" />
        </svg>
      </div>

      {/* Secondary Opposite Corner Resize Handle for Bi-Directional Convenience */}
      <div
        onPointerDown={handleResizePointerDown}
        title="سحب لتغيير الحجم"
        className={`absolute bottom-0 left-0 w-2.5 h-2.5 cursor-sw-resize z-40 ${
          isSelected ? 'bg-blue-400/80' : 'hidden'
        } rounded-tr-sm`}
      />
    </div>
  );
}
