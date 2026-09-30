import React, { useState } from 'react';
import { X, UserPlus, Phone, User, Calendar, AlertCircle, HeartPulse, ShieldAlert } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function QuickPatientDrawer({ isOpen, onClose, onRegisterPatient, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'male',
    blood_group: '',
    allergies: '',
    chronic_diseases: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'اسم المريض مطلوب';
    if (!formData.phone.trim()) errs.phone = 'رقم الهاتف مطلوب';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onRegisterPatient({
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-all duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-clinic-600/10 text-clinic-600 flex items-center justify-center font-bold">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">تسجيل مريض جديد (سريع)</h2>
              <p className="text-xs text-slate-500">بدء جلسة كشف فورية للمريض</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              اسم المريض الكامل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: أحمد محمد علي"
                className={`w-full pr-10 pl-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none transition-all ${
                  errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                className={`w-full pr-10 pl-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none transition-all ${
                  errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">العمر (بالسنوات)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="35"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">النوع</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none bg-white"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">فصيلة الدم</label>
            <select
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none bg-white"
            >
              <option value="">غير محددة</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              حساسية الأدوية (Allergies)
            </label>
            <textarea
              rows={2}
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="مثال: حساسية البنسلين، الأسبرين..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              الأمراض المزمنة
            </label>
            <textarea
              rows={2}
              value={formData.chronic_diseases}
              onChange={(e) => setFormData({ ...formData, chronic_diseases: e.target.value })}
              placeholder="مثال: السكري، ضغط الدم، الربو..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              تسجيل وبدء الكشف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
