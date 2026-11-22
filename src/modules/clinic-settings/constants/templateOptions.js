import {
  Heart,
  Stethoscope,
  Eye,
  Baby,
  Activity,
  Sparkles,
  FileText,
  Image as ImageIcon,
  HeartPulse,
  QrCode,
  Contrast,
  Printer,
  Glasses,
} from 'lucide-react';

/**
 * Prescription printing mode options.
 */
export const PRESCRIPTION_MODES = [
  {
    id: 'builtin',
    title: 'Digital Built-in Template',
    badge: 'Standard Integrated Layout',
    desc: 'The system renders the complete prescription: clinical letterhead, patient information, vital signs, medication table, and footer.',
    icon: Sparkles,
    accent: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    ring: 'ring-2 ring-emerald-500',
  },
  {
    id: 'letterhead',
    title: 'Preprinted Letterhead Stationery',
    badge: 'Offset Clinic Paper',
    desc: 'Digital header and footer are hidden. The system prints strictly patient demographics, clinical vitals, and medication lines inside physical paper margins.',
    icon: FileText,
    accent: 'border-blue-500 bg-blue-50/50 text-blue-900',
    ring: 'ring-2 ring-blue-500',
  },
  {
    id: 'custom_image',
    title: 'Custom Stationery Image Background',
    badge: 'Custom Graphic Design',
    desc: 'Upload your clinic custom letterhead image (PNG / JPG / WebP) to serve as physical stationery background with medications printed above it.',
    icon: ImageIcon,
    accent: 'border-purple-500 bg-purple-50/50 text-purple-900',
    ring: 'ring-2 ring-purple-500',
  },
];

/**
 * Built-in clinical specialty templates.
 */
export const BUILTIN_TEMPLATES = [
  {
    id: 'egyptian_clinic',
    title: 'Standard Clinic Template',
    desc: 'Clean medical design featuring physician degrees, clinic logo, demographic header bar, and bilingual Rx instructions.',
    icon: Heart,
    accent: 'border-red-300 bg-red-50/40',
    badge: 'Standard Clinic Format',
  },
  {
    id: 'internal_medicine',
    title: 'Internal Medicine & Cardiology',
    desc: 'Clinical layout featuring prominent vital signs summary (BP, Pulse, RBS, Weight) and structured diagnosis block.',
    icon: Stethoscope,
    accent: 'border-sky-300 bg-sky-50/40',
    badge: 'Vitals & Chronic Disease',
  },
  {
    id: 'ophthalmology',
    title: 'Ophthalmology & Optical Care',
    desc: 'Includes standard eye examination table with bilateral OD/OS sphere, cylinder, axis, VA, IOP, and pupillary distance.',
    icon: Eye,
    accent: 'border-teal-300 bg-teal-50/40',
    badge: 'Refraction Table Included',
  },
  {
    id: 'pediatrics',
    title: 'Pediatrics & Neonatology',
    desc: 'Optimized for weight-based dosing (mg/kg) with basic pediatric growth metrics (height, weight, head circumference).',
    icon: Baby,
    accent: 'border-amber-300 bg-amber-50/40',
    badge: 'Pediatric Growth & Dosing',
  },
  {
    id: 'dermatology',
    title: 'Dermatology & Cosmetology',
    desc: 'Specialized layout with detailed instructions for topical applications, session intervals, and skincare regimens.',
    icon: Activity,
    accent: 'border-purple-300 bg-purple-50/40',
    badge: 'Aesthetic & Topical Care',
  },
];

/**
 * Clinical display toggle switches.
 */
export const CLINICAL_TOGGLES = [
  {
    key: 'show_diagnosis',
    label: 'Clinical Diagnosis Section',
    desc: 'Display primary and secondary clinical findings below patient information.',
    icon: FileText,
  },
  {
    key: 'show_vitals',
    label: 'Vital Signs Bar',
    desc: 'Display doctor enabled vitals (BP, Heart Rate, RBS, Weight, Temp) from clinic settings.',
    icon: HeartPulse,
  },
  {
    key: 'show_refraction',
    label: 'OD/OS Eye Refraction Card',
    desc: 'Include the standard clinical eye examination table (SPH, CYL, AXIS, VA, IOP, PD, ADD).',
    icon: Glasses,
  },
  {
    key: 'show_qr',
    label: 'Security QR Code Verification',
    desc: 'Print encrypted QR code for electronic prescription authenticity and pharmacy verification.',
    icon: QrCode,
  },
  {
    key: 'show_rx_code',
    label: 'Prescription Serial Number (Rx#)',
    desc: 'Display unique encounter serial code (e.g. RX-2026-0012) for clinical tracking.',
    icon: Sparkles,
  },
  {
    key: 'laser_contrast_opt',
    label: 'High-Contrast Monochrome Laser Optimization',
    desc: 'Optimize ink density to pure deep black for crystal-clear readability on all laser printers.',
    icon: Contrast,
  },
  {
    key: 'auto_print',
    label: 'Instant Auto-Print Dialog',
    desc: 'Automatically open browser print dialog upon completing clinical consultation.',
    icon: Printer,
  },
];
