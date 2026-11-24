import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * HeaderActions
 * Portals action buttons, badges, and controls directly into the primary DashboardLayout top navbar (#layout-header-actions).
 * Guarantees zero DOM leakage on page transition and clean unmounting.
 */
export default function HeaderActions({ children }) {
  const [container, setContainer] = useState(() =>
    typeof document !== 'undefined' ? document.getElementById('layout-header-actions') : null
  );

  useLayoutEffect(() => {
    if (!container && typeof document !== 'undefined') {
      const el = document.getElementById('layout-header-actions');
      if (el) setContainer(el);
    }
  }, [container]);

  if (!container) return null;
  return createPortal(children, container);
}
