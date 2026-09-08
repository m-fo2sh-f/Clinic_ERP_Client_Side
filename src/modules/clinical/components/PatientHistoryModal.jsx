import React, { useState } from 'react';
import {
  FileText,
  Pill,
  Clock,
  Calendar,
  User,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Wind,
  Droplet,
  X,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

/**
 * PatientHistoryModal — comprehensive view of patient's past medical visits,
 * examinations, vitals, diagnoses, and digital prescriptions.
 *
 * @param {Object}   props
 * @param {boolean}  props.isOpen          – Whether modal is open
 * @param {Function} props.onClose         – Close modal handler
 * @param {Object}   props.patientHistory  – Enriched patient object with past appointments & prescriptions
 * @param {boolean}  props.isLoading       – Loading state
 */
export default function PatientHistoryModal({
  isOpen,
  onClose,
  patientHistory,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('examinations'); // 'examinations' | 'prescriptions'
  const [expandedId, setExpandedId] = useState(null);

  if (!isOpen) return null;

  const appointments = patientHistory?.appointments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-clinic-700 via-clinic-600 to-clinic-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold shrink-0">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0 flex items-center gap-2">
                السجل الطبي وسجل الزيارات السابقة
              </h3>
              <p className="text-xs text-clinic-100 mt-0.5 m-0 font-medium">
                {patientHistory?.name || 'المريض'} — ملف رقم:{' '}
                <span className="font-mono">{patientHistory?.medical_number || 'N/A'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Demographics Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              <strong>العمر:</strong> {patientHistory?.age ? `${patientHistory.age} سنة` : 'غير محدد'}
            </span>
            <span>
              <strong>الجنس:</strong> {patientHistory?.gender === 'female' ? 'أنثى' : 'ذكر'}
            </span>
            <span>
              <strong>فصيلة الدم:</strong>{' '}
              <Badge variant="destructive" className="py-0 px-1.5 text-[10px]">
                {patientHistory?.blood_group || 'غير مسجلة'}
              </Badge>
            </span>
            {patientHistory?.surgeries && (
              <span>
                <strong>العمليات السابقة:</strong>{' '}
                <span className="font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {patientHistory.surgeries}
                </span>
              </span>
            )}
            <span>
              <strong>إجمالي الكشوفات:</strong>{' '}
              <Badge variant="success" className="py-0 px-1.5 text-[10px]">
                {patientHistory?.completed_appointments_count || appointments.length} زيارة
              </Badge>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('examinations')}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'examinations'
                  ? 'bg-white text-clinic-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5 inline mr-1" />
              الكشوفات والفحوصات ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'prescriptions'
                  ? 'bg-white text-clinic-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="h-3.5 w-3.5 inline mr-1" />
              الروشتات السابقة (
              {appointments.filter((a) => a.prescription).length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="h-8 w-8 text-clinic-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold">جاري تحميل السجل الطبي...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">لا توجد زيارات سابقة لهذا المريض</p>
              <p className="text-[11px] text-slate-400 mt-1">هذه أول زيارة أو كشف مسجل للمريض.</p>
            </div>
          ) : activeTab === 'examinations' ? (
            /* EXAMINATIONS TAB */
            appointments.map((appt, idx) => {
              const isExpanded = expandedId === appt.id || idx === 0; // First item expanded by default
              const vitals = appt.vitals || {};
              const diagnoses = Array.isArray(appt.diagnosis)
                ? appt.diagnosis
                : [];

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                    className="p-4 bg-slate-50/80 hover:bg-slate-100/60 flex items-center justify-between cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-clinic-800 bg-clinic-50 border border-clinic-200 px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-clinic-600" />
                        <span>
                          {appt.appointment_time
                            ? new Date(appt.appointment_time).toLocaleDateString('ar-EG', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'تاريخ غير محدد'}
                        </span>
                      </div>

                      <Badge variant="secondary" className="text-[11px] font-medium">
                        {appt.branch_name || appt.branch?.name || 'الفرع الرئيسي'}
                      </Badge>

                      {diagnoses.length > 0 && (
                        <div className="flex items-center gap-1">
                          {diagnoses.map((d, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        {isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  {isExpanded && (
                    <div className="p-5 space-y-4 text-xs">
                      {/* Vitals Grid if available */}
                      {vitals && Object.keys(vitals).some((k) => vitals[k]) && (
                        <div className="p-3 bg-clinic-50/40 rounded-xl border border-clinic-100">
                          <h5 className="text-[11px] font-bold text-clinic-900 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-clinic-600" />
                            العلامات الحيوية في الكشف:
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            {vitals.blood_pressure && (
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500 block">ضغط الدم:</span>
                                <strong className="font-bold text-slate-800">{vitals.blood_pressure}</strong>
                              </div>
                            )}
                            {vitals.heart_rate && (
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500 block">النبض:</span>
                                <strong className="font-bold text-slate-800">{vitals.heart_rate}</strong>
                              </div>
                            )}
                            {vitals.temperature && (
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500 block">الحرارة:</span>
                                <strong className="font-bold text-slate-800">{vitals.temperature}</strong>
                              </div>
                            )}
                            {vitals.weight && (
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500 block">الوزن:</span>
                                <strong className="font-bold text-slate-800">{vitals.weight}</strong>
                              </div>
                            )}
                            {vitals.spo2 && (
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500 block">SpO2:</span>
                                <strong className="font-bold text-slate-800">{vitals.spo2}</strong>
                              </div>
                            )}
                            {vitals.blood_sugar && (
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <span className="text-slate-500 block">السكر:</span>
                                <strong className="font-bold text-slate-800">{vitals.blood_sugar}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Clinical Notes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong className="text-slate-700 font-bold block mb-1">
                            الشكوى الرئيسية (Chief Complaint):
                          </strong>
                          <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 leading-relaxed m-0">
                            {appt.chief_complaint || 'غير مدونة'}
                          </p>
                        </div>
                        <div>
                          <strong className="text-slate-700 font-bold block mb-1">
                            الفحص الإكلينيكي (Examination):
                          </strong>
                          <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 leading-relaxed m-0">
                            {appt.clinical_examination || 'غير مدون'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* PRESCRIPTIONS TAB */
            appointments
              .filter((a) => a.prescription)
              .map((appt) => {
                const rx = appt.prescription;
                const items = rx.items || [];

                return (
                  <div
                    key={rx.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-clinic-600" />
                          <h4 className="font-extrabold text-clinic-900 text-xs m-0">
                            روشتة رقم: <span className="font-mono text-clinic-700">{rx.prescription_code}</span>
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 m-0">
                          بتاريخ: {rx.prescription_date} — بواسطة د.{' '}
                          {rx.doctor?.name || 'الطبيب الممارس'}
                        </p>
                      </div>
                    </div>

                    {/* Rx Line Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 text-slate-700 border-b border-slate-200">
                            <th className="p-2 font-bold">اسم الدواء (Drug)</th>
                            <th className="p-2 font-bold">الجرعة (Dose)</th>
                            <th className="p-2 font-bold">التكرار (Frequency)</th>
                            <th className="p-2 font-bold">المدة (Duration)</th>
                            <th className="p-2 font-bold">التعليمات (Instructions)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">{item.drug_name}</td>
                              <td className="p-2 text-slate-700">{item.dose || item.dosage || '-'}</td>
                              <td className="p-2 text-slate-700">{item.frequency || '-'}</td>
                              <td className="p-2 text-slate-700">{item.duration || '-'}</td>
                              <td className="p-2 text-slate-600 italic">{item.instruction || item.instructions || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* General Advice */}
                    {rx.general_advice && (
                      <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 text-xs">
                        <strong className="text-amber-900 block mb-0.5">نصائح وإرشادات الطبيب:</strong>
                        <p className="text-amber-950 m-0">{rx.general_advice}</p>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            إغلاق النافذة
          </Button>
        </div>
      </div>
    </div>
  );
}
