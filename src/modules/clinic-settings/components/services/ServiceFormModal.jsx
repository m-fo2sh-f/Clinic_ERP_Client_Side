import React, { useState, useEffect } from 'react';
import { X, Receipt, Loader2, Save } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { SERVICE_VALIDATION_LIMITS } from '../../constants/servicesConstants';

export default function ServiceFormModal({
  isOpen = false,
  onClose,
  onSave,
  editingService = null,
  isSaving = false,
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingService) {
      setName(editingService.name || '');
      setCode(editingService.code || '');
      setPrice(String(editingService.price || ''));
    } else {
      setName('');
      setCode('');
      setPrice('');
    }
    setErrorMsg('');
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('اسم الخدمة الطبية مطلوب.');
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < SERVICE_VALIDATION_LIMITS.minPrice) {
      setErrorMsg('يرجى إدخال سعر صحيح (0 أو أكثر).');
      return;
    }

    if (numericPrice > SERVICE_VALIDATION_LIMITS.maxPrice) {
      setErrorMsg(`السعر لا يمكن أن يتجاوز ${SERVICE_VALIDATION_LIMITS.maxPrice.toLocaleString()} ج.م.`);
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        code: code.trim() || null,
        price: numericPrice,
      });
    } catch (err) {
      setErrorMsg(err?.message || 'فشل حفظ الخدمة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-clinic-50 text-clinic-600 rounded-lg">
              <Receipt className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 m-0">
              {editingService ? 'تعديل الخدمة الطبية والتسعير' : 'إضافة خدمة طبية جديدة'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم الخدمة الطبية <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              disabled={isSaving}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: كشف عيادة، رسم قلب فوري، سونار بطن..."
              maxLength={SERVICE_VALIDATION_LIMITS.maxNameLength}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كود الخدمة (اختياري)
              </label>
              <input
                type="text"
                value={code}
                disabled={isSaving}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: SRV-01"
                maxLength={SERVICE_VALIDATION_LIMITS.maxCodeLength}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                السعر (ج.م) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={price}
                disabled={isSaving}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold font-mono text-emerald-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{editingService ? 'تحديث السعر' : 'حفظ الخدمة'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
