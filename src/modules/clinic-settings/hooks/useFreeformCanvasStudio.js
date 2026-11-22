import { useState, useCallback, useRef } from 'react';
import { DEFAULT_FREEFORM_LAYOUT } from '../constants/prescriptionConstants';

export function useFreeformCanvasStudio(
  controlledLayout,
  controlledPaperSize = 'A4',
  onChangeLayout = null,
  onPaperSizeChange = null
) {
  const [internalPaperSize, setInternalPaperSize] = useState(controlledPaperSize || 'A4');
  const [internalLayout, setInternalLayout] = useState(controlledLayout || DEFAULT_FREEFORM_LAYOUT);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [snapGrid, setSnapGrid] = useState('5mm'); // '5mm' | '10mm' | 'off'
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

  const activePageLayout = layout?.[paperSize] || DEFAULT_FREEFORM_LAYOUT[paperSize] || DEFAULT_FREEFORM_LAYOUT.A4;

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

  const isSnapEnabled = snapGrid !== 'off';
  const setIsSnapEnabled = useCallback((updater) => {
    setSnapGrid((prev) => {
      const currentBool = prev !== 'off';
      const nextBool = typeof updater === 'function' ? updater(currentBool) : Boolean(updater);
      return nextBool ? '5mm' : 'off';
    });
  }, []);

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

      const paperW = paperSize === 'A5' ? 148 : 210;
      const paperH = paperSize === 'A5' ? 210 : 297;
      const snapStepMm = snapGrid === '5mm' ? 5 : (snapGrid === '10mm' ? 10 : null);

      if (act === 'drag') {
        let targetX = initX + deltaXPct;
        let targetY = initY + deltaYPct;
        if (snapStepMm) {
          const xMm = (targetX / 100) * paperW;
          const yMm = (targetY / 100) * paperH;
          const snappedXMm = Math.round(xMm / snapStepMm) * snapStepMm;
          const snappedYMm = Math.round(yMm / snapStepMm) * snapStepMm;
          targetX = (snappedXMm / paperW) * 100;
          targetY = (snappedYMm / paperH) * 100;
        } else {
          targetX = Math.round(targetX * 2) / 2;
          targetY = Math.round(targetY * 2) / 2;
        }
        const maxW = initW || 10;
        const maxH = initH || 4;
        targetX = Math.max(0, Math.min(100 - maxW, Number(targetX.toFixed(2))));
        targetY = Math.max(0, Math.min(100 - maxH, Number(targetY.toFixed(2))));
        updateNode(targetId, { x_pct: targetX, y_pct: targetY });
      } else if (act === 'resize') {
        let targetW = initW + deltaXPct;
        let targetH = initH + deltaYPct;
        if (snapStepMm) {
          const wMm = (targetW / 100) * paperW;
          const hMm = (targetH / 100) * paperH;
          const snappedWMm = Math.round(wMm / snapStepMm) * snapStepMm;
          const snappedHMm = Math.round(hMm / snapStepMm) * snapStepMm;
          targetW = (snappedWMm / paperW) * 100;
          targetH = (snappedHMm / paperH) * 100;
        } else {
          targetW = Math.round(targetW * 2) / 2;
          targetH = Math.round(targetH * 2) / 2;
        }
        targetW = Math.max(4, Math.min(100 - initX, Number(targetW.toFixed(2))));
        targetH = Math.max(2, Math.min(100 - initY, Number(targetH.toFixed(2))));
        updateNode(targetId, { width_pct: targetW, height_pct: targetH });
      }
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [layout, paperSize, snapGrid, updateNode]);

  return {
    canvasRef,
    paperSize,
    setPaperSize,
    layout,
    setLayout: updateLayout,
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
  };
}

export default useFreeformCanvasStudio;
