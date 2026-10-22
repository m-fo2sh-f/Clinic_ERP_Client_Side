import React, { useState, useMemo } from 'react';
import {
  FileText,
  Pill,
  Clock,
  Calendar,
  Activity,
  X,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Copy,
  MapPin,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { formatClinicalText } from '../../../utils/clinicalFormat';

/**
 * PatientHistoryModal — نافذة تفاعلية شاملة للسجل الطبي والكشوفات السابقة والروشتات الدوائية للمريض.
 *
 * الميزات:
 * 1. دعم كامل للغة العربية واتجاه RTL.
 * 2. فلترة الكشوفات الملغاة (abandoned) وتجاوز الكشف المفتوح حالياً (activeEncounterId).
 * 3. عرض الأدوية السابقة والجرعات والتعليمات في جدول زمني منظم لكل كشف.
 * 4. زر "إعادة صرف" فردي وجماعي يظهر فقط عند وجود جلسة كشف نشطة (Context-Aware Re-prescribe).
 * 5. فحص منع تكرار الأدوية (Duplicate Medication Guard) مع عرض شارة تفاعلية عند وجود الدواء بالروشتة الحالية.
 */
export default function PatientHistoryModal({
  isOpen,
  onClose,
  patientHistory,
  isLoading,
  onCopyMedication,
  onCopyAllMedications,
  currentMedications = [],
  activeEncounterId = null,
  isActiveEncounter = false,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedDrugKey, setCopiedDrugKey] = useState(null);

  // فلترة الكشوفات السابقة:
  // - استبعاد الكشوفات الملغاة (abandoned / canceled)
  // - استبعاد الكشف النشط المفتوح حالياً قيد الإجراء لتفادي ظهوره كزيارة فارغة
  // - عرض الكشوفات المكتملة أو التي تحتوي على بيانات سريرية / روشتة
  // - الترتيب من الأحدث إلى الأقدم
  const pastEncounters = useMemo(() => {
    const raw = patientHistory?.encounters || patientHistory?.consultations || [];
    return raw
      .filter((enc) => {
        if (!enc || enc.status === 'abandoned' || enc.status === 'canceled') return false;
        if (activeEncounterId && String(enc.id) === String(activeEncounterId)) return false;

        const hasPrescription = Boolean(
          enc.prescription &&
            ((Array.isArray(enc.prescription.items) && enc.prescription.items.length > 0) ||
              enc.prescription.general_advice)
        );
        const hasClinical = Boolean(
          (Array.isArray(enc.diagnosis) && enc.diagnosis.length > 0) ||
            enc.clinical_examination ||
            enc.chief_complaint
        );

        return enc.status === 'completed' || hasPrescription || hasClinical;
      })
      .sort((a, b) => {
        const dateA = new Date(a.started_at || a.created_at || a.appointment_time || 0);
        const dateB = new Date(b.started_at || b.created_at || b.appointment_time || 0);
        return dateB - dateA;
      });
  }, [patientHistory, activeEncounterId]);

  if (!isOpen) return null;

  // فحص ما إذا كان الدواء مضافاً بالفعل في الروشتة الحالية (مقارنة غير حساسة لحالة الأحرف والمسافات)
  const isMedicationInCurrentRx = (med) => {
    if (!currentMedications || currentMedications.length === 0) return false;
    const targetName = (med.drug_name || med.name || '').trim().toLowerCase();
    if (!targetName) return false;

    return currentMedications.some((curr) => {
      const currName = (curr.drug_name || curr.name || '').trim().toLowerCase();
      return currName === targetName;
    });
  };

  // إمكانية إعادة الصرف مفعلة فقط في شاشة الكشف النشطة
  const canRePrescribe = Boolean(onCopyMedication && isActiveEncounter);

  // تنفيذ إعادة صرف دواء واحد
  const handleCopyDrug = (drug) => {
    if (!canRePrescribe) return;

    const normalizedDrug = {
      drug_name: drug.drug_name || drug.name || '',
      drug_id: drug.drug_id || null,
      dosage: drug.dosage || '',
    };

    onCopyMedication(normalizedDrug);

    // تفعيل تأثير مرئي لحظي عند النسخ
    const key = `${drug.id || drug.drug_name}-${drug.dosage}`;
    setCopiedDrugKey(key);
    setTimeout(() => setCopiedDrugKey(null), 1800);
  };

  // تنفيذ إعادة صرف كافة أدوية الكشف دفعة واحدة (تجاوز الأدوية الموجودة مسبقاً)
  const handleCopyAllFromEncounter = (items) => {
    if (!canRePrescribe || !Array.isArray(items)) return;

    const candidateItems = items.filter((d) => !isMedicationInCurrentRx(d));
    if (candidateItems.length === 0) return;

    if (onCopyAllMedications) {
      onCopyAllMedications(
        candidateItems.map((d) => ({
          drug_name: d.drug_name || d.name || '',
          drug_id: d.drug_id || null,
          dosage: d.dosage || '',
        }))
      );
    } else {
      candidateItems.forEach((d) => handleCopyDrug(d));
    }
  };

  // تنسيق التاريخ والوقت باللغة العربية
  const formatArabicDateTime = (dateStr) => {
    if (!dateStr) return 'تاريخ غير محدد';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 no-print" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-clinic-700 via-clinic-600 to-clinic-800 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0 flex items-center gap-2">
                <span>السجل الطبي وتاريخ الكشوفات السابقة</span>
                {canRePrescribe && (
                  <span className="text-[10px] font-normal bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    متاح إعادة الصرف المباشر
                  </span>
                )}
              </h3>
              <p className="text-xs text-clinic-100 mt-0.5 m-0 font-medium flex items-center gap-2">
                <span>المريض: {patientHistory?.name || 'مريض غير محدد'}</span>
                <span>•</span>
                <span>
                  الرقم الطبي (MRN):{' '}
                  <strong className="font-mono text-white">
                    {patientHistory?.medical_number || 'N/A'}
                  </strong>
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Demographics Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              <strong className="text-slate-500">العمر:</strong>{' '}
              <span className="font-bold text-slate-800">
                {patientHistory?.age ? `${patientHistory.age} سنة` : 'غير مسجل'}
              </span>
            </span>
            <span>
              <strong className="text-slate-500">النوع:</strong>{' '}
              <span className="font-bold text-slate-800">
                {patientHistory?.gender === 'female' ? 'أنثى' : 'ذكر'}
              </span>
            </span>
            <span>
              <strong className="text-slate-500">فصيلة الدم:</strong>{' '}
              {patientHistory?.blood_group ? (
                <Badge variant="destructive" className="py-0 px-2 text-[11px] font-bold">
                  {patientHistory.blood_group}
                </Badge>
              ) : (
                <span className="text-slate-400">غير محددة</span>
              )}
            </span>
            {patientHistory?.chronic_diseases && (
              <span className="flex items-center gap-1">
                <strong className="text-slate-500">الأمراض المزمنة:</strong>
                <span className="font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                  {patientHistory.chronic_diseases}
                </span>
              </span>
            )}
            {patientHistory?.allergies && (
              <span className="flex items-center gap-1">
                <strong className="text-slate-500">الحساسية:</strong>
                <span className="font-semibold text-red-900 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                  {patientHistory.allergies}
                </span>
              </span>
            )}
            {patientHistory?.surgeries && (
              <span className="flex items-center gap-1">
                <strong className="text-slate-500">العمليات السابقة:</strong>
                <span className="font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                  {patientHistory.surgeries}
                </span>
              </span>
            )}
          </div>

          <div>
            <Badge variant="success" className="py-1 px-2.5 text-[11px] font-bold">
              {pastEncounters.length} زيارات مسجلة
            </Badge>
          </div>
        </div>

        {/* Modal Body / Encounters Timeline */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/60">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="h-8 w-8 text-clinic-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">جاري تحميل السجل الطبي الكامل للمريض...</p>
            </div>
          ) : pastEncounters.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-clinic-50 text-clinic-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 m-0">لا توجد زيارات أو كشوفات سابقة مسجلة</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
                هذه هي الزيارة الأولى للمريض بالعيادة أو لم يتم إنهاء كشوفات سابقة له بعد.
              </p>
            </div>
          ) : (
            pastEncounters.map((enc, idx) => {
              const isExpanded = expandedId === enc.id || (expandedId === null && idx === 0);
              const vitals = enc.vitals || {};
              const hasVitals = vitals && Object.keys(vitals).some((k) => vitals[k]);
              const diagnoses = Array.isArray(enc.diagnosis)
                ? enc.diagnosis
                : enc.diagnosis
                  ? [enc.diagnosis]
                  : [];
              const rx = enc.prescription;
              const rxItems = Array.isArray(rx?.items) ? rx.items : [];
              const doctorName = enc.doctor_name || enc.doctor?.name;
              const branchName = enc.branch_name || enc.branch?.name || 'الفرع الرئيسي';

              return (
                <div
                  key={enc.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Card Header (Click to toggle expansion) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? '__none__' : enc.id)}
                    className="p-4 bg-slate-50/90 hover:bg-slate-100/70 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Date Badge */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-clinic-800 bg-clinic-50 border border-clinic-200 px-3 py-1.5 rounded-xl">
                        <Calendar className="h-3.5 w-3.5 text-clinic-600" />
                        <span>{formatArabicDateTime(enc.started_at || enc.created_at || enc.appointment_time)}</span>
                      </div>

                      {/* Doctor Name */}
                      {doctorName && (
                        <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                          👨‍⚕️ د. {doctorName}
                        </span>
                      )}

                      {/* Branch Name */}
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{branchName}</span>
                      </span>

                      {/* Diagnoses Pills */}
                      {diagnoses.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {diagnoses.map((d, i) => {
                            const label =
                              typeof d === 'object' && d !== null
                                ? d.description || d.name || d.title || d.label || JSON.stringify(d)
                                : String(d);
                            return (
                              <span
                                key={i}
                                className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        {isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل والأدوية'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Card Content (Visible when expanded) */}
                  {isExpanded && (
                    <div className="p-5 space-y-5 text-xs">
                      {/* ─── قسم الروشتة والأدوية المصروفة ─── */}
                      <div className="bg-sky-50/40 rounded-2xl border border-sky-100 p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-sky-100">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-clinic-600 text-white flex items-center justify-center font-bold">
                              <Pill className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-clinic-900 text-xs m-0">
                                الأدوية المصروفة بالروشتة ({rxItems.length} صنف)
                              </h4>
                              {rx?.prescription_code && (
                                <p className="text-[10px] text-slate-500 mt-0.5 m-0 font-mono">
                                  كود الروشتة: {rx.prescription_code}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* زر إعادة صرف كافة أدوية الكشف دفعة واحدة */}
                          {canRePrescribe && rxItems.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleCopyAllFromEncounter(rxItems)}
                              className="px-3 py-1.5 bg-clinic-600 hover:bg-clinic-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>إعادة صرف أدوية الكشف كاملة</span>
                            </button>
                          )}
                        </div>

                        {rxItems.length === 0 ? (
                          <div className="py-4 text-center text-slate-400 text-xs">
                            لم يتم تسجيل أدوية في هذا الكشف.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
                            <table className="w-full text-right text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 text-[11px]">
                                  <th className="p-2.5 font-bold">اسم الدواء (Medication)</th>
                                  <th className="p-2.5 font-bold">الجرعة وطريقة الاستخدام (Dosage & Instructions)</th>
                                  {canRePrescribe && <th className="p-2.5 font-bold text-center">إعادة الصرف</th>}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {rxItems.map((item, itemIdx) => {
                                  const drugName = item.drug_name || item.name || 'دواء غير محدد';
                                  const isAlreadyInRx = isMedicationInCurrentRx(item);
                                  const itemKey = `${item.id || drugName}-${item.dosage || itemIdx}`;
                                  const isJustCopied = copiedDrugKey === itemKey;

                                  return (
                                    <tr key={item.id || itemIdx} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-2.5 font-bold text-slate-900" dir="ltr">
                                        <div className="text-right font-sans font-bold text-slate-900">{drugName}</div>
                                      </td>
                                      <td className="p-2.5 text-slate-800 font-medium">
                                        {item.dosage || '-'}
                                      </td>

                                      {/* زر إعادة الصرف مع حماية التكرار */}
                                      {canRePrescribe && (
                                        <td className="p-2.5 text-center">
                                          {isAlreadyInRx ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                                              <Check className="h-3 w-3" />
                                              <span>مضاف بالروشتة الحالية</span>
                                            </span>
                                          ) : isJustCopied ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-1 rounded-md animate-pulse">
                                              <Sparkles className="h-3 w-3" />
                                              <span>تمت الإضافة!</span>
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleCopyDrug(item)}
                                              className="inline-flex items-center gap-1 text-[11px] font-bold text-clinic-700 hover:text-white bg-clinic-50 hover:bg-clinic-600 border border-clinic-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                            >
                                              <Plus className="h-3 w-3" />
                                              <span>إعادة صرف</span>
                                            </button>
                                          )}
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* نصائح وتعليمات الطبيب العامة المرفقة بالروشتة */}
                        {rx?.general_advice && (
                          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs">
                            <strong className="text-amber-900 block mb-0.5">تعليمات وإرشادات الطبيب:</strong>
                            <p className="text-amber-950 m-0 leading-relaxed">{rx.general_advice}</p>
                          </div>
                        )}

                        {/* تاريخ المتابعة إن وجد */}
                        {rx?.follow_up_date && (
                          <p className="text-[11px] text-slate-500 m-0 font-medium">
                            🗓️ موعد الاستشارة / المتابعة القادمة: <strong className="text-slate-800">{rx.follow_up_date}</strong>
                          </p>
                        )}
                      </div>

                      {/* ─── قسم العلامات الحيوية والفحص السريري ─── */}
                      <div className="space-y-3">
                        {/* شبكة العلامات الحيوية */}
                        {hasVitals && (
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5 text-clinic-600" />
                              <span>العلامات الحيوية المسجلة بالكشف:</span>
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                              {vitals.blood_pressure && (
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block text-[10px]">ضغط الدم (BP):</span>
                                  <strong className="font-bold text-slate-900 font-mono">{vitals.blood_pressure}</strong>
                                </div>
                              )}
                              {vitals.heart_rate && (
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block text-[10px]">النبض (HR):</span>
                                  <strong className="font-bold text-slate-900 font-mono">{vitals.heart_rate} bpm</strong>
                                </div>
                              )}
                              {vitals.temperature && (
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block text-[10px]">الحرارة (Temp):</span>
                                  <strong className="font-bold text-slate-900 font-mono">{vitals.temperature} °C</strong>
                                </div>
                              )}
                              {vitals.weight && (
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block text-[10px]">الوزن:</span>
                                  <strong className="font-bold text-slate-900 font-mono">{vitals.weight} kg</strong>
                                </div>
                              )}
                              {vitals.blood_sugar && (
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block text-[10px]">السكر العشوائي (RBS):</span>
                                  <strong className="font-bold text-slate-900 font-mono">{vitals.blood_sugar} mg/dL</strong>
                                </div>
                              )}
                              {vitals.spo2 && (
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-500 block text-[10px]">تشبع الأكسجين (SpO2):</span>
                                  <strong className="font-bold text-slate-900 font-mono">{vitals.spo2}%</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* الشكوى وفحص الطبيب */}
                        {(enc.chief_complaint || enc.clinical_examination) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {enc.chief_complaint && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                                <strong className="text-slate-700 font-bold block text-xs">
                                  شكوى المريض الرئيسية:
                                </strong>
                                <p className="text-slate-800 leading-relaxed m-0 text-xs">
                                  {formatClinicalText(enc.chief_complaint)}
                                </p>
                              </div>
                            )}
                            {enc.clinical_examination && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                                <strong className="text-slate-700 font-bold block text-xs">
                                  فحص الطبيب والنتائج السريرية:
                                </strong>
                                <p className="text-slate-800 leading-relaxed m-0 text-xs">
                                  {formatClinicalText(enc.clinical_examination)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>بيانات سريرية مشفرة ومحمية بقواعد الخصوصية الطبية.</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="px-5 font-bold cursor-pointer">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
