import React from 'react';
import { Pill, Printer, Plus, Trash2, FileCheck, Loader2, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

/**
 * PrescriptionSheet — digital Rx table with add/remove medication rows,
 * general advice, follow-up date picker & presets, print, and Complete Examination actions.
 *
 * @param {Object}   props
 * @param {string}   props.branchName            – Branch name for Rx header
 * @param {Array}    props.medications            – Array of medication objects
 * @param {Function} props.onAddMedication        – Add empty medication row
 * @param {Function} props.onUpdateMedication     – (id, field, value) => void
 * @param {Function} props.onRemoveMedication     – (id) => void
 * @param {string}   props.generalAdvice          – General advice text
 * @param {Function} props.onGeneralAdviceChange  – (value) => void
 * @param {string}   props.followUpDate           – ISO date string
 * @param {Function} props.onFollowUpDateChange   – (value) => void
 * @param {boolean}  props.isPrescriptionSaved    – Whether the Rx has been saved
 * @param {boolean}  props.isSubmitting           – Whether the API call is in progress
 * @param {Function} props.onCompleteExamination  – Save / complete action
 */
export default function PrescriptionSheet({
  branchName,
  medications,
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
  generalAdvice,
  onGeneralAdviceChange,
  followUpDate,
  onFollowUpDateChange,
  isPrescriptionSaved,
  isSubmitting,
  onCompleteExamination,
}) {
  const handlePrint = () => window.print();

  /**
   * Helper to set quick preset follow-up dates (e.g. +7, +14, +30 days)
   */
  const handleQuickFollowUp = (days) => {
    if (days === 0) {
      onFollowUpDateChange('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    onFollowUpDateChange(dateStr);
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
          <Pill className="h-5 w-5 text-clinic-600" /> الروشتة الطبية الرقمية (Digital Prescription Sheet)
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5"
        >
          <Printer className="h-4 w-4" /> طباعة الروشتة
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Printable Rx area */}
        <div
          id="printable-rx-sheet"
          className="bg-white border-2 border-slate-200 rounded-2xl p-8 space-y-6"
        >
          {/* Rx header */}
          <div className="border-b-2 border-clinic-600 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-clinic-800 m-0">
                {branchName}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 m-0">
                الروشتة الطبية المعتمدة
              </p>
            </div>
            <div className="text-right text-3xl font-black text-clinic-600">
              Rx
            </div>
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-700 m-0">
                الأدوية والعلاجات الموصوفة (Prescribed Medications)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMedication}
                className="no-print text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> إضافة دواء
              </Button>
            </div>

            {medications.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2 m-0">
                لم يتم إضافة أدوية بعد. اضغط &quot;إضافة دواء&quot; لبدء كتابة الروشتة.
              </p>
            )}

            {medications.map((med) => (
              <div
                key={med.id}
                className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-start"
              >
                <input
                  className="sm:col-span-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                  value={med.name}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'name', e.target.value)
                  }
                  placeholder="اسم الدواء"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.dosage}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'dosage', e.target.value)
                  }
                  placeholder="الجرعة (Dose)"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.frequency}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'frequency', e.target.value)
                  }
                  placeholder="التكرار (Frequency)"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.duration}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'duration', e.target.value)
                  }
                  placeholder="المدة (Duration)"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.instructions}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'instructions', e.target.value)
                  }
                  placeholder="التعليمات (Instructions)"
                />
                <button
                  onClick={() => onRemoveMedication(med.id)}
                  className="no-print text-red-500 hover:text-red-700 transition-colors self-center p-1.5 cursor-pointer"
                  title="حذف السطر"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* General Advice */}
          <div className="pt-4 border-t space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700 m-0">
              نصائح وإرشادات الطبيب (General Advice)
            </label>
            <textarea
              rows={2}
              value={generalAdvice}
              onChange={(e) => onGeneralAdviceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500 no-print"
              placeholder="مثال: الراحة التامة وتناول السوائل الدافئة..."
            />
            {/* Print-only static version */}
            {generalAdvice && (
              <p className="hidden print:block text-xs text-slate-800 whitespace-pre-wrap m-0">
                {generalAdvice}
              </p>
            )}
          </div>

          {/* Follow-up date with quick presets */}
          <div className="pt-4 border-t space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase text-slate-700 m-0 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-clinic-600 shrink-0" />
                <span>ميعاد الاستشارة والاعادة (Follow-up Date)</span>
              </label>

              {/* Quick preset buttons */}
              <div className="flex items-center gap-1.5 no-print flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickFollowUp(7)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-clinic-50 text-clinic-700 border border-clinic-200 rounded-md hover:bg-clinic-100 transition-colors cursor-pointer"
                >
                  بعد أسبوع (7 أيام)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFollowUp(14)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-clinic-50 text-clinic-700 border border-clinic-200 rounded-md hover:bg-clinic-100 transition-colors cursor-pointer"
                >
                  بعد أسبوعين (14 يوم)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFollowUp(30)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-clinic-50 text-clinic-700 border border-clinic-200 rounded-md hover:bg-clinic-100 transition-colors cursor-pointer"
                >
                  بعد شهر (30 يوم)
                </button>
                {followUpDate && (
                  <button
                    type="button"
                    onClick={() => handleQuickFollowUp(0)}
                    className="px-2 py-1 text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    إلغاء المتابعة
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={followUpDate || ''}
                onChange={(e) => onFollowUpDateChange(e.target.value)}
                className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-clinic-500 cursor-pointer"
              />
              {followUpDate && (
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  ميعاد الإعادة: {new Date(followUpDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Complete Examination CTA */}
        <div className="flex justify-end pt-4 border-t no-print">
          <Button
            variant="default"
            size="md"
            onClick={onCompleteExamination}
            isLoading={isSubmitting}
            loadingText="جاري حفظ الكشف..."
            disabled={isPrescriptionSaved}
            leftIcon={<FileCheck className="h-4 w-4" />}
            className={`px-6 ${
              isPrescriptionSaved
                ? 'bg-emerald-500 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <span>{isPrescriptionSaved ? 'تم إتمام الكشف بنجاح ✓' : 'إتمام وحفظ الكشف والروشتة'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
