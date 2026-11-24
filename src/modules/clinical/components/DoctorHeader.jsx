import React from 'react';
import {
  Stethoscope,
  HeartPulse,
  ChevronRight,
  Siren,
  PanelRightClose,
  PanelRightOpen,
  UserX,
  Check,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

/**
 * DoctorHeader
 * Dedicated examination console header displaying active patient (العليه الدور) and waiting queue (الطابور).
 */
export default function DoctorHeader({
  activeQueueItem,
  activePatient,
  waitingItems = [],
  waitingCount,
  isQueueOpen,
  onToggleQueue,
  onNextPatient,
  isCallingNext,
  isNextDisabled = false,
  onAbandon = null,
  isAbandoning = false,
  saveStatus = null,
}) {
  const displayActivePatient = activeQueueItem || activePatient;
  const count = waitingCount !== undefined ? waitingCount : (Array.isArray(waitingItems) ? waitingItems.length : 0);

  const patientName =
    displayActivePatient?.patient?.name ||
    displayActivePatient?.name ||
    null;

  const queueNo =
    displayActivePatient?.queue_no ||
    displayActivePatient?.ticket_number ||
    null;

  const medicalNumber =
    displayActivePatient?.patient?.medical_number ||
    displayActivePatient?.medical_number ||
    null;

  return (
    <header className="bg-white border border-slate-200/80 shadow-xs mb-4 sm:mb-6 rounded-2xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        {/* Left Side: Active Examining Patient (العليه الدور) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-clinic-50 text-clinic-600 border border-clinic-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Stethoscope className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            {displayActivePatient && patientName ? (
              <div className="flex flex-wrap items-center gap-2">

                <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                  {patientName}
                </span>
                {queueNo && (
                  <Badge variant="success" className="font-mono text-xs font-bold px-2 py-0.5 shrink-0">
                    رقم الدور #{String(queueNo).padStart(2, '0')}
                  </Badge>
                )}
                {medicalNumber && (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 hidden sm:inline">
                    {medicalNumber}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="font-semibold text-slate-700">لا يوجد مريض قيد الفحص حالياً</span>
                <span className="text-slate-400 text-xs hidden sm:inline">— اضغط &quot;نداء التالي&quot; لبدء الكشف</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Waiting Queue (الطابور) & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap justify-end">
          {/* Waiting Queue Toggle Button (الطابور) */}
          <Button
            id="btn-toggle-queue"
            variant="outline"
            size="sm"
            onClick={onToggleQueue}
            className={`flex items-center gap-1.5 font-bold text-xs py-2 px-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${isQueueOpen
              ? 'border-clinic-500 text-clinic-700 bg-clinic-50/80 ring-2 ring-clinic-200'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            title="فتح / إغلاق قائمة انتظار العيادة"
          >
            {isQueueOpen ? (
              <PanelRightClose className="h-4 w-4 text-clinic-600 shrink-0" />
            ) : (
              <PanelRightOpen className="h-4 w-4 text-slate-600 shrink-0" />
            )}
            <span>طابور الانتظار</span>
            <Badge
              variant={count > 0 ? 'success' : 'secondary'}
              className="text-[11px] font-extrabold px-1.5 py-0.2"
            >
              {count}
            </Badge>
          </Button>

          {/* Persistent Auto-save Status Indicator */}
          {saveStatus && (
            <div
              className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200/60 shrink-0"
              title="تم حفظ المسودة محلياً"
            >
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>محفوظ</span>
            </div>
          )}

          {/* Patient Absent / Abandon Button (غائب) */}
          {onAbandon && displayActivePatient && (
            <Button
              id="btn-abandon-patient"
              variant="outline"
              size="sm"
              onClick={onAbandon}
              isLoading={isAbandoning}
              loadingText="..."
              leftIcon={<UserX className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
              className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs py-2 px-3 rounded-xl shadow-2xs shrink-0 cursor-pointer"
              title="تسجيل غياب المريض وإلغاء الكشف"
            >
              <span>غائب</span>
            </Button>
          )}

          {/* Call Next Patient Button (نداء التالي) */}
          <Button
            id="btn-next-patient-header"
            variant="default"
            size="sm"
            onClick={onNextPatient}
            isLoading={isCallingNext}
            disabled={isNextDisabled || isCallingNext}
            loadingText="نداء..."
            leftIcon={<Siren className="h-3.5 w-3.5 shrink-0" />}
            rightIcon={<ChevronRight className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />}
            className="bg-clinic-600 hover:bg-clinic-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs py-2 px-3 sm:px-4 rounded-xl shadow-xs shrink-0 cursor-pointer"
            title={isNextDisabled ? 'يرجى إنهاء الكشف الحالي أولاً' : 'نداء المريض التالي في الدور'}
          >
            <span>نداء التالي</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
