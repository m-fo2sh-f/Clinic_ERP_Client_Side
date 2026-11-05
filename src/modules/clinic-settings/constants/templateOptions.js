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
} from 'lucide-react';

/**
 * Prescription printing mode options.
 */
export const PRESCRIPTION_MODES = [
  {
    id: 'builtin',
    title: 'قالب رقمي تخصصي متكامل (Built-in Template)',
    badge: 'الوضع الافتراضي الأكثر شمولاً',
    desc: 'يقوم النظام برسم وطباعة الروشتة بالكامل: الهيدر الطبي، بيانات المريض، العلامات الحيوية، جدول الأدوية، والفوتر.',
    icon: Sparkles,
    accent: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    ring: 'ring-2 ring-emerald-500',
  },
  {
    id: 'letterhead',
    title: 'ورق روشتات مطبوع مسبقاً (Preprinted Letterhead)',
    badge: 'ورق مطبعة أوفست',
    desc: 'يتم حجب الهيدر والفوتر الرقمي؛ ليقوم النظام فقط بطباعة بيانات الكشف والأدوية وجرعاتها داخل هوامش الورق بدقة.',
    icon: FileText,
    accent: 'border-blue-500 bg-blue-50/50 text-blue-900',
    ring: 'ring-2 ring-blue-500',
  },
  {
    id: 'custom_image',
    title: 'خلفية روشتة مخصصة كصورة (Custom Background Image)',
    badge: 'تصميم عيادة جرافيك خاص',
    desc: 'ارفع صورة لتصميم عيادتك الخاص (PNG / JPG) لتُطبع كخلفية رسمية مع طباعة الأدوية فوقها مباشرة بالهوامش المعايرة.',
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
    title: 'النموذج المصري الأصيل (Egyptian Clinic Standard)',
    desc: 'تصميم مطابق للروشتات المصرية الحقيقية: هيدر ثلاثي بالدرجات العلمية واللوجو، شريط مريض متكامل، وأدوية باللغتين.',
    icon: Heart,
    accent: 'border-red-300 bg-red-50/40',
    badge: 'النموذج المصري المعتمد',
  },
  {
    id: 'internal_medicine',
    title: 'أمراض الباطنة والقلب (Internal Medicine)',
    desc: 'تصميم رصين مع شريط بارز للعلامات الحيوية (الضغط، النبض، السكر، الوزن) وجدول التشخيص الطبي الميداني.',
    icon: Stethoscope,
    accent: 'border-sky-300 bg-sky-50/40',
    badge: 'الأكثر استخداماً للباطنة',
  },
  {
    id: 'ophthalmology',
    title: 'طب وجراحة العيون (Ophthalmology & Optical)',
    desc: 'يتضمن كروت قياسات حدة الإبصار وجدول تصحيح النظر للنظارات والعدسات (Sphere, Cylinder, Axis).',
    icon: Eye,
    accent: 'border-teal-300 bg-teal-50/40',
    badge: 'جدول قياس نظر مدمج',
  },
  {
    id: 'pediatrics',
    title: 'طب الأطفال وحديثي الولادة (Pediatrics)',
    desc: 'مُصمم بجرعات معتمدة على وزن الطفل (mg/kg) مع مقاييس النمو الأساسية (الطول، محيط الرأس، الوزن).',
    icon: Baby,
    accent: 'border-amber-300 bg-amber-50/40',
    badge: 'حساب جرعات بالوزن',
  },
  {
    id: 'dermatology',
    title: 'الجلدية والليزر والتجميل (Dermatology)',
    desc: 'تصميم أنيق مع حقول إرشادات تطبيق المراهم الموضعية والجلسات ومستحضرات العناية.',
    icon: Activity,
    accent: 'border-purple-300 bg-purple-50/40',
    badge: 'تصميم ناعم للجلدية',
  },
];

/**
 * Clinical display toggle switches.
 */
export const CLINICAL_TOGGLES = [
  {
    key: 'show_diagnosis',
    label: 'عرض التشخيص الطبي (Diagnosis Section)',
    desc: 'إظهار التشخيص الرئيسي والفرعي في شريط علوي منفصل أسفل بيانات المريض.',
    icon: FileText,
  },
  {
    key: 'show_vitals',
    label: 'عرض العلامات الحيوية (Vitals Bar)',
    desc: 'طباعة الضغط، النبض، السكر، الوزن، ودرجة الحرارة في شريط مدمج.',
    icon: HeartPulse,
  },
  {
    key: 'show_qr',
    label: 'عرض رمز الاستجابة السريع (QR Code Verification)',
    desc: 'طباعة كود QR مشفر للتحقق من صحة الروشتة إلكترونياً ومنع التزوير.',
    icon: QrCode,
  },
  {
    key: 'show_rx_code',
    label: 'عرض كود الروشتة التسلسلي (Rx Serial Number)',
    desc: 'طباعة رقم كود الكشف الفريد (مثل RX-2026-0012) للمتابعة الدوائية بالصيدليات.',
    icon: Sparkles,
  },
  {
    key: 'laser_contrast_opt',
    label: 'تحسين التباين لطابعات الليزر (High-Contrast Monochrome)',
    desc: 'تحويل النصوص للأسود الحبري الفاحم لضمان وضوح الأدوية حتى مع نفاد حبر الطابعة.',
    icon: Contrast,
  },
  {
    key: 'auto_print',
    label: 'الطباعة التلقائية الفورية (Instant Auto-Print)',
    desc: 'فتح نافذة الطباعة فور إنهاء الكشف الطبي دون الحاجة للضغط على زر المعاينة.',
    icon: Printer,
  },
];
