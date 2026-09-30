import React from 'react';
import { X, Calendar, Clock, CheckCircle2, User, Printer, FileText, Banknote, RefreshCw } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function TodayEncountersDrawer({
  isOpen,
  onClose,
  summaryData,
  isLoading = false,
  onResumeEncounter,
  onPrintPrescription,
  onPrintInvoice,
  onRefresh,
}) {
  if (!isOpen) return null;

  const encounters = summaryData?.encounters || [];
  const totalEncounters = summaryData?.total_encounters || 0;
  const completedCount = summaryData?.completed_count || 0;
  const inProgressCount = summaryData?.in_progress_count || 0;
  const totalRevenue = summaryData?.total_revenue || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-all duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-clinic-600/10 text-clinic-600 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">سجل كشوفات اليوم</h2>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              className="text-slate-400 hover:text-clinic-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3.5 bg-slate-50 border-b border-slate-200/70 text-center">
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-slate-400 font-semibold">إجمالي الكشوفات</p>
            <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{totalEncounters}</p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-emerald-600 font-semibold">المكتملة</p>
            <p className="text-sm font-bold text-emerald-700 font-mono mt-0.5">{completedCount}</p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-amber-600 font-semibold">جارية (مسودة)</p>
            <p className="text-sm font-bold text-amber-700 font-mono mt-0.5">{inProgressCount}</p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <p className="text-[10px] text-clinic-600 font-semibold">المحصل اليوم</p>
            <p className="text-sm font-bold text-clinic-700 font-mono mt-0.5">{totalRevenue} ج.م</p>
          </div>
        </div>

        {/* Encounters List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {encounters.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Calendar className="h-12 w-12 text-slate-200 mb-3 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">لا توجد كشوفات مسجلة اليوم حتى الآن</p>
              <p className="text-xs text-slate-400 mt-1">
                ابدأ تسجيل مريض جديد أو اختر مريضاً من البحث لبدء جلسة كشف
              </p>
            </div>
          ) : (
            encounters.map((enc) => {
              const isCompleted = enc.status === 'completed';
              const timeStr = enc.created_at
                ? new Date(enc.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={enc.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
                      : 'bg-amber-50/40 border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {enc.patient?.name || 'مريض بدون اسم'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>{enc.patient?.medical_number}</span>
                          <span>•</span>
                          <span>{enc.patient?.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isCompleted ? 'مكتمل' : 'قيد الفحص'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeStr}
                      </span>
                    </div>
                  </div>

                  {enc.chief_complaint && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl mb-3 line-clamp-1 border border-slate-100">
                      <span className="font-semibold text-slate-700">الشكوى:</span> {enc.chief_complaint}
                    </p>
                  )}

                  {/* Actions & Print Options */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-xs font-bold font-mono text-slate-700">
                      {enc.invoice?.total ? `${enc.invoice.total} ج.م` : 'بدون فاتورة'}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isCompleted && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onResumeEncounter(enc)}
                          className="text-xs py-1 px-3"
                        >
                          استئناف الكشف
                        </Button>
                      )}

                      {isCompleted && (
                        <>
                          {enc.prescription && (
                            <button
                              onClick={() => onPrintPrescription(enc)}
                              className="p-1.5 text-slate-600 hover:text-clinic-600 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                              title="طباعة الروشتة"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline text-[11px]">الروشتة</span>
                            </button>
                          )}

                          {enc.invoice && (
                            <button
                              onClick={() => onPrintInvoice(enc)}
                              className="p-1.5 text-slate-600 hover:text-clinic-600 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                              title="طباعة إيصال الدفع"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline text-[11px]">الإيصال</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
