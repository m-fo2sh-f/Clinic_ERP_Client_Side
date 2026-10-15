import React, { forwardRef } from 'react';
import EgyptianClinicTemplate from '../templates/EgyptianClinicTemplate';
import InternalMedicineTemplate from '../templates/InternalMedicineTemplate';
import OphthalmologyTemplate from '../templates/OphthalmologyTemplate';
import DermatologyTemplate from '../templates/DermatologyTemplate';
import PediatricsTemplate from '../templates/PediatricsTemplate';
import PreprintedLetterheadTemplate from '../templates/PreprintedLetterheadTemplate';
import CustomImageTemplate from '../templates/CustomImageTemplate';

/**
 * PrescriptionPrintWrapper — Unified printing & preview container for all prescription templates.
 *
 * Implements:
 * - CRITICAL RULE 6 (Bi-Directional RTL/LTR isolation)
 * - CRITICAL RULE 5 (Preloading Assets: loading="eager", decoding="sync", rendered off-screen in DOM without display:none)
 * - CRITICAL RULE 3 (Laser Printer Filter: contrast 1.06, brightness 1.03)
 */
const PrescriptionPrintWrapper = forwardRef(function PrescriptionPrintWrapper(
  {
    settings = {},
    patient = {},
    doctor = {},
    branch = {},
    encounter = {},
    vitals = {},
    diagnoses = [],
    medications = [],
    advice = '',
    followUpDate = '',
    visionData = {},
    routineData = {},
    isPreview = false,
    className = '',
  },
  ref
) {
  const mode = settings?.mode || 'builtin';
  const templateId = settings?.template_id || 'egyptian_clinic';
  const paperSize = settings?.paper_size || 'A5';

  // Dynamic dimensions based on standard ISO paper sizes
  const dimensions = paperSize === 'A3'
    ? { width: '297mm', minHeight: '420mm', height: '420mm' }
    : paperSize === 'A4'
      ? { width: '210mm', minHeight: '297mm', height: '297mm' }
      : { width: '148mm', minHeight: '210mm', height: '210mm' };

  // Select target template component (EgyptianClinicTemplate is default authentic model)
  let TemplateComponent = EgyptianClinicTemplate;

  if (mode === 'letterhead') {
    TemplateComponent = PreprintedLetterheadTemplate;
  } else if (mode === 'custom_image') {
    TemplateComponent = CustomImageTemplate;
  } else {
    switch (templateId) {
      case 'ophthalmology':
        TemplateComponent = OphthalmologyTemplate;
        break;
      case 'dermatology':
        TemplateComponent = DermatologyTemplate;
        break;
      case 'pediatrics':
        TemplateComponent = PediatricsTemplate;
        break;
      case 'internal_classic':
        TemplateComponent = InternalMedicineTemplate;
        break;
      case 'egyptian_clinic':
      case 'internal_medicine':
      default:
        TemplateComponent = EgyptianClinicTemplate;
        break;
    }
  }

  // Laser printer filter optimization
  const laserOpt = Boolean(settings?.laser_contrast_opt);
  const grayscaleMode = Boolean(settings?.grayscale_mode);
  const filterStyles = [];
  if (laserOpt) {
    filterStyles.push('contrast(1.06) brightness(1.03)');
  }
  if (grayscaleMode) {
    filterStyles.push('grayscale(100%)');
  }
  const combinedFilter = filterStyles.length > 0 ? filterStyles.join(' ') : undefined;

  return (
    <div
      ref={ref}
      id="prescription-print-document"
      className={`prescription-sheet-wrapper bg-white text-slate-900 box-border flex flex-col ${
        isPreview
          ? 'shadow-2xl rounded-sm border border-slate-300 mx-auto shrink-0'
          : 'print-page-root'
      } ${className}`}
      style={{
        width: isPreview ? dimensions.width : '100%',
        minHeight: isPreview ? dimensions.minHeight : '100%',
        height: isPreview ? dimensions.height : '100%',
        filter: combinedFilter,
        WebkitFilter: combinedFilter,
        pageBreakAfter: 'avoid',
        pageBreakInside: 'avoid',
      }}
      dir="rtl"
    >
      <TemplateComponent
        settings={settings}
        patient={patient}
        doctor={doctor}
        branch={branch}
        encounter={encounter}
        vitals={vitals}
        diagnoses={diagnoses}
        medications={medications}
        advice={advice}
        followUpDate={followUpDate}
        visionData={visionData}
        routineData={routineData}
      />
    </div>
  );
});

export default PrescriptionPrintWrapper;
