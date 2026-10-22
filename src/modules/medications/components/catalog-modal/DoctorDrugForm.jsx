import React, { useState } from 'react';
import { Plus, Loader2, Pill, Sparkles } from 'lucide-react';
import Button from '../../../../components/ui/Button';

const DOSAGE_FORMS = [
  { id: 'Tablet', label: 'أقراص', sub: 'Tablet' },
  { id: 'Capsule', label: 'كبسولات', sub: 'Capsule' },
  { id: 'Syrup', label: 'شراب', sub: 'Syrup' },
  { id: 'Drops', label: 'قطرة / بخاخ', sub: 'Drops' },
  { id: 'Cream', label: 'كريم / مرهم', sub: 'Cream' },
  { id: 'Injection', label: 'حقن', sub: 'Injection' },
];

/**
 * Form to create or edit a custom drug in doctor's catalog.
 * Strict requirements: trade_name, strength, form, default_dosage.
 */
export default function DoctorDrugForm({ onSubmit, isLoading = false, onCancel }) {
  const [tradeName, setTradeName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState('Tablet');
  const [defaultDosage, setDefaultDosage] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [isFavorite, setIsFavorite] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tradeName.trim() || !strength.trim() || !form.trim() || !defaultDosage.trim()) return;

    onSubmit({
      trade_name: tradeName.trim(),
      strength: strength.trim(),
      form: form.trim(),
      default_dosage: defaultDosage.trim(),
      active_ingredient: activeIngredient.trim() || null,
      is_favorite: isFavorite,
    });

    setTradeName('');
    setStrength('');
    setForm('Tablet');
    setDefaultDosage('');
    setActiveIngredient('');
  };

  const isFormValid = Boolean(
    tradeName.trim() &&
    strength.trim() &&
    form.trim() &&
    defaultDosage.trim()
  );

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Pill className="h-4 w-4 text-clinic-600" />
          <span>إضافة دواء جديد لقائمتك السريرية الخاصة:</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">الحقول المعلمة بـ (*) إجبارية</span>
      </div>

      {/* Row 1: Trade Name & Strength */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            اسم الدواء التجاري: *
          </label>
          <input
            type="text"
            required
            placeholder="مثال: Augmentin أو Concor"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinic-500 font-sans"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            التركيز: *
          </label>
          <input
            type="text"
            required
            placeholder="مثال: 1g أو 500mg أو 5mg"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinic-500 font-sans"
            dir="ltr"
          />
        </div>
      </div>

      {/* Row 2: Dosage Form Selector (Quick Chips) */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
          الشكل الدوائي (لضبط كاشف الجرعات الذكي): *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
          {DOSAGE_FORMS.map((item) => {
            const isSelected = form === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setForm(item.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-clinic-50 border-clinic-600 text-clinic-800 shadow-xs ring-1 ring-clinic-500 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[9px] text-slate-400 font-sans">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Default Dosage & Active Ingredient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            الجرعة الافتراضية المعتادة وطريقة الاستخدام: *
          </label>
          <input
            type="text"
            required
            placeholder="مثال: قرص كل 12 ساعة بعد الأكل لمدة أسبوع"
            value={defaultDosage}
            onChange={(e) => setDefaultDosage(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinic-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            المادة الفعالة / تركيبة خاصة (اختياري):
          </label>
          <input
            type="text"
            placeholder="مثال: Amoxicillin + Clavulanic Acid"
            value={activeIngredient}
            onChange={(e) => setActiveIngredient(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinic-500 font-sans"
            dir="ltr"
          />
        </div>
      </div>

      {/* Row 4: Favorite & Actions */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="rounded text-clinic-600 focus:ring-clinic-500 h-4 w-4"
          />
          <span className="font-medium flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            تمييز بنجمة (المفضلة) لظهوره في مقدمة المقترحات تلقائياً
          </span>
        </label>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              إلغاء
            </Button>
          )}
          <Button type="submit" variant="default" size="sm" disabled={isLoading || !isFormValid}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin ml-1" /> : <Plus className="h-3.5 w-3.5 ml-1" />}
            حفظ الدواء في جدولك الخاص
          </Button>
        </div>
      </div>
    </form>
  );
}
