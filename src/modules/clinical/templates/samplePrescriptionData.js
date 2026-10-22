/**
 * Default sample dummy data for visual calibrator and test prints
 */
export const SAMPLE_PRESCRIPTION_DATA = {
  patient: {
    id: 101,
    name: 'أحمد محمود إبراهيم',
    full_name: 'أحمد محمود إبراهيم',
    age: '38 سنة',
    gender: 'male',
    phone: '01098765432',
  },
  encounter: {
    id: 501,
    serial_no: 'RX-2026-9841',
    prescription_code: 'RX-2026-9841',
  },
  vitals: {
    bloodPressure: '125/80',
    blood_pressure: '125/80',
    heartRate: '74',
    heart_rate: '74',
    temperature: '37.1',
    weight: '78',
    height: '175',
    spo2: '99',
    randomBloodSugar: '110',
    blood_sugar: '110',
  },
  diagnoses: ['ارتفاع ضغط الدم الأولي (Primary HTN)', 'عسر هضم وظيفي (Functional Dyspepsia)'],
  medications: [
    {
      id: 1,
      name: 'Xoraxone 1gm Vial',
      drug_name: 'Xoraxone 1gm Vial',
      dosage: 'حقنة عضل كاملة كل 24 ساعة لمدة 5 أيام',
    },
    {
      id: 2,
      name: 'Zithrokan 500mg Caps',
      drug_name: 'Zithrokan 500mg Caps',
      dosage: 'كبسولة على الريق صباحاً والصيام بعدها لمدة ساعة ونصف',
    },
    {
      id: 3,
      name: 'Panadol Extra Tablets',
      drug_name: 'Panadol Extra Tablets',
      dosage: 'قرص كل 8 ساعات لمدة أسبوع بعد الأكل',
    },
    {
      id: 4,
      name: 'Flamifast 50mg Tab',
      drug_name: 'Flamifast 50mg Tab',
      dosage: 'قرص بعد الإفطار والعشاء',
    },
  ],
  advice: 'الالتزام بحمية غذائية قليلة الملح والدهون، الإكثار من شرب الماء والمشي 30 دقيقة يومياً، وتجنب المنبهات والمسكنات بدون استشارة.',
  followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};
