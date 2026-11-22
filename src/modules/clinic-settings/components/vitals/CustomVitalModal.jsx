import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';

export default function CustomVitalModal({ isOpen, onClose, onAdd }) {
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('يرجى إدخال اسم العلامة الحيوية.');
      return;
    }
    // Generate snake_case key
    const rawKey = label.trim().toLowerCase().replace(/[\s\W-]+/g, '_');
    const key = `custom_${rawKey || Date.now()}`;

    onAdd({
      key,
      label: label.trim(),
      unit: unit.trim(),
      placeholder: placeholder.trim() || '—',
    });

    setLabel('');
    setUnit('');
    setPlaceholder('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Plus className="h-4 w-4 text-clinic-600" />
            <span>إضافة علامة حيوية مخصصة للعيادة</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم العلامة الحيوية (مثال: محيط الخصر، نسبة الكوليسترول): *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (error) setError(null);
              }}
              placeholder="مثال: محيط الرأس"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-clinic-500 focus:outline-hidden"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                وحدة القياس (Unit):
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="مثال: cm أو mg/dL"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-clinic-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                القيمة التوضيحية:
              </label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="مثال: 35"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-clinic-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <Button type="submit" className="text-xs font-bold">
              إضافة العلامة
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
