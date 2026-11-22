import { useState, useCallback, useRef } from 'react';
import { DEFAULT_FREEFORM_LAYOUT } from '../constants/prescriptionConstants';

export function useFreeformCanvasStudio(
  controlledLayout,
  controlledPaperSize = 'A5',
  onChangeLayout = null,
  onPaperSizeChange = null
) {
  const [internalPaperSize, setInternalPaperSize] = useState(controlledPaperSize);
  const [internalLayout, setInternalLayout] = useState(controlledLayout || DEFAULT_FREEFORM_LAYOUT);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [showGuideImage, setShowGuideImage] = useState(true);

  const canvasRef = useRef(null);
  const dragStateRef = useRef(null);

  const paperSize = onPaperSizeChange ? controlledPaperSize : internalPaperSize;
  const layout = onChangeLayout ? (controlledLayout || DEFAULT_FREEFORM_LAYOUT) : internalLayout;

  const setPaperSize = useCallback((newSize) => {
    if (onPaperSizeChange) {
      onPaperSizeChange(newSize);
    } else {
      setInternalPaperSize(newSize);
    }
  }, [onPaperSizeChange]);

  const updateLayout = useCallback((updater) => {
    const current = layout || DEFAULT_FREEFORM_LAYOUT;
    const next = typeof updater === 'function' ? updater(current) : updater;
    if (onChangeLayout) {
      onChangeLayout(next);
    } else {
      setInternalLayout(next);
    }
  }, [layout, onChangeLayout]);

  const activePageLayout = layout?.[paperSize] || DEFAULT_FREEFORM_LAYOUT[paperSize] || DEFAULT_FREEFORM_LAYOUT.A5;

  const updateNode = useCallback((nodeId, patch) => {
    updateLayout((prev) => {
      const currentPage = prev?.[paperSize] || DEFAULT_FREEFORM_LAYOUT[paperSize];
      if (currentPage?.vitals_items && nodeId in currentPage.vitals_items) {
        return {
          ...prev,
          [paperSize]: {
            ...currentPage,
            vitals_items: {
              ...currentPage.vitals_items,
              [nodeId]: { ...currentPage.vitals_items[nodeId], ...patch },
            },
          },
        };
      }
      return {
        ...prev,
        [paperSize]: {
          ...currentPage,
          [nodeId]: { ...(currentPage?.[nodeId] || {}), ...patch },
        },
      };
    });
  }, [paperSize, updateLayout]);

  const updatePageSetting = useCallback((key, value) => {
    updateLayout((prev) => ({
      ...prev,
      [paperSize]: {
        ...(prev?.[paperSize] || DEFAULT_FREEFORM_LAYOUT[paperSize]),
        [key]: value,
      },
    }));
  }, [paperSize, updateLayout]);

  const resetToDefault = useCallback(() => {
    updateLayout(DEFAULT_FREEFORM_LAYOUT);
  }, [updateLayout]);

  const handlePointerDown = useCallback((e, nodeId, action = 'drag') => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentPage = layout?.[paperSize] || DEFAULT_FREEFORM_LAYOUT[paperSize];
    const node = (currentPage?.vitals_items && nodeId in currentPage.vitals_items)
      ? currentPage.vitals_items[nodeId]
      : currentPage?.[nodeId];

    if (!node) return;

    dragStateRef.current = {
      nodeId,
      action,
      startX: e.clientX,
      startY: e.clientY,
      initX: node.x_pct,
      initY: node.y_pct,
      initW: node.width_pct,
      initH: node.height_pct,
      rect,
    };

    const handlePointerMove = (ev) => {
      if (!dragStateRef.current) return;
      const { nodeId: targetId, action: act, startX, startY, initX, initY, initW, initH, rect: cRect } = dragStateRef.current;
      const deltaXPct = ((ev.clientX - startX) / cRect.width) * 100;
      const deltaYPct = ((ev.clientY - startY) / cRect.height) * 100;

      if (act === 'drag') {
        let newX = Math.round((initX + deltaXPct) * 2) / 2;
        let newY = Math.round((initY + deltaYPct) * 2) / 2;
        newX = Math.max(0, Math.min(100 - initW, newX));
        newY = Math.max(0, Math.min(100 - initH, newY));
        updateNode(targetId, { x_pct: newX, y_pct: newY });
      } else if (act === 'resize') {
        let newW = Math.max(5, Math.min(100 - initX, Math.round((initW + deltaXPct) * 2) / 2));
        let newH = Math.max(3, Math.min(100 - initY, Math.round((initH + deltaYPct) * 2) / 2));
        updateNode(targetId, { width_pct: newW, height_pct: newH });
      }
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [layout, paperSize, updateNode]);

  return {
    canvasRef,
    paperSize,
    setPaperSize,
    layout,
    setLayout: updateLayout,
    activePageLayout,
    selectedNodeId,
    setSelectedNodeId,
    isSnapEnabled,
    setIsSnapEnabled,
    showGuideImage,
    setShowGuideImage,
    updateNode,
    updatePageSetting,
    resetToDefault,
    handlePointerDown,
  };
}

export default useFreeformCanvasStudio;
