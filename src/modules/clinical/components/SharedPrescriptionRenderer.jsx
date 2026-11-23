import React, { forwardRef } from 'react';
import { VectorQrCode } from '../templates/TemplateHelpers';
import {
  PAPER_DIMENSIONS,
  DEFAULT_FREEFORM_LAYOUT,
  STANDARD_FLOW_LAYOUTS,
  VITALS_DIRECTIONS,
} from '../../clinic-settings/constants/prescriptionConstants';
import { getFontSizeMm, getNodeMetadata } from '../../clinic-settings/components/prescription/studio/canvasNodeDefinitions';
import DraggableCanvasNode from '../../clinic-settings/components/prescription/studio/DraggableCanvasNode';
import { SAMPLE_PRESCRIPTION_DATA } from '../templates/samplePrescriptionData';

/**
 * SharedPrescriptionRenderer — The single pure DRY renderer for:
 * 1. Freeform Studio & Standard Flow Canvas Preview.
 * 2. Test Print Modal in Clinic Settings.
 * 3. Live Physical Consultation Laser Printing in Doctor Dashboard.
 * 
 * Strict Zero-Drift WYSIWYG Architecture:
 * - Always draws the physical paper at true millimeter dimensions (210mm x 297mm for A4).
 * - Enforces locked LTR parent geometry to eliminate right-shift coordinates drift.
 * - Dynamic vitals strictly synchronized with doctor's database configuration.
 * - Standard B&W Eye Refraction Table (OD/OS) with Sphere, Cylinder, Axis, VA, IOP, PD, Add.
 */
const SharedPrescriptionRenderer = forwardRef(function SharedPrescriptionRenderer(
  {
    settings = {},
    vitalsConfig = null,
    patient = null,
    doctor = null,
    branch = null,
    encounter = null,
    vitals = null,
    diagnoses = null,
    medications = null,
    advice = null,
    followUpDate = null,
    visionData = null,
    _routineData = null,
    isPreview = false,
    isStudio = false,
    selectedNodeId = null,
    onSelectNode = null,
    onPointerDown = null,
    showSafeMargins = true,
    className = '',
  },
  ref
) {
  const paperSize = settings?.paper_size === 'A5' ? 'A5' : 'A4';
  const paperDim = PAPER_DIMENSIONS[paperSize];
  const layoutMode = settings?.layout_mode || 'standard_flow';
  const isFreeform = layoutMode === 'freeform_canvas';
  const mode = settings?.mode || 'builtin';

  // Merge clinical data with fallback sample data for preview
  const s = SAMPLE_PRESCRIPTION_DATA;
  const activePatient = patient || s.patient;
  const activeDoctor = doctor || s.doctor;
  const activeEncounter = encounter || s.encounter;
  const activeVitals = vitals || s.vitals;
  const activeDiagnoses = diagnoses && diagnoses.length > 0 ? diagnoses : s.diagnoses;
  const activeMedications = medications && medications.length > 0 ? medications : s.medications;
  const activeAdvice = advice !== null && advice !== undefined ? advice : s.advice;
  const activeFollowUp = followUpDate !== null && followUpDate !== undefined ? followUpDate : s.followUpDate;
  const activeVisionData = visionData?.od ? visionData : (activeVitals?.refraction?.od ? activeVitals.refraction : s.visionData);

  // Background and Letterhead guide URLs
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

  // Laser printing contrast filters
  const laserOpt = Boolean(settings?.laser_contrast_opt);
  const grayscaleMode = Boolean(settings?.grayscale_mode);
  const filterStyles = [];
  if (laserOpt) filterStyles.push('contrast(1.05) brightness(1.02)');
  if (grayscaleMode) filterStyles.push('grayscale(100%)');
  const combinedFilter = filterStyles.length > 0 ? filterStyles.join(' ') : 'none';

  // Active layout from freeform configuration
  const freeform = settings?.freeform_layout || DEFAULT_FREEFORM_LAYOUT;
  const pageLayout = freeform[paperSize] || DEFAULT_FREEFORM_LAYOUT[paperSize] || DEFAULT_FREEFORM_LAYOUT.A4;

  // Resolve active vitals items from doctor database configuration
  const resolveActiveVitalsList = () => {
    const defaultEnabled = vitalsConfig?.enabled_keys || ['blood_pressure', 'heart_rate', 'temperature', 'blood_glucose', 'weight', 'height', 'oxygen_saturation'];
    const customList = Array.isArray(vitalsConfig?.custom_vitals) ? vitalsConfig.custom_vitals : [];

    const items = [];

    // Helper to extract value from vitals object
    const getVal = (k) => {
      if (!activeVitals) return '';
      if (k === 'blood_pressure') return activeVitals.blood_pressure || activeVitals.bloodPressure || (activeVitals.bp_systolic && `${activeVitals.bp_systolic}/${activeVitals.bp_diastolic}`) || (isPreview || isStudio ? s.vitals.blood_pressure : '');
      if (k === 'heart_rate' || k === 'pulse') return activeVitals.heart_rate || activeVitals.heartRate || activeVitals.pulse || (isPreview || isStudio ? s.vitals.heart_rate : '');
      if (k === 'temperature' || k === 'temp') return activeVitals.temperature || activeVitals.temp || (isPreview || isStudio ? s.vitals.temperature : '');
      if (k === 'blood_sugar' || k === 'blood_glucose' || k === 'rbs') return activeVitals.blood_sugar || activeVitals.blood_glucose || activeVitals.randomBloodSugar || (isPreview || isStudio ? s.vitals.blood_sugar : '');
      if (k === 'respiratory_rate' || k === 'rr') return activeVitals.respiratory_rate || activeVitals.respiratoryRate || activeVitals.rr || (isPreview || isStudio ? '16' : '');
      if (k === 'oxygen_saturation' || k === 'spo2') return activeVitals.oxygen_saturation || activeVitals.spo2 || (isPreview || isStudio ? s.vitals.spo2 : '');
      if (k === 'weight') return activeVitals.weight || (isPreview || isStudio ? s.vitals.weight : '');
      if (k === 'height') return activeVitals.height || (isPreview || isStudio ? s.vitals.height : '');
      return activeVitals[k] || (isPreview || isStudio ? 'Normal' : '');
    };

    const defaultMeta = {
      blood_pressure: { label: 'BP', unit: 'mmHg' },
      heart_rate: { label: 'Pulse', unit: 'bpm' },
      temperature: { label: 'Temp', unit: '°C' },
      respiratory_rate: { label: 'RR', unit: 'bpm' },
      oxygen_saturation: { label: 'SpO2', unit: '%' },
      spo2: { label: 'SpO2', unit: '%' },
      blood_glucose: { label: 'RBS', unit: 'mg/dL' },
      blood_sugar: { label: 'RBS', unit: 'mg/dL' },
      weight: { label: 'Weight', unit: 'kg' },
      height: { label: 'Height', unit: 'cm' },
    };

    // Filter out eye refraction keys from general vitals
    const eyeKeys = ['intraocular_pressure', 'visual_acuity', 'iop', 'va', 'refraction', 'sph', 'cyl', 'axis'];

    defaultEnabled
      .filter((key) => !eyeKeys.includes(key.toLowerCase()))
      .forEach((key) => {
        const meta = defaultMeta[key] || { label: key.replace(/_/g, ' ').toUpperCase(), unit: '' };
        const val = getVal(key);
        if (val) {
          items.push({ key, label: meta.label, val, unit: meta.unit });
        }
      });

    customList
      .filter((cv) => !eyeKeys.includes(cv.key.toLowerCase()))
      .forEach((cv) => {
        const val = activeVitals[cv.key] || (isPreview || isStudio ? (cv.default_value || 'Normal') : '');
        if (val) {
          items.push({
            key: cv.key,
            label: cv.label_en || cv.label || cv.key,
            val,
            unit: cv.unit || '',
          });
        }
      });

    return items;
  };

  const activeVitalsList = resolveActiveVitalsList();
  const isRefractionEnabled = Boolean(
    settings?.show_refraction !== false &&
    (vitalsConfig?.refraction_card_enabled !== false || vitalsConfig?.enable_refraction)
  );

  // Standard flow Margins & Styling
  const margins = settings?.margins || { top_cm: 4.5, bottom_cm: 3.0, left_cm: 1.5, right_cm: 1.5 };
  const standardLayout = settings?.standard_flow_layout || STANDARD_FLOW_LAYOUTS.SIDE_BY_SIDE;
  const standardFontSize = getFontSizeMm(settings?.font_size || 'md');
  const showBorders = settings?.show_borders !== false;

  // Render Eye Refraction Table in Clean Standard B&W
  const renderEyeRefractionTable = (nodeFontSize = 'sm', showBorder = true) => {
    const fontSize = getFontSizeMm(nodeFontSize);
    const od = activeVisionData?.od || {};
    const os = activeVisionData?.os || {};
    const pd = activeVisionData?.pd || '';

    return (
      <div className={`w-full ${showBorder ? 'border border-black' : ''} bg-white select-none box-border`} style={{ fontSize }}>
        <div className={`flex items-center justify-between px-2 py-0.5 ${showBorder ? 'border-b border-black' : 'border-b border-slate-200'} bg-slate-100 font-bold text-[0.85em]`}>
          <span>EYE REFRACTION &amp; VISION (OD / OS)</span>
          {pd && <span>PD: <strong className="font-mono">{pd}</strong></span>}
        </div>
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className={`border-b ${showBorder ? 'border-black' : 'border-slate-300'} text-[0.8em] font-bold bg-slate-50`}>
              <th className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 px-1 w-[12%]`}>Eye</th>
              <th className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 px-1 w-[14%]`}>SPH</th>
              <th className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 px-1 w-[14%]`}>CYL</th>
              <th className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 px-1 w-[14%]`}>AXIS</th>
              <th className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 px-1 w-[14%]`}>VA</th>
              <th className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 px-1 w-[14%]`}>IOP</th>
              <th className="py-0.5 px-1 w-[18%]">ADD</th>
            </tr>
          </thead>
          <tbody className="font-mono font-semibold">
            <tr className={`border-b ${showBorder ? 'border-black' : 'border-slate-200'}`}>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 font-bold font-sans bg-slate-50`}>OD (R)</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{od.sph || '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{od.cyl || '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{od.axis ? `${od.axis}°` : '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{od.va || '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{od.iop || '-'}</td>
              <td className="py-0.5">{od.add || '-'}</td>
            </tr>
            <tr>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5 font-bold font-sans bg-slate-50`}>OS (L)</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{os.sph || '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{os.cyl || '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{os.axis ? `${os.axis}°` : '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{os.va || '-'}</td>
              <td className={`border-r ${showBorder ? 'border-black' : 'border-slate-200'} py-0.5`}>{os.iop || '-'}</td>
              <td className="py-0.5">{os.add || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render Vitals block according to direction (horizontal vs vertical)
  const renderVitalsBlock = (node) => {
    const fontSize = getFontSizeMm(node?.font_size || 'sm');
    const direction = node?.vitals_direction || settings?.vitals_direction || VITALS_DIRECTIONS.HORIZONTAL;
    const showLabel = node?.show_label !== false;
    const showUnit = node?.show_unit !== false;
    const showBorder = node?.show_border !== false;

    return (
      <div
        className={`w-full h-full p-1 ${showBorder ? 'border border-slate-300 rounded-sm' : ''} bg-white overflow-hidden flex flex-col justify-center`}
        style={{ fontSize }}
      >
        {showLabel && (
          <div className={`font-bold text-[0.8em] text-slate-700 uppercase tracking-wider mb-0.5 ${showBorder ? 'border-b border-slate-200' : ''} pb-0.5`}>
            Vital Signs
          </div>
        )}
        <div
          className={`w-full overflow-hidden ${
            direction === 'vertical'
              ? 'flex flex-col gap-1 items-start'
              : 'flex flex-wrap items-center justify-start gap-x-3 gap-y-1'
          }`}
        >
          {activeVitalsList.map((item) => (
            <div key={item.key} className="flex items-center gap-1 font-mono text-[0.9em] whitespace-nowrap">
              <span className="font-bold text-slate-800">{item.label}:</span>
              <span className="text-black font-semibold">{item.val}</span>
              {showUnit && item.unit && <span className="text-[0.8em] text-slate-500 font-sans">{item.unit}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render single node content for freeform studio and print
  const renderNodeContent = (key, node) => {
    const fontSize = getFontSizeMm(node?.font_size || 'md');
    const showLabel = node?.show_label !== false;
    const showBorder = node?.show_border !== false;

    switch (key) {
      case 'patient_unified': {
        const patientName = activePatient?.name || activePatient?.full_name || s.patient.name;
        const patientAge = activePatient?.age || s.patient.age;
        const rxDate = activeEncounter?.date || activeEncounter?.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10);
        const rxCode = activeEncounter?.prescription_code || activeEncounter?.serial_no || s.encounter.serial_no;

        return (
          <div
            className={`w-full h-full flex items-center justify-between ${showBorder ? 'border-b border-black' : ''} pb-1 px-1 bg-white select-none`}
            style={{ fontSize }}
          >
            <div>{showLabel && <span className="font-bold text-slate-600">Patient: </span>}<strong>{patientName}</strong></div>
            <div>{showLabel && <span className="font-bold text-slate-600">Age: </span>}<span>{patientAge}</span></div>
            <div>{showLabel && <span className="font-bold text-slate-600">Date: </span>}<span className="font-mono">{rxDate}</span></div>
            <div>{showLabel && <span className="font-bold text-slate-600">Rx#: </span>}<span className="font-mono font-bold">{rxCode}</span></div>
          </div>
        );
      }

      case 'patient_name':
        return (
          <div className="w-full h-full flex items-center px-1 font-semibold select-none" style={{ fontSize }}>
            {showLabel && <span className="font-bold text-slate-600 mr-1.5">Patient:</span>}
            <span>{activePatient?.name || activePatient?.full_name}</span>
          </div>
        );

      case 'patient_age':
        return (
          <div className="w-full h-full flex items-center px-1 select-none" style={{ fontSize }}>
            {showLabel && <span className="font-bold text-slate-600 mr-1.5">Age:</span>}
            <span>{activePatient?.age}</span>
          </div>
        );

      case 'patient_date':
        return (
          <div className="w-full h-full flex items-center px-1 font-mono select-none" style={{ fontSize }}>
            {showLabel && <span className="font-bold text-slate-600 font-sans mr-1.5">Date:</span>}
            <span>{activeEncounter?.date || activeEncounter?.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10)}</span>
          </div>
        );

      case 'patient_rx_code':
        return (
          <div className="w-full h-full flex items-center px-1 font-mono font-bold select-none" style={{ fontSize }}>
            {showLabel && <span className="font-bold text-slate-600 font-sans mr-1.5">Rx:</span>}
            <span>{activeEncounter?.prescription_code || activeEncounter?.serial_no}</span>
          </div>
        );

      case 'patient_phone':
        return (
          <div className="w-full h-full flex items-center px-1 font-mono select-none" style={{ fontSize }}>
            {showLabel && <span className="font-bold text-slate-600 font-sans mr-1.5">Tel:</span>}
            <span>{activePatient?.phone}</span>
          </div>
        );

      case 'vitals_block':
        return renderVitalsBlock(node);

      case 'refraction_block':
        return renderEyeRefractionTable(node?.font_size || 'sm', showBorder);

      case 'diagnosis_block': {
        const diagText = Array.isArray(activeDiagnoses)
          ? activeDiagnoses.map((d) => (typeof d === 'string' ? d : d.name || d.description || '')).join(' • ')
          : activeDiagnoses;

        return (
          <div className={`w-full h-full flex flex-col justify-center px-1.5 ${showBorder ? 'border-l-2 border-black pl-2' : 'pl-1'} select-none`} style={{ fontSize }}>
            {showLabel && <div className="text-[0.75em] font-bold text-slate-600 uppercase">Diagnosis</div>}
            <div className="font-bold text-slate-900">{diagText}</div>
          </div>
        );
      }

      case 'medications_block':
        return (
          <div className={`w-full h-full p-2 ${showBorder ? 'border border-black/30 rounded-sm' : ''} bg-white overflow-hidden flex flex-col select-none`} style={{ fontSize }}>
            <div className="flex items-center gap-2 pb-1 mb-1 border-b border-black">
              <span className="text-[1.4em] font-serif font-black">℞</span>
              {showLabel && <span className="font-bold text-[0.85em] tracking-wide uppercase">Medications &amp; Directions</span>}
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {activeMedications.map((m, idx) => (
                <div key={m.id || idx} className="leading-snug">
                  <div className="font-bold font-mono text-[0.95em] text-left" dir="ltr">
                    {idx + 1}. {m.name || m.drug_name}
                  </div>
                  <div className="text-[0.85em] text-slate-800 pr-3 font-sans text-right" dir="rtl">
                    {m.dosage || m.dose || m.instructions || 'قرص بعد الأكل'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'advice_block':
        return (
          <div className={`w-full h-full p-1.5 ${showBorder ? 'border border-slate-300 rounded-sm' : ''} bg-white overflow-hidden flex flex-col justify-center select-none`} style={{ fontSize }}>
            {showLabel && <div className="text-[0.75em] font-bold text-slate-600 uppercase mb-0.5">Instructions &amp; Follow-Up</div>}
            <div className="text-[0.85em] leading-tight text-slate-800 line-clamp-2">{activeAdvice}</div>
            {activeFollowUp && <div className="text-[0.8em] font-bold mt-1 text-slate-900">Next Visit: {activeFollowUp}</div>}
          </div>
        );

      case 'qr_block': {
        const qrUrl = `https://verify.clinic/rx/${activeEncounter?.prescription_code || 'DEMO'}`;
        return (
          <div className={`w-full h-full flex flex-col items-center justify-center p-1 text-center bg-white ${showBorder ? 'border border-slate-200' : ''} select-none`}>
            <VectorQrCode value={qrUrl} size={42} color="#000000" />
            <span className="text-[7px] font-mono font-bold mt-0.5 text-black">VERIFIED</span>
          </div>
        );
      }

      default: {
        // Check if split refraction item
        if (key.startsWith('refr_')) {
          const od = activeVisionData?.od || {};
          const os = activeVisionData?.os || {};
          const pd = activeVisionData?.pd || '';
          let val = '-';
          if (key === 'refr_od_sph') val = od.sph || '-';
          else if (key === 'refr_od_cyl') val = od.cyl || '-';
          else if (key === 'refr_od_axis') val = od.axis ? `${od.axis}°` : '-';
          else if (key === 'refr_od_va') val = od.va || '-';
          else if (key === 'refr_os_sph') val = os.sph || '-';
          else if (key === 'refr_os_cyl') val = os.cyl || '-';
          else if (key === 'refr_os_axis') val = os.axis ? `${os.axis}°` : '-';
          else if (key === 'refr_os_va') val = os.va || '-';
          else if (key === 'refr_pd') val = pd || '-';

          const meta = getNodeMetadata(key);
          return (
            <div className={`w-full h-full flex items-center px-1 ${showBorder ? 'border border-slate-300 rounded-xs' : ''} bg-white overflow-hidden select-none`} style={{ fontSize }}>
              {showLabel && <span className="font-bold text-slate-600 mr-1 shrink-0">{node?.label || meta.title.replace('Eye Refraction: ', '')}:</span>}
              <span className="font-mono font-bold text-black truncate">{val}</span>
            </div>
          );
        }

        // Individual vital item (split mode)
        const showUnit = node?.show_unit !== false;
        const meta = getNodeMetadata(key, vitalsConfig);
        const itemVal = activeVitals?.[key] || '---';

        return (
          <div className={`w-full h-full flex items-center px-1 ${showBorder ? 'border border-slate-200 rounded-xs' : ''} bg-white overflow-hidden select-none`} style={{ fontSize }}>
            {showLabel && <span className="font-bold text-slate-600 mr-1 shrink-0">{meta.label || meta.title}:</span>}
            <span className="font-mono font-bold text-black truncate">{itemVal}</span>
            {showUnit && meta.unit && <span className="text-[0.8em] text-slate-500 ml-0.5 shrink-0">{meta.unit}</span>}
          </div>
        );
      }
    }
  };

  return (
    <div
      ref={ref}
      id="prescription-print-document"
      className={`prescription-sheet-wrapper relative bg-white text-black font-sans box-border select-none overflow-hidden ${
        isPreview && !isStudio ? 'shadow-2xl rounded-sm border border-slate-300 mx-auto shrink-0' : 'print-page-root'
      } ${className}`}
      dir="ltr"
      style={{
        width: paperDim.widthCss,
        height: paperDim.heightCss,
        minHeight: paperDim.heightCss,
        maxHeight: isFreeform ? paperDim.heightCss : undefined,
        filter: combinedFilter,
        WebkitFilter: combinedFilter,
      }}
    >
      {/* 5mm Safe Print Margins Guide (Visible on Screen, completely hidden in Physical Print) */}
      {showSafeMargins && (
        <div
          className="absolute inset-[5mm] pointer-events-none border border-dashed border-red-300/40 z-30 print:hidden"
          title="5mm Safe Print Margin boundary"
        />
      )}

      {/* Layer 1: Background Stationery Image (Printed) */}
      {mode !== 'letterhead' && bgUrl && (
        <img
          src={bgUrl}
          alt="Stationery Background"
          loading="eager"
          decoding="sync"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
        />
      )}

      {/* Layer 2: Alignment Guide Image (NEVER Printed — print:hidden) */}
      {guideUrl && (
        <img
          src={guideUrl}
          alt="Letterhead Alignment Guide"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none opacity-40 z-0 print:hidden"
        />
      )}

      {/* Mode A: FREEFORM CANVAS RENDERER */}
      {isFreeform ? (
        <div className="relative w-full h-full z-10 box-border p-0 m-0">
          {Object.keys(pageLayout).map((key) => {
            const isSpecialMode = key.endsWith('_mode') || key === 'vitals_items' || key === 'split_items';
            if (isSpecialMode) return null;

            // Handle split modes
            if (pageLayout.vitals_mode === 'split' && key === 'vitals_block') return null;
            if (pageLayout.patient_mode === 'split' && key === 'patient_unified') return null;
            if (pageLayout.patient_mode !== 'split' && ['patient_name', 'patient_age', 'patient_date', 'patient_rx_code', 'patient_phone'].includes(key)) return null;
            if (pageLayout.refraction_mode === 'split' && key === 'refraction_block') return null;

            const node = pageLayout[key];
            if (!node) return null;
            if (!isStudio && node.is_visible === false) return null;

            if (isStudio) {
              return (
                <DraggableCanvasNode
                  key={key}
                  id={key}
                  node={node}
                  isSelected={selectedNodeId === key}
                  onSelect={onSelectNode}
                  onPointerDown={onPointerDown}
                  vitalsConfig={vitalsConfig}
                >
                  {renderNodeContent(key, node)}
                </DraggableCanvasNode>
              );
            }

            return (
              <div
                key={key}
                className="absolute z-10 overflow-hidden box-border"
                style={{
                  left: `${node.x_pct}%`,
                  top: `${node.y_pct}%`,
                  width: `${node.width_pct}%`,
                  height: `${node.height_pct}%`,
                }}
              >
                {renderNodeContent(key, node)}
              </div>
            );
          })}

          {/* Render split vitals items if enabled */}
          {pageLayout.vitals_mode === 'split' &&
            pageLayout.vitals_items &&
            Object.entries(pageLayout.vitals_items).map(([vKey, vNode]) => {
              if (!vNode) return null;
              if (!isStudio && vNode.is_visible === false) return null;

              if (isStudio) {
                return (
                  <DraggableCanvasNode
                    key={vKey}
                    id={vKey}
                    node={vNode}
                    isSelected={selectedNodeId === vKey}
                    onSelect={onSelectNode}
                    onPointerDown={onPointerDown}
                    vitalsConfig={vitalsConfig}
                  >
                    {renderNodeContent(vKey, vNode)}
                  </DraggableCanvasNode>
                );
              }

              return (
                <div
                  key={vKey}
                  className="absolute z-10 overflow-hidden box-border"
                  style={{
                    left: `${vNode.x_pct}%`,
                    top: `${vNode.y_pct}%`,
                    width: `${vNode.width_pct}%`,
                    height: `${vNode.height_pct}%`,
                  }}
                >
                  {renderNodeContent(vKey, vNode)}
                </div>
              );
            })}

          {/* Render split refraction items if enabled */}
          {pageLayout.refraction_mode === 'split' &&
            pageLayout.refraction_block?.split_items &&
            Object.entries(pageLayout.refraction_block.split_items).map(([rKey, rNode]) => {
              if (!rNode) return null;
              if (!isStudio && rNode.is_visible === false) return null;

              if (isStudio) {
                return (
                  <DraggableCanvasNode
                    key={rKey}
                    id={rKey}
                    node={rNode}
                    isSelected={selectedNodeId === rKey}
                    onSelect={onSelectNode}
                    onPointerDown={onPointerDown}
                    vitalsConfig={vitalsConfig}
                  >
                    {renderNodeContent(rKey, rNode)}
                  </DraggableCanvasNode>
                );
              }

              return (
                <div
                  key={rKey}
                  className="absolute z-10 overflow-hidden box-border"
                  style={{
                    left: `${rNode.x_pct}%`,
                    top: `${rNode.y_pct}%`,
                    width: `${rNode.width_pct}%`,
                    height: `${rNode.height_pct}%`,
                  }}
                >
                  {renderNodeContent(rKey, rNode)}
                </div>
              );
            })}
        </div>
      ) : (
        /* Mode B: STANDARD FLOW RENDERER */
        <div
          className="relative w-full h-full z-10 box-border flex flex-col justify-between"
          style={{
            paddingTop: `${margins.top_cm}cm`,
            paddingBottom: `${margins.bottom_cm}cm`,
            paddingLeft: `${margins.left_cm}cm`,
            paddingRight: `${margins.right_cm}cm`,
            fontSize: standardFontSize,
          }}
        >
          {/* Header Section (Built-in mode) */}
          {mode === 'builtin' && (
            <div className={`${showBorders ? 'border-b-2 border-black' : ''} pb-2 mb-3`}>
              <div className="flex justify-between items-start">
                <div className="text-left" dir="ltr">
                  <h1 className="text-[1.25em] font-black m-0 text-black">{settings.header_data?.title || activeDoctor.name}</h1>
                  <p className="text-[0.85em] text-slate-700 m-0 font-medium">{settings.header_data?.specialty || activeDoctor.title}</p>
                  <p className="text-[0.75em] text-slate-500 m-0">{settings.header_data?.degrees || activeDoctor.degrees}</p>
                </div>
                {branch && (
                  <div className="text-right text-[0.8em] text-slate-600" dir="rtl">
                    <div className="font-bold text-black">{branch.name}</div>
                    <div>{branch.phone || branch.address}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Patient Unified Meta Bar */}
          <div className={`${showBorders ? 'border-b border-black' : ''} pb-1.5 mb-3 flex items-center justify-between text-[0.85em] bg-white`}>
            <div><span className="font-bold text-slate-700">Patient: </span><span className="font-bold">{activePatient.name || activePatient.full_name}</span></div>
            <div><span className="font-bold text-slate-700">Age: </span><span>{activePatient.age}</span></div>
            <div><span className="font-bold text-slate-700">Date: </span><span className="font-mono">{activeEncounter.date || new Date().toISOString().slice(0, 10)}</span></div>
            {settings.show_rx_code !== false && (
              <div><span className="font-bold text-slate-700">Rx#: </span><span className="font-mono font-bold">{activeEncounter.prescription_code || 'DEMO'}</span></div>
            )}
          </div>

          {/* Standard Flow Body: Side-by-Side vs Stacked */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {standardLayout === STANDARD_FLOW_LAYOUTS.SIDE_BY_SIDE ? (
              /* Side-by-Side: Vitals & Refraction on Left Column, Medications on Right Column */
              <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
                <div className="col-span-5 flex flex-col space-y-3 overflow-hidden">
                  {settings.show_vitals !== false && activeVitalsList.length > 0 && (
                    renderVitalsBlock({ font_size: 'sm', vitals_direction: 'vertical', show_border: showBorders })
                  )}

                  {isRefractionEnabled && (
                    <div className="overflow-hidden">
                      {renderEyeRefractionTable('xs', showBorders)}
                    </div>
                  )}

                  {settings.show_diagnosis !== false && activeDiagnoses.length > 0 && (
                    <div className={`${showBorders ? 'border-l-2 border-black pl-2' : 'pl-1'} py-1`}>
                      <div className="text-[0.75em] font-bold text-slate-600 uppercase">Diagnosis</div>
                      <div className="font-bold text-[0.85em]">{activeDiagnoses.join(' • ')}</div>
                    </div>
                  )}
                </div>

                <div className={`col-span-7 flex flex-col ${showBorders ? 'border border-black' : ''} p-3 rounded-sm overflow-hidden`}>
                  <div className="flex items-center gap-2 pb-1 mb-2 border-b border-black">
                    <span className="text-[1.4em] font-serif font-black">℞</span>
                    <span className="font-bold text-[0.85em] uppercase tracking-wide">Medications &amp; Directions</span>
                  </div>
                  <div className="flex-1 space-y-2.5 overflow-hidden">
                    {activeMedications.map((m, idx) => (
                      <div key={m.id || idx}>
                        <div className="font-bold font-mono text-[0.95em]" dir="ltr">{idx + 1}. {m.name || m.drug_name}</div>
                        <div className="text-[0.85em] text-slate-700 pr-3 text-right" dir="rtl">{m.dosage || m.dose || m.instructions || 'قرص بعد الأكل'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Stacked Layout: Full-Width Vitals Bar & Refraction, followed by Full-Width Medications Rx */
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
                {settings.show_vitals !== false && activeVitalsList.length > 0 && (
                  <div className={`${showBorders ? 'border border-slate-300' : ''} p-2 rounded-sm flex items-center justify-start gap-4 flex-wrap bg-white`}>
                    <span className="font-bold text-[0.8em] uppercase tracking-wider text-slate-600">Vitals:</span>
                    {activeVitalsList.map((item) => (
                      <div key={item.key} className="font-mono text-[0.85em]">
                        <span className="font-bold text-slate-700">{item.label}: </span>
                        <span><strong>{item.val}</strong> {item.unit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isRefractionEnabled && (
                  <div>{renderEyeRefractionTable('sm', showBorders)}</div>
                )}

                {settings.show_diagnosis !== false && activeDiagnoses.length > 0 && (
                  <div className={`${showBorders ? 'border-l-2 border-black pl-2' : 'pl-1'} py-0.5`}>
                    <span className="font-bold text-slate-600 text-[0.8em] mr-2">Diagnosis:</span>
                    <span className="font-bold">{activeDiagnoses.join(' • ')}</span>
                  </div>
                )}

                <div className={`flex-1 ${showBorders ? 'border border-black' : ''} p-3 rounded-sm flex flex-col overflow-hidden`}>
                  <div className="flex items-center gap-2 pb-1 mb-2 border-b border-black">
                    <span className="text-[1.4em] font-serif font-black">℞</span>
                    <span className="font-bold text-[0.85em] uppercase tracking-wide">Medications &amp; Directions</span>
                  </div>
                  <div className="flex-1 space-y-2.5 overflow-hidden">
                    {activeMedications.map((m, idx) => (
                      <div key={m.id || idx}>
                        <div className="font-bold font-mono text-[0.95em]" dir="ltr">{idx + 1}. {m.name || m.drug_name}</div>
                        <div className="text-[0.85em] text-slate-700 pr-3 text-right" dir="rtl">{m.dosage || m.dose || m.instructions || 'قرص بعد الأكل'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className={`mt-3 pt-2 ${showBorders ? 'border-t border-black' : ''} flex justify-between items-end text-[0.8em]`}>
            <div className="max-w-[75%]">
              <div className="font-bold text-slate-800">Advice: <span className="font-normal">{activeAdvice}</span></div>
              {activeFollowUp && <div className="font-bold text-slate-900 mt-0.5">Next Appointment: {activeFollowUp}</div>}
              {mode === 'builtin' && settings.footer_data?.address && (
                <div className="text-[0.85em] text-slate-500 mt-1">{settings.footer_data.address}</div>
              )}
            </div>
            {settings.show_qr !== false && (
              <div className="text-center">
                <VectorQrCode value={`https://verify.clinic/rx/${activeEncounter.prescription_code || 'DEMO'}`} size={36} color="#000000" />
                <div className="text-[7px] font-mono font-bold mt-0.5">VERIFIED</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default SharedPrescriptionRenderer;
