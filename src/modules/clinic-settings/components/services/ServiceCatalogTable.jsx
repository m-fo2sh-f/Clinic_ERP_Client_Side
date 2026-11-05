import React from 'react';
import { Search, Plus, Edit3, Trash2, Receipt } from 'lucide-react';
import Button from '../../../../components/ui/Button';

export default function ServiceCatalogTable({
  services = [],
  searchQuery = '',
  onSearchChange,
  onAddNew,
  onEdit,
  onDelete,
  isReadOnly = false,
  isDeleting = false,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
      {/* Table Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث عن خدمة باسمها أو الكود..."
            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
          />
        </div>

        {!isReadOnly && (
          <Button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-2 text-xs font-bold shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة خدمة جديدة</span>
          </Button>
        )}
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold">
              <th className="py-3 px-4">كود الخدمة</th>
              <th className="py-3 px-4">اسم الخدمة الطبية</th>
              <th className="py-3 px-4">السعر (ج.م)</th>
              {!isReadOnly && <th className="py-3 px-4 text-left">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.length === 0 ? (
              <tr>
                <td colSpan={isReadOnly ? 3 : 4} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Receipt className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-semibold m-0">
                      {searchQuery ? 'لا توجد خدمات مطابقة لبحثك' : 'لا توجد خدمات مسجلة في هذا الفرع حتى الآن'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              services.map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                    {svc.code || '—'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {svc.name}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {Number(svc.price).toLocaleString('ar-EG')} ج.م
                  </td>
                  {!isReadOnly && (
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(svc)}
                          className="p-1.5 text-slate-500 hover:text-clinic-600 hover:bg-clinic-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل السعر والبيانات"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => onDelete(svc.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="حذف الخدمة"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
