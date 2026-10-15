import React from 'react';
import { Printer, Check, X, Stethoscope, AlertCircle } from 'lucide-react';
import { Dialog } from '../../../components/ui/Dialog';
import Button from '../../../components/ui/Button';

/**
 * CompleteExaminationModal — Confirmation modal presented to the doctor
 * when completing an examination, allowing them to choose whether to:
 * 1. Save and print the prescription immediately.
 * 2. Save without printing.
 * 3. Cancel and return to consultation.
 */
export default function CompleteExaminationModal({
  isOpen,
  onClose,
  onSaveAndPrint,
  onSaveOnly,
  isLoading = false,
  patientName = '',
  medicationsCount = 0,
}) {
  return (
    <Dialog isOpen={isOpen} onClose={isLoading ? undefined : onClose}>
      <div className="text-right" dir="rtl">
        {/* Header with Doctor/Clinical Emblem */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                إنهاء الكشف واعتماد الروشتة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 m-0 font-medium">
                تأكيد حفظ بيانات الزيارة واختيار أمر الطباعة
              </p>
            </div>
          </div>

          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4">
          {/* Patient & Rx Summary Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">المريض:</span>
              <strong className="text-slate-900 font-bold text-sm">
                {patientName || 'المريض الحالي'}
              </strong>
            </div>
            <div className="text-left" dir="ltr">
              <span className="text-slate-400 font-semibold block text-[11px]">الأدوية الموصوفة:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-clinic-50 text-clinic-700 border border-clinic-200">
                {medicationsCount} {medicationsCount === 1 ? 'صنف دواء' : 'أصناف أدوية'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed m-0 font-medium">
            هل ترغب في حفظ الكشف وإرسال الروشتة للطباعة فوراً، أم حفظ الكشف فقط في سجل المريض دون طباعة؟
          </p>

          {medicationsCount === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>تنبيه: لم يتم إضافة أي أدوية في الروشتة الحالية.</span>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
          {/* Action 1: Save & Print Rx */}
          <Button
            type="button"
            variant="default"
            size="md"
            onClick={onSaveAndPrint}
            isLoading={isLoading}
            loadingText="جارٍ الحفظ والطباعة..."
            leftIcon={<Printer className="h-4 w-4" />}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm justify-center shadow-xs"
          >
            <span>حفظ وطباعة الروشتة فوراً (Save & Print Rx)</span>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Action 2: Save Only */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onSaveOnly}
              disabled={isLoading}
              leftIcon={<Check className="h-4 w-4 text-slate-600" />}
              className="w-full border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold py-2.5 text-xs justify-center"
            >
              <span>حفظ فقط بدون طباعة</span>
            </Button>

            {/* Action 3: Cancel */}
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isLoading}
              className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold py-2.5 text-xs justify-center"
            >
              <span>إلغاء والعودة للكشف</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
