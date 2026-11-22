export * from './templateOptions';

export const LAYOUT_MODES = {
  STANDARD_FLOW: 'standard_flow',
  FREEFORM_CANVAS: 'freeform_canvas',
};

/**
 * Standard items coordinates generator for split vitals.
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
  };
};

/**
 * Default Freeform Layout with identical keys for both A5 and A4.
 */
const BASE_FREEFORM_PAGE = {
  patient_mode: 'unified', // 'unified' | 'split'
  vitals_mode: 'unified',  // 'unified' | 'split'
  patient_unified: { x_pct: 5, y_pct: 4, width_pct: 90, height_pct: 6, is_visible: true, show_label: true, font_size: 'base' },
  patient_name: { x_pct: 5, y_pct: 4, width_pct: 38, height_pct: 5, is_visible: true, show_label: true },
  patient_age: { x_pct: 45, y_pct: 4, width_pct: 18, height_pct: 5, is_visible: true, show_label: true },
  patient_date: { x_pct: 65, y_pct: 4, width_pct: 15, height_pct: 5, is_visible: true, show_label: true },
  patient_rx_code: { x_pct: 82, y_pct: 4, width_pct: 13, height_pct: 5, is_visible: true, show_label: true },
  patient_phone: { x_pct: 5, y_pct: 9.5, width_pct: 35, height_pct: 4, is_visible: false, show_label: true },
  vitals_block: { x_pct: 5, y_pct: 11, width_pct: 90, height_pct: 7, is_visible: true, show_label: true, show_unit: true, font_size: 'sm' },
  vitals_items: {
    blood_pressure: { x_pct: 5, y_pct: 11, width_pct: 20, height_pct: 4, is_visible: true, show_label: true, show_unit: true },
    heart_rate: { x_pct: 27, y_pct: 11, width_pct: 18, height_pct: 4, is_visible: true, show_label: true, show_unit: true },
    temperature: { x_pct: 47, y_pct: 11, width_pct: 18, height_pct: 4, is_visible: true, show_label: true, show_unit: true },
    blood_glucose: { x_pct: 67, y_pct: 11, width_pct: 18, height_pct: 4, is_visible: true, show_label: true, show_unit: true },
  },
  diagnosis_block: { x_pct: 5, y_pct: 19, width_pct: 90, height_pct: 6, is_visible: true, show_label: true, font_size: 'sm' },
  refraction_block: { x_pct: 5, y_pct: 26, width_pct: 90, height_pct: 12, is_visible: false, show_label: true, font_size: 'sm' },
  medications_block: { x_pct: 5, y_pct: 26, width_pct: 90, height_pct: 50, is_visible: true, show_label: true, font_size: 'base' },
  advice_block: { x_pct: 5, y_pct: 78, width_pct: 65, height_pct: 12, is_visible: true, show_label: true, font_size: 'sm' },
  qr_block: { x_pct: 75, y_pct: 84, width_pct: 20, height_pct: 12, is_visible: true, show_label: false },
};

export const DEFAULT_FREEFORM_LAYOUT = {
  A5: { ...BASE_FREEFORM_PAGE },
  A4: {
    ...BASE_FREEFORM_PAGE,
    patient_unified: { ...BASE_FREEFORM_PAGE.patient_unified, y_pct: 3, height_pct: 5 },
    vitals_block: { ...BASE_FREEFORM_PAGE.vitals_block, y_pct: 9, height_pct: 6 },
    diagnosis_block: { ...BASE_FREEFORM_PAGE.diagnosis_block, y_pct: 16, height_pct: 5 },
    medications_block: { ...BASE_FREEFORM_PAGE.medications_block, y_pct: 22, height_pct: 56 },
    advice_block: { ...BASE_FREEFORM_PAGE.advice_block, y_pct: 80, height_pct: 12 },
    qr_block: { ...BASE_FREEFORM_PAGE.qr_block, y_pct: 85, height_pct: 10 },
  },
};

/**
 * Default prescription settings fallback.
 */
export const DEFAULT_PRESCRIPTION_SETTINGS = {
  mode: 'builtin', // 'letterhead' | 'builtin' | 'custom_image'
  layout_mode: LAYOUT_MODES.STANDARD_FLOW, // 'standard_flow' | 'freeform_canvas'
  template_id: 'egyptian_clinic',
  body_layout: 'columns',
  font_size: 'md',
  paper_size: 'A5',
  margins: { top_cm: 4.5, bottom_cm: 3.0, left_cm: 1.5, right_cm: 1.5 },
  show_diagnosis: true,
  show_vitals: true,
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
  { id: 'A5', label: 'ورق A5 (المقاس الطبي القياسي 148×210 مم)', desc: 'المقاس الأكثر شيوعاً في العيادات' },
  { id: 'A4', label: 'ورق A4 (المقاس الكامل 210×297 مم)', desc: 'مناسب للتقارير والروشتات الطويلة ومراكز المستشفيات' },
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
  maxSizeFormatted: '2 ميجابايت',
  dimensions: { minWidth: 300, minHeight: 300, maxWidth: 4500, maxHeight: 4500 },
};

export const COLOR_PRESETS = [
  { hex: '#991b1b', name: 'أحمر داكن كلاسيكي' },
  { hex: '#0284c7', name: 'أزرق طبي سماوي' },
  { hex: '#0f766e', name: 'أخضر زمردي وقور' },
  { hex: '#4f46e5', name: 'نيلي مستشفيات' },
  { hex: '#7c3aed', name: 'بنفسجي تجميل' },
  { hex: '#0f172a', name: 'أسود فحمي أحادي' },
];

export const getPrintPageStyle = (paperSize = 'A5') => `
  @page { size: ${paperSize} portrait; margin: 0 !important; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; background: #ffffff !important; -webkit-print-color-adjust: exact !important; }
    .print-page-root { box-shadow: none !important; border: none !important; width: 100% !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; }
  }
`;
