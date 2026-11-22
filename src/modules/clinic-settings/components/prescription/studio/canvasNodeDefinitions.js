/**
 * Freeform Prescription Canvas Node Definitions & Constants.
 * Strictly decoupled from JSX to preserve SRP and prevent inline constants.
 */

export const NODE_METADATA = {
  patient_unified: {
    id: 'patient_unified',
    title: 'شريط بيانات المريض (موحد)',
    category: 'patient',
    defaultFontSize: 'base',
    hasFontSize: true,
  },
  patient_name: {
    id: 'patient_name',
    title: 'اسم المريض',
    category: 'patient',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  patient_age: {
    id: 'patient_age',
    title: 'السن والنوع',
    category: 'patient',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  patient_date: {
    id: 'patient_date',
    title: 'تاريخ الكشف',
    category: 'patient',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  patient_rx_code: {
    id: 'patient_rx_code',
    title: 'كود الروشتة (Serial)',
    category: 'patient',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  patient_phone: {
    id: 'patient_phone',
    title: 'هاتف المريض',
    category: 'patient',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  vitals_block: {
    id: 'vitals_block',
    title: 'العلامات الحيوية (كتلة موحدة)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
  },
  blood_pressure: {
    id: 'blood_pressure',
    title: 'ضغط الدم (BP)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'mmHg',
    label: 'الضغط',
  },
  heart_rate: {
    id: 'heart_rate',
    title: 'نبض القلب (Pulse)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'bpm',
    label: 'النبض',
  },
  temperature: {
    id: 'temperature',
    title: 'حرارة الجسم (Temp)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: '°C',
    label: 'الحرارة',
  },
  blood_glucose: {
    id: 'blood_glucose',
    title: 'سكر الدم (RBS)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'mg/dL',
    label: 'السكر',
  },
  blood_sugar: {
    id: 'blood_sugar',
    title: 'سكر الدم (RBS)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'mg/dL',
    label: 'السكر',
  },
  weight: {
    id: 'weight',
    title: 'الوزن (Weight)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'kg',
    label: 'الوزن',
  },
  height: {
    id: 'height',
    title: 'الطول (Height)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'cm',
    label: 'الطول',
  },
  spo2: {
    id: 'spo2',
    title: 'الأكسجين (SpO2)',
    category: 'vitals',
    defaultFontSize: 'xs',
    hasFontSize: true,
    hasShowUnit: true,
    unit: '%',
    label: 'الأكسجين',
  },
  diagnosis_block: {
    id: 'diagnosis_block',
    title: 'التشخيص الطبي (Diagnosis)',
    category: 'clinical',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  refraction_block: {
    id: 'refraction_block',
    title: 'فحص قياس النظر (Refraction)',
    category: 'clinical',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  medications_block: {
    id: 'medications_block',
    title: 'الأدوية والجرعات (Medications Rx)',
    category: 'clinical',
    defaultFontSize: 'base',
    hasFontSize: true,
  },
  advice_block: {
    id: 'advice_block',
    title: 'التعليمات والاستشارة (Advice)',
    category: 'footer',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  qr_block: {
    id: 'qr_block',
    title: 'رمز الاستجابة السريع (QR Code)',
    category: 'footer',
    defaultFontSize: 'sm',
    hasFontSize: false,
  },
};

export const CATEGORY_LABELS = {
  patient: 'بيانات المريض',
  vitals: 'العلامات الحيوية',
  clinical: 'المحتوى الطبي',
  footer: 'التذييل والرموز',
};

export const FONT_SIZE_OPTIONS = [
  { value: 'xs', label: 'صغير جداً (XS - 10px)' },
  { value: 'sm', label: 'صغير (SM - 12px)' },
  { value: 'base', label: 'متوسط (MD - 14px)' },
  { value: 'lg', label: 'كبير (LG - 16px)' },
];

export const FONT_SIZE_CLASSES = {
  xs: 'text-[9.5px] leading-tight',
  sm: 'text-xs leading-snug',
  base: 'text-sm leading-normal',
  lg: 'text-base leading-relaxed',
};

export const SAMPLE_STUDIO_DATA = {
  patient: {
    name: 'أحمد محمود إبراهيم',
    age: '38 سنة / ذكر',
    date: '2026/11/05',
    rxCode: 'RX-2026-9841',
    phone: '01098765432',
  },
  vitals: {
    bp: '125/80',
    bpUnit: 'mmHg',
    hr: '74',
    hrUnit: 'bpm',
    temp: '37.1',
    tempUnit: '°C',
    sugar: '110',
    sugarUnit: 'mg/dL',
  },
  diagnosis: 'ارتفاع ضغط الدم الأولي (Primary HTN)',
  refraction: 'R: -1.50 / -0.50 × 180° | L: -1.75 / -0.25 × 90°',
  medications: [
    { id: 1, name: 'Xoraxone 1gm Vial', dose: 'حقنة عضل كل 24 ساعة لمدة 5 أيام' },
    { id: 2, name: 'Panadol Extra Tablets', dose: 'قرص كل 8 ساعات بعد الأكل' },
  ],
  advice: 'حمية قليلة الملح والدهون، الإكثار من شرب الماء وتجنب المسكنات بدون استشارة.',
  qrUrl: 'https://verify.clinic/rx/RX-2026-9841',
};

export function getNodeMetadata(nodeId) {
  if (NODE_METADATA[nodeId]) {
    return NODE_METADATA[nodeId];
  }
  const isVital = nodeId.startsWith('vital_') || nodeId.includes('pressure') || nodeId.includes('sugar') || nodeId.includes('heart') || nodeId.includes('temp') || nodeId.includes('rate') || nodeId.includes('glucose');
  return {
    id: nodeId,
    title: nodeId,
    category: isVital ? 'vitals' : 'clinical',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: isVital,
  };
}
