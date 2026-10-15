import React, { useRef } from 'react';
import {
  Layers,
  Heart,
  Eye,
  Sparkles,
  Baby,
  Upload,
  Check,
  Image as ImageIcon,
  Palette,
  FileCheck,
  Building,
  Phone,
  MapPin,
  Trash2,
} from 'lucide-react';
import { fileToBase64 } from '../api/prescriptionSettingsApi';

const COLOR_PRESETS = [
  { name: 'Sky Clinic', hex: '#0284c7' },
  { name: 'Medical Emerald', hex: '#059669' },
  { name: 'Royal Navy', hex: '#0f172a' },
  { name: 'Indigo Health', hex: '#4f46e5' },
  { name: 'Teal Care', hex: '#0d9488' },
  { name: 'Ruby Wine', hex: '#be123c' },
];

/**
 * PrescriptionTemplateGallery — Visual gallery for choosing between:
 * 1. Pre-printed Pad (Letterhead mode)
 * 2. 4 Specialty Built-in Vector Templates
 * 3. Custom Uploaded Background Image
 * Includes color theme picker, custom image uploader, and clinic branding fields.
 */
export default function PrescriptionTemplateGallery({
  values = {},
  onChange,
}) {
  const fileInputRef = useRef(null);

  const currentMode = values.mode || 'builtin';
  const currentTemplateId = values.template_id || 'internal_medicine';
  const currentColor = values.primary_color || '#0284c7';

  const setMode = (mode) => {
    onChange?.({ ...values, mode });
  };

  const setTemplateId = (templateId) => {
    onChange?.({ ...values, mode: 'builtin', template_id: templateId });
  };

  const setColor = (hex) => {
    onChange?.({ ...values, primary_color: hex });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Url = await fileToBase64(file);
      onChange?.({
        ...values,
        mode: 'custom_image',
        custom_bg_image_url: base64Url,
      });
    } catch (err) {
      console.error('Failed to load image:', err);
      alert('فشل تحميل الصورة، يرجى اختيار ملف PNG أو JPG صالح.');
    }
  };

  const handleRemoveCustomImage = () => {
    onChange?.({
      ...values,
      custom_bg_image_url: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const builtinTemplates = [
    {
      id: 'internal_medicine',
      title: 'أمراض الباطنة والقلب (Internal Medicine)',
      desc: 'تصميم رصين مع شريط بارز للعلامات الحيوية (الضغط، النبض، السكر، الوزن) وجدول التشخيص.',
      icon: Heart,
      accent: 'border-sky-300 bg-sky-50/40',
      badge: 'القلب والباطنة',
    },
    {
      id: 'ophthalmology',
      title: 'طب وجراحة العيون (Ophthalmology)',
      desc: 'جدول انكسار بصري وقياسات النظر (OD / OS: SPH, CYL, AXIS, VA) مع قسم مخصص لقطرات العيون.',
      icon: Eye,
      accent: 'border-blue-300 bg-blue-50/40',
      badge: 'العيون والبصريات',
    },
    {
      id: 'dermatology',
      title: 'الجلدية والتجميل (Dermatology)',
      desc: 'تصميم عصري بسيط مع تقسيم روتين الصباح والمساء وملاحظات جلسات الليزر والعناية بالبشرة.',
      icon: Sparkles,
      accent: 'border-amber-300 bg-amber-50/40',
      badge: 'الجلدية والتجميل',
    },
    {
      id: 'pediatrics',
      title: 'الأطفال وحديثي الولادة (Pediatrics)',
      desc: 'عناصر ودودة مع تركيز دقيق على وزن الطفل بالكيلوجرام، الطول، ومحيط الرأس، وإرشادات الجرعات.',
      icon: Baby,
      accent: 'border-emerald-300 bg-emerald-50/40',
      badge: 'طب الأطفال',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6" dir="rtl">
      <div>
        <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
          <Layers className="h-4 w-4 text-clinic-600" />
          <span>اختر وضع وقالب الطباعة (Prescription Template & Layout Mode)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1 m-0">
          حدد ما إذا كنت تطبع على ورق مسبق الطباعة، أو تفضل أحد قوالبنا المتخصصة الأربعة، أو تود رفع تصميم خاص.
        </p>
      </div>

      {/* 3 Top-Level Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode 1: Pre-printed Letterhead Pad */}
        <div
          onClick={() => setMode('letterhead')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            currentMode === 'letterhead'
              ? 'border-clinic-600 bg-clinic-50/40 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2.5 rounded-xl ${
                  currentMode === 'letterhead'
                    ? 'bg-clinic-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <FileCheck className="h-5 w-5" />
              </div>
              {currentMode === 'letterhead' && (
                <span className="text-xs font-bold text-clinic-700 bg-clinic-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> نشط
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 m-0">ورق مطبوع مسبقاً (Pre-printed Pad)</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed m-0">
              للعيادات التي تمتلك دفاتر روشتات مطبوعة ورقياً. يقوم النظام بحساب الهوامش العلوية والسفلية لمنع تداخل النصوص.
            </p>
          </div>
          <span className="text-[11px] font-bold text-clinic-600 mt-4 block">
            نظام الهوامش المتكررة (Repeating Table) ✓
          </span>
        </div>

        {/* Mode 2: Built-in Specialty Templates */}
        <div
          onClick={() => setMode('builtin')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            currentMode === 'builtin'
              ? 'border-clinic-600 bg-clinic-50/40 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2.5 rounded-xl ${
                  currentMode === 'builtin'
                    ? 'bg-clinic-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Layers className="h-5 w-5" />
              </div>
              {currentMode === 'builtin' && (
                <span className="text-xs font-bold text-clinic-700 bg-clinic-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> نشط
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 m-0">4 قوالب مدمجة (4 Built-in Templates)</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed m-0">
              قوالب فيكتور رقمية متكاملة مصممة لكل تخصص (باطنة، عيون، جلدية، أطفال) جاهزة للطباعة على ورق أبيض فارغ.
            </p>
          </div>
          <span className="text-[11px] font-bold text-clinic-600 mt-4 block">
            فيكتور عالي النقاء 300DPI ✓
          </span>
        </div>

        {/* Mode 3: Custom Background Image */}
        <div
          onClick={() => setMode('custom_image')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            currentMode === 'custom_image'
              ? 'border-clinic-600 bg-clinic-50/40 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2.5 rounded-xl ${
                  currentMode === 'custom_image'
                    ? 'bg-clinic-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ImageIcon className="h-5 w-5" />
              </div>
              {currentMode === 'custom_image' && (
                <span className="text-xs font-bold text-clinic-700 bg-clinic-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> نشط
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 m-0">صورة خلفية مخصصة (Custom Image)</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed m-0">
              قم برفع تصميم ورقة العيادة الخاصة بك بصيغة صورة، وسيقوم المحرك بالطباعة الرقمية بدقة فوقها.
            </p>
          </div>
          <span className="text-[11px] font-bold text-clinic-600 mt-4 block">
            دعم الفلتر الليزري المحسن ✓
          </span>
        </div>
      </div>

      {/* BUILT-IN TEMPLATES SELECTOR (Visible when mode is 'builtin') */}
      {currentMode === 'builtin' && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="text-xs font-bold text-slate-700 block">
            اختر القالب الطبي المتخصص:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {builtinTemplates.map((t) => {
              const Icon = t.icon;
              const isSelected = currentTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-clinic-600 bg-clinic-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected
                        ? 'bg-clinic-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900 m-0">{t.title}</h5>
                      <span className="text-[10px] font-bold text-clinic-700 bg-clinic-100/80 px-2 py-0.5 rounded">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 m-0 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CUSTOM IMAGE UPLOADER (Visible when mode is 'custom_image') */}
      {currentMode === 'custom_image' && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="text-xs font-bold text-slate-700 block">
            صورة تصميم الروشتة الخلفية (PNG / JPG / WEBP):
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {values.custom_bg_image_url ? (
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <img
                src={values.custom_bg_image_url}
                alt="Prescription Template Preview"
                className="w-20 h-28 object-contain rounded-lg border border-slate-300 bg-white shadow-xs"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-800 block">تم رفع الصورة بنجاح ✓</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  سيتم تطبيق هذه الصورة كخلفية لجميع الروشتات الصادرة.
                </span>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    استبدال الصورة
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCustomImage}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-clinic-500 rounded-2xl p-8 text-center bg-slate-50 hover:bg-clinic-50/20 transition-all cursor-pointer"
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-800 block">
                اضغط هنا لاختيار صورة الروشتة من جهازك
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                يفضل مقاس A5 بدقة 1200x1700 بكسل أو أعلى بجودة واضحة
              </span>
            </div>
          )}
        </div>
      )}

      {/* ACCENT COLOR PICKER */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-clinic-600" />
          <span>اللون الرئيسي لشعار وعناصر الروشتة (Theme Color):</span>
        </label>

        <div className="flex items-center gap-2.5 flex-wrap">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setColor(preset.hex)}
                className={`h-8 px-3 rounded-xl flex items-center gap-2 text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-800 ring-2 ring-slate-800/20 shadow-xs scale-105'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: preset.hex }}
                />
                <span className="text-slate-700">{preset.name}</span>
              </button>
            );
          })}

          {/* Custom Hex Color Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              title="Pick custom color"
            />
            <span className="text-xs font-mono font-bold text-slate-600">{currentColor}</span>
          </div>
        </div>
      </div>

      {/* CLINIC & DOCTOR BRANDING DETAILS */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <label className="text-xs font-bold text-slate-700 block">
          بيانات العيادة والطبيب المطبوعة (Clinic & Doctor Branding):
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Building className="h-3 w-3 text-slate-400" />
              <span>اسم العيادة / المركز الطبي:</span>
            </label>
            <input
              type="text"
              value={values.clinic_name || ''}
              onChange={(e) => onChange?.({ ...values, clinic_name: e.target.value })}
              placeholder="عيادة النور التخصصية"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-clinic-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              اسم الطبيب المعالج:
            </label>
            <input
              type="text"
              value={values.doctor_name || ''}
              onChange={(e) => onChange?.({ ...values, doctor_name: e.target.value })}
              placeholder="د. محمد أحمد"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-clinic-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              اللقب والتخصص العلمي:
            </label>
            <input
              type="text"
              value={values.doctor_title || ''}
              onChange={(e) => onChange?.({ ...values, doctor_title: e.target.value })}
              placeholder="استشاري الأمراض الباطنة والقلب"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-clinic-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="h-3 w-3 text-slate-400" />
              <span>أرقام الهواتف والتواصل:</span>
            </label>
            <input
              type="text"
              value={values.clinic_phone || ''}
              onChange={(e) => onChange?.({ ...values, clinic_phone: e.target.value })}
              placeholder="01012345678 - 0223456789"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-clinic-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span>عنوان العيادة ومقر الكشف:</span>
            </label>
            <input
              type="text"
              value={values.clinic_address || ''}
              onChange={(e) => onChange?.({ ...values, clinic_address: e.target.value })}
              placeholder="شارع التحرير، برج الأطباء، الدور الرابع"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-clinic-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
