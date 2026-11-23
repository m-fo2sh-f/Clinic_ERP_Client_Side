import React from 'react';
import { DEFAULT_FREEFORM_LAYOUT } from '../../clinic-settings/constants/prescriptionConstants';
import NodePreviewContent from '../../clinic-settings/components/prescription/studio/NodePreviewContent';

/**
 * FreeformPrintRenderer — Pixel-perfect absolute percentage renderer
 * for both on-screen studio preview and physical laser print.
 * Guaranteed 100% parity with InteractivePaperCanvas and StudioPreviewModal.
 */
export default function FreeformPrintRenderer({
  settings = {},
  patient = {},
  doctor = {},
  encounter = {},
  vitals = {},
  diagnoses = [],
  medications = [],
  advice = '',
  followUpDate = '',
  visionData = {},
  isPreview = false,
}) {
  const paperSize = settings?.paper_size || 'A5';
  const freeform = settings?.freeform_layout || DEFAULT_FREEFORM_LAYOUT;
  const layout = freeform[paperSize] || DEFAULT_FREEFORM_LAYOUT[paperSize] || DEFAULT_FREEFORM_LAYOUT.A5;

  const bgUrl =
    settings?.image_url ||
    settings?.custom_image_url ||
    settings?.background_image ||
    (settings?.image_path
      ? `/api/v1/clinic-settings/prescription-template/image/${settings.image_path.split('/').pop().split('\\').pop()}`
      : null);

  const guideUrl =
    settings?.guide_image_url ||
    (settings?.guide_image_path
      ? `/api/v1/clinic-settings/prescription-template/image/${settings.guide_image_path.split('/').pop().split('\\').pop()}`
      : null);

  const laserOpt = Boolean(settings?.laser_contrast_opt);
  const grayscaleMode = Boolean(settings?.grayscale_mode);
  const filterStyles = [];
  if (laserOpt) filterStyles.push('contrast(1.06) brightness(1.03)');
  if (grayscaleMode) filterStyles.push('grayscale(100%)');
  const combinedFilter = filterStyles.length > 0 ? filterStyles.join(' ') : 'none';

  const clinicalData = {
    patient,
    doctor,
    encounter,
    vitals,
    diagnoses,
    medications,
    advice,
    followUpDate,
    visionData,
  };

  const patientNodeKeys = layout.patient_mode === 'split'
    ? ['patient_name', 'patient_age', 'patient_date', 'patient_rx_code', 'patient_phone']
    : ['patient_unified'];

  const vitalsNodeKeys = layout.vitals_mode === 'split'
    ? Object.keys(layout.vitals_items || {})
    : ['vitals_block'];

  const clinicalNodeKeys = [
    'diagnosis_block',
    ...(layout.refraction_block ? ['refraction_block'] : []),
    'medications_block',
    'advice_block',
    'qr_block',
  ];

  const allActiveKeys = [...patientNodeKeys, ...vitalsNodeKeys, ...clinicalNodeKeys];

  return (
    <div
      className={`relative w-full h-full bg-white text-black font-sans box-border overflow-hidden select-none ${
        isPreview ? 'shadow-lg' : 'print-page-root'
      }`}
      dir="rtl"
      style={{
        width: '100%',
        height: '100%',
        filter: combinedFilter,
        WebkitFilter: combinedFilter,
      }}
    >
      {/* 1. Background image (Printed) */}
      {settings.mode === 'custom_image' && bgUrl && (
        <img
          src={bgUrl}
          alt="Prescription Background"
          loading="eager"
          decoding="sync"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          style={{
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* 2. Letterhead Guide Image (NEVER Printed — print:hidden) */}
      {isStudio && guideUrl && (
        <img
          src={guideUrl}
          alt="Letterhead Alignment Guide"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none opacity-40 z-0 print:hidden"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* 3. Pixel-Perfect Interactive Nodes Overlay */}
      {allActiveKeys.map((key) => {
        const isVitalItem = layout.vitals_mode === 'split' && layout.vitals_items && key in layout.vitals_items;
        const node = isVitalItem ? layout.vitals_items[key] : layout[key];

        if (!node || node.is_visible === false) return null;

        return (
          <div
            key={key}
            className="absolute z-10 overflow-hidden text-black pointer-events-none select-none"
            style={{
              left: `${node.x_pct}%`,
              top: `${node.y_pct}%`,
              width: `${node.width_pct}%`,
              height: `${node.height_pct}%`,
            }}
          >
            <NodePreviewContent
              nodeId={key}
              node={node}
              data={clinicalData}
              isPrint={true}
            />
          </div>
        );
      })}
    </div>
  );
}
