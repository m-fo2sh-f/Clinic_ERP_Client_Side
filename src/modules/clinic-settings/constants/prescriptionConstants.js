export * from './templateOptions';

export const LAYOUT_MODES = {
  STANDARD_FLOW: 'standard_flow',
  FREEFORM_CANVAS: 'freeform_canvas',
};

export const STANDARD_FLOW_LAYOUTS = {
  SIDE_BY_SIDE: 'side_by_side',
  STACKED: 'stacked',
};

export const VITALS_DIRECTIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

export const PAPER_DIMENSIONS = {
  A4: { widthMm: 210, heightMm: 297, widthCss: '210mm', heightCss: '297mm', aspect: 210 / 297 },
  A5: { widthMm: 148, heightMm: 210, widthCss: '148mm', heightCss: '210mm', aspect: 148 / 210 },
};

export const TYPOGRAPHY_STEPS = [
  { key: 'xs', label: 'Extra Small (8pt / 2.8mm)', pt: 8, mm: 2.8, cssSize: '2.8mm' },
  { key: 'sm', label: 'Small (9.5pt / 3.2mm)', pt: 9.5, mm: 3.2, cssSize: '3.2mm' },
  { key: 'md', label: 'Medium (11pt / 3.8mm)', pt: 11, mm: 3.8, cssSize: '3.8mm' },
  { key: 'lg', label: 'Large (13pt / 4.5mm)', pt: 13, mm: 4.5, cssSize: '4.5mm' },
  { key: 'xl', label: 'Extra Large (16pt / 5.5mm)', pt: 16, mm: 5.5, cssSize: '5.5mm' },
  { key: '2xl', label: 'Heading (20pt / 7.0mm)', pt: 20, mm: 7.0, cssSize: '7.0mm' },
  { key: '3xl', label: 'Display (24pt / 8.5mm)', pt: 24, mm: 8.5, cssSize: '8.5mm' },
];

export const normalizeFontSizeKey = (key) => {
  if (!key) return 'md';
  if (key === 'base') return 'md';
  return key;
};

export const getTypographyStep = (key) => {
  const normalized = normalizeFontSizeKey(key);
  return TYPOGRAPHY_STEPS.find((s) => s.key === normalized) || TYPOGRAPHY_STEPS[2];
};

/**
 * Standard coordinates generator for split vitals.
 */
export const generateDefaultVitalItemCoordinates = (key, index = 0, _total = 6) => {
  const row = Math.floor(index / 2);
  const col = index % 2;
  return {
    x_pct: col === 0 ? 5 : 52,
    y_pct: Number((22 + row * 4.5).toFixed(1)),
    width_pct: 42,
    height_pct: 4,
    is_visible: true,
    show_label: true,
    show_unit: true,
    font_size: 'md',
  };
};

/**
 * Default Freeform Layout with identical keys for both A4 (default) and A5.
 */
const BASE_FREEFORM_PAGE = {
  patient_mode: 'unified', // 'unified' | 'split'
  vitals_mode: 'unified',  // 'unified' | 'split'
  refraction_mode: 'table', // 'table' | 'split'
  patient_unified: { x_pct: 5, y_pct: 3, width_pct: 90, height_pct: 5.5, is_visible: true, show_label: true, font_size: 'md' },
  patient_name: { x_pct: 5, y_pct: 3, width_pct: 38, height_pct: 4.5, is_visible: true, show_label: true, font_size: 'md' },
  patient_age: { x_pct: 45, y_pct: 3, width_pct: 18, height_pct: 4.5, is_visible: true, show_label: true, font_size: 'md' },
  patient_date: { x_pct: 65, y_pct: 3, width_pct: 15, height_pct: 4.5, is_visible: true, show_label: true, font_size: 'md' },
  patient_rx_code: { x_pct: 82, y_pct: 3, width_pct: 13, height_pct: 4.5, is_visible: true, show_label: true, font_size: 'md' },
  patient_phone: { x_pct: 5, y_pct: 8, width_pct: 35, height_pct: 4, is_visible: false, show_label: true, font_size: 'sm' },
  vitals_block: {
    x_pct: 5,
    y_pct: 9.5,
    width_pct: 90,
    height_pct: 6.5,
    is_visible: true,
    show_label: true,
    show_unit: true,
    font_size: 'sm',
    vitals_direction: 'horizontal', // 'horizontal' | 'vertical'
  },
  vitals_items: {
    blood_pressure: { x_pct: 5, y_pct: 9.5, width_pct: 20, height_pct: 4, is_visible: true, show_label: true, show_unit: true, font_size: 'sm' },
    heart_rate: { x_pct: 27, y_pct: 9.5, width_pct: 18, height_pct: 4, is_visible: true, show_label: true, show_unit: true, font_size: 'sm' },
    temperature: { x_pct: 47, y_pct: 9.5, width_pct: 18, height_pct: 4, is_visible: true, show_label: true, show_unit: true, font_size: 'sm' },
    blood_glucose: { x_pct: 67, y_pct: 9.5, width_pct: 18, height_pct: 4, is_visible: true, show_label: true, show_unit: true, font_size: 'sm' },
  },
  diagnosis_block: { x_pct: 5, y_pct: 17, width_pct: 90, height_pct: 5, is_visible: true, show_label: true, font_size: 'md' },
  refraction_block: {
    x_pct: 5,
    y_pct: 23,
    width_pct: 90,
    height_pct: 13,
    is_visible: true,
    show_label: true,
    font_size: 'sm',
    mode: 'table', // 'table' | 'split'
    split_items: {
      refr_od_sph: { x_pct: 5, y_pct: 23, width_pct: 14, height_pct: 4, is_visible: true, label: 'OD Sph' },
      refr_od_cyl: { x_pct: 20, y_pct: 23, width_pct: 14, height_pct: 4, is_visible: true, label: 'OD Cyl' },
      refr_od_axis: { x_pct: 35, y_pct: 23, width_pct: 14, height_pct: 4, is_visible: true, label: 'OD Axis' },
      refr_od_va: { x_pct: 50, y_pct: 23, width_pct: 14, height_pct: 4, is_visible: true, label: 'OD VA' },
      refr_os_sph: { x_pct: 5, y_pct: 28, width_pct: 14, height_pct: 4, is_visible: true, label: 'OS Sph' },
      refr_os_cyl: { x_pct: 20, y_pct: 28, width_pct: 14, height_pct: 4, is_visible: true, label: 'OS Cyl' },
      refr_os_axis: { x_pct: 35, y_pct: 28, width_pct: 14, height_pct: 4, is_visible: true, label: 'OS Axis' },
      refr_os_va: { x_pct: 50, y_pct: 28, width_pct: 14, height_pct: 4, is_visible: true, label: 'OS VA' },
      refr_pd: { x_pct: 66, y_pct: 28, width_pct: 14, height_pct: 4, is_visible: true, label: 'PD' },
    },
  },
  medications_block: { x_pct: 5, y_pct: 37, width_pct: 90, height_pct: 43, is_visible: true, show_label: true, font_size: 'md' },
  advice_block: { x_pct: 5, y_pct: 82, width_pct: 65, height_pct: 11, is_visible: true, show_label: true, font_size: 'sm' },
  qr_block: { x_pct: 75, y_pct: 82, width_pct: 20, height_pct: 11, is_visible: true, show_label: false },
};

export const DEFAULT_FREEFORM_LAYOUT = {
  A4: { ...BASE_FREEFORM_PAGE },
  A5: {
    ...BASE_FREEFORM_PAGE,
    medications_block: { ...BASE_FREEFORM_PAGE.medications_block, height_pct: 40 },
    advice_block: { ...BASE_FREEFORM_PAGE.advice_block, y_pct: 80, height_pct: 12 },
    qr_block: { ...BASE_FREEFORM_PAGE.qr_block, y_pct: 82, height_pct: 10 },
  },
};

/**
 * Default prescription settings fallback (Defaulting strictly to A4).
 */
export const DEFAULT_PRESCRIPTION_SETTINGS = {
  mode: 'builtin', // 'letterhead' | 'builtin' | 'custom_image'
  layout_mode: LAYOUT_MODES.STANDARD_FLOW, // 'standard_flow' | 'freeform_canvas'
  template_id: 'egyptian_clinic',
  body_layout: 'columns',
  standard_flow_layout: STANDARD_FLOW_LAYOUTS.SIDE_BY_SIDE, // 'side_by_side' | 'stacked'
  font_size: 'md',
  paper_size: 'A4', // Standard Default: A4
  margins: { top_cm: 4.5, bottom_cm: 3.0, left_cm: 1.5, right_cm: 1.5 },
  show_diagnosis: true,
  show_vitals: true,
  show_refraction: true,
  show_qr: true,
  show_rx_code: true,
  laser_contrast_opt: true,
  auto_print: false,
  primary_color: '#991b1b',
  freeform_layout: DEFAULT_FREEFORM_LAYOUT,
  guide_image_url: null,
  image_url: null,
};

export const PAPER_SIZES = [
  { id: 'A4', label: 'A4 Paper (Standard 210 × 297 mm)', desc: 'Standard clinical and hospital prescription size' },
  { id: 'A5', label: 'A5 Paper (Compact 148 × 210 mm)', desc: 'Half-page pad size for compact clinics' },
];

export const MARGIN_BOUNDS = {
  top: { min: 0.5, max: 12.0, step: 0.1, default: 4.5 },
  bottom: { min: 0.5, max: 10.0, step: 0.1, default: 3.0 },
  left: { min: 0.5, max: 5.0, step: 0.1, default: 1.5 },
  right: { min: 0.5, max: 5.0, step: 0.1, default: 1.5 },
};

export const ALLOWED_IMAGE_CONFIG = {
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  extensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxSizeBytes: 2 * 1024 * 1024,
  maxSizeFormatted: '2 MB',
  dimensions: { minWidth: 300, minHeight: 300, maxWidth: 4500, maxHeight: 4500 },
};

export const COLOR_PRESETS = [
  { hex: '#991b1b', name: 'Classic Crimson' },
  { hex: '#0284c7', name: 'Clinical Sky Blue' },
  { hex: '#0f766e', name: 'Emerald Medical Teal' },
  { hex: '#4f46e5', name: 'Hospital Indigo' },
  { hex: '#7c3aed', name: 'Specialty Purple' },
  { hex: '#0f172a', name: 'Monochrome Charcoal' },
];

/**
 * Strict Physical Print Stylesheet generator for react-to-print.
 * Locks the hidden iframe body and root to true physical millimeters, zeroing browser margin drift.
 */
export const getPrintPageStyle = (paperSize = 'A4') => {
  const isA5 = paperSize === 'A5';
  const width = isA5 ? '148mm' : '210mm';
  const height = isA5 ? '210mm' : '297mm';

  return `
    @page {
      size: ${paperSize} portrait;
      margin: 0mm !important;
    }
    @media print {
      *, *::before, *::after {
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${width} !important;
        height: ${height} !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .prescription-sheet-wrapper {
        box-shadow: none !important;
        border: none !important;
        width: ${width} !important;
        height: ${height} !important;
        min-height: ${height} !important;
        max-height: ${height} !important;
        margin: 0 !important;
        padding: 0 !important;
        position: relative !important;
        overflow: hidden !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;
};
