/**
 * Standard vital signs definitions, units, and ranges.
 */
export const STANDARD_VITALS_CONFIG = [
  { key: 'blood_pressure', label: 'ضغط الدم', labelEn: 'Blood Pressure', unit: 'mmHg', placeholder: '120/80', defaultActive: true },
  { key: 'heart_rate', label: 'النبض', labelEn: 'Heart Rate', unit: 'bpm', placeholder: '72', defaultActive: true },
  { key: 'temperature', label: 'درجة الحرارة', labelEn: 'Temperature', unit: '°C', placeholder: '37.0', defaultActive: true },
  { key: 'respiratory_rate', label: 'معدل التنفس', labelEn: 'Respiratory Rate', unit: 'bpm', placeholder: '16', defaultActive: false },
  { key: 'oxygen_saturation', label: 'نسبة الأكسجين', labelEn: 'SpO2', unit: '%', placeholder: '98', defaultActive: true },
  { key: 'weight', label: 'الوزن', labelEn: 'Weight', unit: 'kg', placeholder: '70', defaultActive: true },
  { key: 'height', label: 'الطول', labelEn: 'Height', unit: 'cm', placeholder: '175', defaultActive: true },
  { key: 'blood_glucose', label: 'سكر الدم', labelEn: 'Random Blood Sugar', unit: 'mg/dL', placeholder: '110', defaultActive: true },
];

/**
 * Specialty presets for 1-click configuration.
 */
export const SPECIALTY_VITALS_PRESETS = [
  {
    id: 'internal_medicine',
    name: 'باطنة عامة وقلب',
    description: 'ضغط الدم، النبض، الحرارة، سكر الدم، الأكسجين، الوزن والطول',
    activeKeys: ['blood_pressure', 'heart_rate', 'temperature', 'blood_glucose', 'oxygen_saturation', 'weight', 'height'],
    enableRefraction: false,
    customVitals: [],
  },
  {
    id: 'pediatrics',
    name: 'طب الأطفال وحديثي الولادة',
    description: 'الوزن، الطول، الحرارة، محيط الرأس، ونسبة الأكسجين',
    activeKeys: ['weight', 'height', 'temperature', 'oxygen_saturation'],
    enableRefraction: false,
    customVitals: [
      { key: 'head_circumference', label: 'محيط الرأس', unit: 'cm', placeholder: '35' },
    ],
  },
  {
    id: 'ophthalmology',
    name: 'طب وجراحة العيون',
    description: 'بطاقة قياس النظر والإنكسار (OD/OS) + ضغط العين وحدة الإبصار وضغط الدم',
    activeKeys: ['blood_pressure'],
    enableRefraction: true,
    customVitals: [
      { key: 'intraocular_pressure', label: 'ضغط العين (IOP)', unit: 'mmHg', placeholder: '15' },
      { key: 'visual_acuity', label: 'حدة الإبصار (VA)', unit: '6/6', placeholder: '6/6' },
    ],
  },
  {
    id: 'dermatology',
    name: 'جلدية وتجميل',
    description: 'الوزن، ضغط الدم، والنبض',
    activeKeys: ['weight', 'blood_pressure', 'heart_rate'],
    enableRefraction: false,
    customVitals: [],
  },
];

/**
 * Default empty/fallback vitals configuration.
 */
export const DEFAULT_VITALS_CONFIG = {
  enabled_keys: ['blood_pressure', 'heart_rate', 'temperature', 'blood_glucose', 'weight', 'height', 'oxygen_saturation'],
  enable_refraction: false,
  custom_vitals: [],
};
