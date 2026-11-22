import { TYPOGRAPHY_STEPS, normalizeFontSizeKey } from '../../../constants/prescriptionConstants';

/**
 * Freeform Prescription Canvas Node Definitions & Constants.
 * Strictly decoupled from JSX to preserve SRP and provide clean English localization.
 */

export const CATEGORY_LABELS = {
  patient: 'Patient Information',
  vitals: 'Vital Signs',
  clinical: 'Clinical & Refraction',
  medications: 'Medications & Rx',
  footer: 'Footer & Verification',
};

export const BASE_NODE_METADATA = {
  patient_unified: {
    id: 'patient_unified',
    title: 'Patient Details (Unified Bar)',
    category: 'patient',
    defaultFontSize: 'md',
    hasFontSize: true,
  },
  patient_name: {
    id: 'patient_name',
    title: 'Patient Name',
    category: 'patient',
    defaultFontSize: 'md',
    hasFontSize: true,
  },
  patient_age: {
    id: 'patient_age',
    title: 'Age & Gender',
    category: 'patient',
    defaultFontSize: 'md',
    hasFontSize: true,
  },
  patient_date: {
    id: 'patient_date',
    title: 'Prescription Date',
    category: 'patient',
    defaultFontSize: 'md',
    hasFontSize: true,
  },
  patient_rx_code: {
    id: 'patient_rx_code',
    title: 'Serial / Rx Code',
    category: 'patient',
    defaultFontSize: 'md',
    hasFontSize: true,
  },
  patient_phone: {
    id: 'patient_phone',
    title: 'Patient Phone',
    category: 'patient',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  vitals_block: {
    id: 'vitals_block',
    title: 'Vital Signs (Unified Container)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    hasDirection: true,
  },
  blood_pressure: {
    id: 'blood_pressure',
    title: 'Blood Pressure (BP)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'mmHg',
    label: 'BP',
  },
  heart_rate: {
    id: 'heart_rate',
    title: 'Heart Rate (Pulse)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'bpm',
    label: 'Pulse',
  },
  temperature: {
    id: 'temperature',
    title: 'Body Temperature (Temp)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: '°C',
    label: 'Temp',
  },
  blood_glucose: {
    id: 'blood_glucose',
    title: 'Blood Glucose (RBS)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'mg/dL',
    label: 'RBS',
  },
  blood_sugar: {
    id: 'blood_sugar',
    title: 'Blood Glucose (RBS)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'mg/dL',
    label: 'RBS',
  },
  weight: {
    id: 'weight',
    title: 'Body Weight',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'kg',
    label: 'Weight',
  },
  height: {
    id: 'height',
    title: 'Body Height',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: 'cm',
    label: 'Height',
  },
  spo2: {
    id: 'spo2',
    title: 'Oxygen Saturation (SpO2)',
    category: 'vitals',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: true,
    unit: '%',
    label: 'SpO2',
  },
  diagnosis_block: {
    id: 'diagnosis_block',
    title: 'Clinical Diagnosis',
    category: 'clinical',
    defaultFontSize: 'md',
    hasFontSize: true,
  },
  refraction_block: {
    id: 'refraction_block',
    title: 'OD/OS Eye Refraction Table',
    category: 'clinical',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasTableModeToggle: true,
  },
  medications_block: {
    id: 'medications_block',
    title: 'Medications & Prescriptions (℞)',
    category: 'medications',
    defaultFontSize: 'md',
    hasFontSize: true,
  },
  advice_block: {
    id: 'advice_block',
    title: 'Instructions & Follow-Up Date',
    category: 'footer',
    defaultFontSize: 'sm',
    hasFontSize: true,
  },
  qr_block: {
    id: 'qr_block',
    title: 'Security QR Verification Code',
    category: 'footer',
    defaultFontSize: 'sm',
    hasFontSize: false,
  },
};

export const FONT_SIZE_OPTIONS = TYPOGRAPHY_STEPS.map((s) => ({
  value: s.key,
  label: s.label,
  mm: s.mm,
}));

export function getFontSizeMm(key) {
  const norm = normalizeFontSizeKey(key);
  const found = TYPOGRAPHY_STEPS.find((s) => s.key === norm);
  return found ? `${found.mm}mm` : '3.8mm';
}

export function getNodeMetadata(nodeId, vitalsConfig = null) {
  if (BASE_NODE_METADATA[nodeId]) {
    return BASE_NODE_METADATA[nodeId];
  }

  // Check if it's a split refraction item
  if (nodeId.startsWith('refr_')) {
    const fieldName = nodeId.replace('refr_', '').toUpperCase().replace('_', ' ');
    return {
      id: nodeId,
      title: `Eye Refraction: ${fieldName}`,
      category: 'clinical',
      defaultFontSize: 'sm',
      hasFontSize: true,
    };
  }

  // Check if it's a dynamic custom vital from vitalsConfig
  if (vitalsConfig?.custom_vitals && Array.isArray(vitalsConfig.custom_vitals)) {
    const customMatch = vitalsConfig.custom_vitals.find((cv) => cv.key === nodeId);
    if (customMatch) {
      return {
        id: nodeId,
        title: customMatch.label_en || customMatch.label || nodeId,
        category: 'vitals',
        defaultFontSize: 'sm',
        hasFontSize: true,
        hasShowUnit: true,
        unit: customMatch.unit || '',
        label: customMatch.label_en || customMatch.label || nodeId,
      };
    }
  }

  const isVital = nodeId.startsWith('vital_') || nodeId.includes('pressure') || nodeId.includes('sugar') || nodeId.includes('heart') || nodeId.includes('temp') || nodeId.includes('rate') || nodeId.includes('glucose');
  return {
    id: nodeId,
    title: nodeId.replace(/_/g, ' ').toUpperCase(),
    category: isVital ? 'vitals' : 'clinical',
    defaultFontSize: 'sm',
    hasFontSize: true,
    hasShowUnit: isVital,
  };
}

export const SAMPLE_STUDIO_DATA = {
  patient: {
    name: 'أحمد محمود إبراهيم',
    age: '38 سنة',
    date: '2026-11-22',
    rxCode: 'RX-2026-9841',
    phone: '01098765432',
  },
  vitals: {
    bp: '125/80',
    hr: '74',
    temp: '37.1',
    sugar: '110',
    weight: '78',
    height: '175',
    spo2: '99',
  },
  diagnoses: ['Essential Hypertension', 'Type 2 Diabetes Mellitus'],
  medications: [
    { name: 'Concor 5mg', instructions: 'قرص واحد يومياً صباحاً قبل الإفطار' },
    { name: 'Glucophage 1000mg', instructions: 'قرص مرتين يومياً وسط الوجبات الرئيسية' },
  ],
  advice: 'الالتزام بحمية قليلة الملح وممارسة رياضة المشي 30 دقيقة يومياً.',
  followUpDate: '2026-12-06',
};

export const FONT_SIZE_CLASSES = {
  xs: 'text-[9px]',
  sm: 'text-[11px]',
  md: 'text-xs',
  base: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
  '2xl': 'text-lg',
  '3xl': 'text-xl',
};
