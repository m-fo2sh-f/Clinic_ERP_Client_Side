import React from 'react';
import {
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
import HeaderActions from '../../../components/ui/HeaderActions';

/**
 * DoctorHeader
 * Unifies Doctor Examination controls directly into the top Layout navbar via HeaderActions.
 * Eliminates redundant secondary headers, branch duplication, and Live Sync noise.
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

  return (
    <HeaderActions>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Active patient badge (shows when a patient is in consultation) */}
        {displayActivePatient && (
          <div className="flex items-center gap-1.5 bg-clinic-50 border border-clinic-200 text-clinic-800 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-semibold max-w-[180px] sm:max-w-[220px]">
            <HeartPulse className="h-3.5 w-3.5 text-clinic-600 animate-pulse shrink-0" />
            <span className="hidden md:inline text-slate-500 font-medium">يفحص:</span>
            <strong className="text-clinic-900 truncate">
              {displayActivePatient.patient?.name || displayActivePatient.name || 'مريض'}
            </strong>
            {displayActivePatient.queue_no && (
              <Badge variant="success" className="text-[10px] px-1 py-0.2 shrink-0">
                #{String(displayActivePatient.queue_no).padStart(2, '0')}
              </Badge>
            )}
          </div>
        )}

        {/* Queue toggle */}
        <Button
          id="btn-toggle-queue"
          variant="outline"
          size="sm"
          onClick={onToggleQueue}
          className={`flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer py-1 px-2.5 rounded-xl border shadow-2xs ${
            isQueueOpen
              ? 'border-clinic-500 text-clinic-700 bg-clinic-50/80 ring-2 ring-clinic-200'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="فتح / إغلاق قائمة انتظار العيادة"
        >
          {isQueueOpen ? (
            <PanelRightClose className="h-3.5 w-3.5 text-clinic-600" />
          ) : (
            <PanelRightOpen className="h-3.5 w-3.5 text-slate-600" />
          )}
          <span className="hidden sm:inline">الانتظار</span>
          <Badge
            variant={count > 0 ? 'success' : 'secondary'}
            className="text-[10px] font-extrabold px-1.5 py-0.2"
          >
            {count}
          </Badge>
        </Button>

        {/* Auto-save status */}
        {saveStatus && (
          <div
            className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-lg border border-slate-200/60"
            title="تم حفظ المسودة محلياً"
          >
            <Check className="h-3 w-3 text-emerald-500" />
            <span>محفوظ</span>
          </div>
        )}

        {/* Patient Absent / Abandon Button */}
        {onAbandon && displayActivePatient && (
          <Button
            id="btn-abandon-patient"
            variant="outline"
            size="sm"
            onClick={onAbandon}
            isLoading={isAbandoning}
            loadingText="..."
            leftIcon={<UserX className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-semibold text-xs py-1 px-2 sm:px-2.5 rounded-xl shadow-2xs cursor-pointer"
            title="تسجيل غياب المريض وإلغاء الكشف"
          >
            <span className="hidden sm:inline">غائب</span>
          </Button>
        )}

        {/* Call next patient */}
        <Button
          id="btn-next-patient-header"
          variant="default"
          size="sm"
          onClick={onNextPatient}
          isLoading={isCallingNext}
          disabled={isNextDisabled || isCallingNext}
          loadingText="..."
          leftIcon={<Siren className="h-3.5 w-3.5 shrink-0" />}
          rightIcon={<ChevronRight className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />}
          className="bg-clinic-600 hover:bg-clinic-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs py-1 px-2.5 sm:px-3 rounded-xl shadow-xs cursor-pointer"
          title={isNextDisabled ? 'يرجى إنهاء الكشف الحالي أولاً' : 'نداء المريض التالي في الدور'}
        >
          <span>نداء التالي</span>
        </Button>
      </div>
    </HeaderActions>
  );
}
