import React from 'react';
import {
  UserRound,
  HeartPulse,
  Loader2,
  Tag,
  ShieldAlert,
  Droplets,
  AlertTriangle,
  Phone,
  Calendar,
  UserCheck,
  FileBadge,
  CreditCard,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

/**
 * Helper to calculate or format patient age
 */
const formatAge = (patient, history) => {
  if (patient?.age) return `${patient.age} سنة`;
  if (history?.age) return `${history.age} سنة`;
  const dob = patient?.dob || patient?.date_of_birth || history?.date_of_birth;
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return dob;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} سنة`;
};

/**
 * Helper to format patient gender label
 */
const formatGender = (patient, history) => {
  const gender = patient?.gender || patient?.sex || history?.gender;
  if (!gender) return null;
  const g = String(gender).toLowerCase();
  if (g === 'male' || g === 'm' || g === 'ذكر') return 'ذكر (Male)';
  if (g === 'female' || g === 'f' || g === 'أنثى') return 'أنثى (Female)';
  return gender;
};

/**
 * ActivePatientCard — detailed patient demographics banner, info grid, and chronic diseases/allergies.
 *
 * @param {Object}   props
 * @param {Object}   props.activeQueueItem    – Queue item currently under examination
 * @param {boolean}  props.historyLoading     – Whether patient history is loading
 * @param {Object}   [props.patientHistory]   – Full patient history from API
 * @param {string[]} props.chronicDiseases    – Parsed list of chronic disease tags
 */
export default function ActivePatientCard({
  activeQueueItem,
  historyLoading,
  patientHistory,
  chronicDiseases = [],
}) {
  const patient = activeQueueItem?.patient;
  const allergies = patientHistory?.allergies || null;
  const bloodGroup = patientHistory?.blood_group || patient?.blood_group || null;
  const medicalNumber = patientHistory?.medical_number || patient?.code || patient?.mrn || null;
  const phone = patient?.phone || patientHistory?.phone || null;
  const nationalId = patient?.national_id || patientHistory?.national_id || null;
  const ageStr = formatAge(patient, patientHistory);
  const genderStr = formatGender(patient, patientHistory);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white rounded-2xl">
      {/* Gradient banner with patient primary details */}
      <div className="bg-gradient-to-r from-clinic-700 via-clinic-600 to-clinic-800 p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
              <UserRound className="h-8 w-8 text-white shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-extrabold text-white tracking-tight m-0">
                  {patient?.name || 'Unknown Patient'}
                </h2>
                <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold px-2.5 py-0.5">
                  Ticket #{String(activeQueueItem.queue_no).padStart(2, '0')}
                </Badge>
                {bloodGroup && (
                  <Badge className="bg-red-500/30 text-white border-red-300/40 text-xs font-bold px-2.5 py-0.5">
                    <Droplets className="h-3 w-3 mr-1" />
                    {bloodGroup}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-clinic-100 mt-1 flex items-center gap-2 font-medium m-0 flex-wrap">
                <HeartPulse className="h-3.5 w-3.5 animate-pulse text-emerald-300 shrink-0" />
                <span>Active Medical Session</span>
                {medicalNumber && (
                  <span className="opacity-90 bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono">
                    MRN: {medicalNumber}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Patient Demographics Bar */}
      <div className="bg-slate-100/90 border-b border-slate-200/80 px-6 py-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {/* Age */}
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="h-4 w-4 text-clinic-600 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-500 block">العمر (Age):</span>
              <strong className="font-bold text-slate-900">{ageStr || 'غير محدد'}</strong>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-2 text-slate-700">
            <UserCheck className="h-4 w-4 text-clinic-600 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-500 block">النوع (Gender):</span>
              <strong className="font-bold text-slate-900">{genderStr || 'غير محدد'}</strong>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="h-4 w-4 text-clinic-600 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-500 block">الهاتف (Phone):</span>
              <strong className="font-bold text-slate-900 dir-ltr">{phone || 'غير مسجل'}</strong>
            </div>
          </div>

          {/* National ID / MRN */}
          <div className="flex items-center gap-2 text-slate-700">
            <CreditCard className="h-4 w-4 text-clinic-600 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-500 block">الرقم القومي / الهوية:</span>
              <strong className="font-bold text-slate-900 font-mono">{nationalId || medicalNumber || 'غير مسجل'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Chronic diseases & allergies section */}
      <CardContent className="p-6 bg-white space-y-4">
        {historyLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 text-clinic-600 animate-spin mr-2 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">
              جاري تحميل بيانات السجل الطبي للمريض...
            </span>
          </div>
        ) : (
          <>
            {/* Chronic Diseases */}
            {chronicDiseases.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 m-0 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                    الأمراض المزمنة (Chronic Diseases)
                  </h4>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  {chronicDiseases.map((disease, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200/80"
                    >
                      <Tag className="h-3 w-3 text-amber-700" />
                      <span>{disease}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {allergies && (
              <div className="p-4 rounded-xl border border-red-200/80 bg-red-50/40 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 m-0 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  الحساسية الطبية (Known Allergies)
                </h4>
                <p className="text-xs text-red-800 font-medium m-0">
                  {allergies}
                </p>
              </div>
            )}

            {/* No known conditions */}
            {chronicDiseases.length === 0 && !allergies && (
              <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40">
                <p className="text-xs text-emerald-800 font-medium m-0 flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-emerald-600 shrink-0" />
                  لا توجد أمراض مزمنة أو حساسية مسجلة في ملف المريض.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
