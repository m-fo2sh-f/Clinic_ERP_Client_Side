import React, { useState } from 'react';
import { Star, Trash2, Search } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';

/**
 * Interactive list/table of doctor's prescribing catalog.
 */
export default function DoctorDrugTable({
  drugs = [],
  isLoading = false,
  onToggleFavorite,
  onDelete,
}) {
  const [filterTerm, setFilterTerm] = useState('');

  const filteredDrugs = drugs.filter((d) => {
    if (!filterTerm) return true;
    const term = filterTerm.toLowerCase();
    return (
      (d.trade_name || '').toLowerCase().includes(term) ||
      (d.strength || '').toLowerCase().includes(term) ||
      (d.form || '').toLowerCase().includes(term) ||
      (d.active_ingredient || '').toLowerCase().includes(term) ||
      (d.default_dosage || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-3" dir="rtl">
      {/* Search Filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="تصفية الأصناف المسجلة..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinic-500"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          إجمالي أصنافك: <strong className="text-slate-900">{drugs.length}</strong> صنف
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 text-[11px]">
              <th className="p-2.5 w-10 text-center">⭐</th>
              <th className="p-2.5 font-bold">اسم الدواء والشكل والتركيز</th>
              <th className="p-2.5 font-bold">الجرعة المعتادة</th>
              <th className="p-2.5 font-bold">المادة الفعالة</th>
              <th className="p-2.5 font-bold text-center">مرات الوصف</th>
              <th className="p-2.5 font-bold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  جارٍ تحميل قائمتك الدوائية...
                </td>
              </tr>
            ) : filteredDrugs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  لا توجد أدوية مسجلة في جدولك حالياً. يمكنك إضافة صنف جديد من النموذج أعلاه.
                </td>
              </tr>
            ) : (
              filteredDrugs.map((drug) => {
                const isFav = Boolean(drug.is_favorite ?? drug.is_doctor_favorite);
                return (
                  <tr key={drug.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite && onToggleFavorite(drug.id)}
                        className="cursor-pointer text-slate-300 hover:text-amber-500 transition-colors"
                        title={isFav ? 'إلغاء التمييز' : 'تمييز بنجمة'}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            isFav ? 'fill-amber-400 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans font-bold text-slate-900" dir="ltr">
                          {drug.trade_name}
                        </span>
                        {drug.strength && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold" dir="ltr">
                            {drug.strength}
                          </span>
                        )}
                        {drug.form && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-clinic-50 text-clinic-700 border border-clinic-200">
                            {drug.form}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-700 font-medium">
                      {drug.default_dosage || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-2.5 text-slate-500 font-sans text-[11px]" dir="ltr">
                      <div className="text-right truncate max-w-xs">{drug.active_ingredient || '—'}</div>
                    </td>
                    <td className="p-2.5 text-center">
                      <Badge variant={drug.usage_count > 0 ? 'success' : 'secondary'} className="text-[10px] font-mono font-bold">
                        {drug.usage_count} مرة
                      </Badge>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onDelete && onDelete(drug.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                        title="حذف من جدولك"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
