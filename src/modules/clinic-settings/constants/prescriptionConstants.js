export * from './templateOptions';

/**
 * Default prescription settings fallback.
 */
export const DEFAULT_PRESCRIPTION_SETTINGS = {
  mode: 'builtin', // 'letterhead' | 'builtin' | 'custom_image'
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
  clinic_name: 'المركز الطبي لأمراض القلب والباطنة',
  doctor_name: 'دكتور / وحيد سليمان الحنفي',
  doctor_title: 'استشاري الأمراض الباطنة والقلب',
  header_data: {
    title: 'المركز الطبي لأمراض القلب والباطنة',
    specialty: 'عيادات الباطنة والقلب التخصصية',
    degrees: 'زميل كلية الأطباء الملكية بلندن • دكتوراه أمراض القلب',
    sub_specialties: 'باطنة عامة — أمراض القلب — سكر وضغط — رسم قلب وإيكو',
    second_doctor: {
      name: 'دكتور / محمد وحيد سليمان',
      title: 'ماجستير أمراض القلب والأوعية الدموية',
      degrees: 'زمالة كهرومغناطيسية القلب ومنظمات ضربات القلب',
    },
    phones: ['0402388422', '01026758170'],
    address: 'طنطا — ميدان المشحمة — شارع الجلاء — برج الأطباء',
  },
  footer_data: {
    services: 'فحص القلب الفوري بجهاز الإيكو — رسم القلب الكهربائي — سونار على البطن والحوض',
    clinic_phones: '0402388422 — 01026758170',
    doctor_phones: '01227117011 — 01025591123',
    address: 'طنطا — ميدان المشحمة — شارع الجلاء — برج الأطباء',
  },
  image_path: null,
  image_url: null,
  custom_image_url: null,
  background_image: null,
};

/**
 * Paper sizes supported by browser printing.
 */
export const PAPER_SIZES = [
  { id: 'A5', label: 'ورق A5 (المقاس الطبي القياسي 148×210 مم)', desc: 'المقاس الأكثر شيوعاً في العيادات المصرية' },
  { id: 'A4', label: 'ورق A4 (المقاس الكامل 210×297 مم)', desc: 'مناسب للتقارير والروشتات الطويلة ومراكز المستشفيات' },
];

/**
 * Margin calibration boundary values (in centimeters).
 */
export const MARGIN_BOUNDS = {
  top: { min: 0.5, max: 12.0, step: 0.1, default: 4.5 },
  bottom: { min: 0.5, max: 10.0, step: 0.1, default: 3.0 },
  left: { min: 0.5, max: 5.0, step: 0.1, default: 1.5 },
  right: { min: 0.5, max: 5.0, step: 0.1, default: 1.5 },
};

/**
 * Image upload restrictions and validation rules.
 */
export const ALLOWED_IMAGE_CONFIG = {
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  extensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxSizeBytes: 2 * 1024 * 1024,
  maxSizeFormatted: '2 ميجابايت',
  dimensions: { minWidth: 300, minHeight: 300, maxWidth: 4500, maxHeight: 4500 },
};

/**
 * Color presets for theme accent.
 */
export const COLOR_PRESETS = [
  { hex: '#991b1b', name: 'أحمر داكن كلاسيكي' },
  { hex: '#0284c7', name: 'أزرق طبي سماوي' },
  { hex: '#0f766e', name: 'أخضر زمردي وقور' },
  { hex: '#4f46e5', name: 'نيلي مستشفيات' },
  { hex: '#7c3aed', name: 'بنفسجي تجميل' },
  { hex: '#0f172a', name: 'أسود فحمي أحادي' },
];

/**
 * Generates pure CSS page styles for print media query.
 */
export const getPrintPageStyle = (paperSize = 'A5') => `
  @page { size: ${paperSize} portrait; margin: 0 !important; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; background: #ffffff !important; -webkit-print-color-adjust: exact !important; }
    .print-page-root { box-shadow: none !important; border: none !important; width: 100% !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; }
  }
`;
