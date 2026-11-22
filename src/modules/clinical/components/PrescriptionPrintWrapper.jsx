import React, { forwardRef } from 'react';
import SharedPrescriptionRenderer from './SharedPrescriptionRenderer';

/**
 * PrescriptionPrintWrapper — Unified printing & preview container.
 * Delegates 100% to the single pure SharedPrescriptionRenderer engine to guarantee
 * Zero-Drift 1:1 WYSIWYG matching between on-screen preview and physical laser print.
 */
const PrescriptionPrintWrapper = forwardRef(function PrescriptionPrintWrapper(props, ref) {
  return <SharedPrescriptionRenderer ref={ref} {...props} />;
});

export default PrescriptionPrintWrapper;
