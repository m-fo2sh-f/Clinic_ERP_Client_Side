import React from 'react';
import {
  FileText,
  Activity,
  QrCode,
  Hash,
  Printer,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';

/**
 * ClinicalTogglesForm — Configuration switches for clinical display elements,
 * laser printer optimization, and auto-print workflows.
 */
export default function ClinicalTogglesForm({
  values = {},
  onChange,
}) {
  const handleToggle = (field) => {
    onChange?.({
      ...values,
      [field]: !values[field],
    });
  };

  const handleSelectPaper = (size) => {
    onChange?.({
      ...values,
      paper_size: size,
    });
  };

  const toggles = [
    {
      key: 'show_diagnosis',
      title: 'إظهار التشخيص الطبي (Clinical Diagnosis)',
      description: 'عرض التشخيص النهائي المعتمد في الروشتة المطبوعة.',
      icon: FileText,
      checked: values.show_diagnosis !== false,
    },
    {
      key: 'show_vitals',
      title: 'إظهار شريط العلامات الحيوية (Vital Signs)',
      description: 'طباعة الضغط، النبض، السكر، الوزن، الطول، والحرارة المسجلة.',
      icon: Activity,
      checked: values.show_vitals !== false,
    },
    {
      key: 'show_qr',
      title: 'رمز التحقق الإلكتروني (Verification QR Code)',
      description: 'طباعة كود QR آمن يربط الروشتة إلكترونياً بملف المريض والتحقق من صحتها.',
      icon: QrCode,
      checked: values.show_qr !== false,
    },
    {
      key: 'show_serial',
      title: 'الرقم التسلسلي للروشتة (Serial / RX Code)',
      description: 'طباعة كود تعريفي موحد للروشتة للرجوع إليها في الأرشيف الطبي.',
      icon: Hash,
      checked: values.show_serial !== false,
    },
    {
      key: 'laser_contrast_opt',
      title: 'تحسين التباين لطابعات الليزر (Laser Printer Filter)',
      description: 'تطبيق فلتر زيادة الحدة والتباين (Contrast 1.06 / Brightness 1.03) للنصوص والخطوط الدقيقة.',
      icon: Sparkles,
      checked: Boolean(values.laser_contrast_opt),
    },
    {
      key: 'grayscale_mode',
      title: 'الطباعة أحادية اللون (Grayscale / Monochrome)',
      description: 'تحويل كافة الألوان والشعارات إلى درجات الرمادي والأسود للطابعات الليزرية غير الملونة.',
      icon: Printer,
      checked: Boolean(values.grayscale_mode),
    },
    {
      key: 'auto_print',
      title: 'الطباعة التلقائية فور إنهاء الفحص (Auto-Print on Complete)',
      description: 'فتح نافذة الطباعة فوراً وبشكل تلقائي بمجرد قيام الطبيب بالضغط على إنهاء الفحص وحفظ الروشتة.',
      icon: Zap,
      checked: Boolean(values.auto_print),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6" dir="rtl">
      <div>
        <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
          <Printer className="h-4 w-4 text-clinic-600" />
          <span>خيارات العرض والطباعة المتقدمة (Printing & Clinical Options)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1 m-0">
          تخصيص العناصر الطبية التي تظهر على الروشتة وتفعيل مزايا تحسين طابعات الليزر والطباعة التلقائية.
        </p>
      </div>

      {/* Paper Size Selector */}
      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-800 block">حجم الورقة المعتمد للطباعة (Paper Size):</span>
          <span className="text-[11px] text-slate-500">
            مقاس A5 هو المعيار الطبي الشائع لدفاتر الروشتات، ومقاس A4 يناسب التقارير الطبية الكاملة.
          </span>
        </div>

        <div className="flex items-center gap-2" dir="ltr">
          <button
            type="button"
            onClick={() => handleSelectPaper('A5')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              values.paper_size !== 'A4'
                ? 'bg-clinic-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {values.paper_size !== 'A4' && <Check className="h-3.5 w-3.5" />}
            <span>A5 (148 x 210 mm) - موصى به</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPaper('A4')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              values.paper_size === 'A4'
                ? 'bg-clinic-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {values.paper_size === 'A4' && <Check className="h-3.5 w-3.5" />}
            <span>A4 (210 x 297 mm)</span>
          </button>
        </div>
      </div>

      {/* Grid of Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toggles.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                item.checked
                  ? 'bg-clinic-50/40 border-clinic-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    item.checked
                      ? 'bg-clinic-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 m-0">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 m-0 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Native-style iOS switch */}
              <div
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  item.checked ? 'bg-clinic-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    item.checked ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
