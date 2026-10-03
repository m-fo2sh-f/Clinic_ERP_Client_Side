import React from 'react';
import {
  Stethoscope,
  HeartPulse,
  ChevronRight,
  Loader2,
  Wifi,
  Siren,
  PanelRightClose,
  PanelRightOpen,
  UserX,
  Check,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

/**
 * DoctorHeader — sticky top navigation bar for the Doctor Examination Console.
 */
export default function DoctorHeader({
  branchName,
  activeBranchName,
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
  const displayBranch = branchName || activeBranchName || 'Main Branch';
  const displayActivePatient = activeQueueItem || activePatient;
  const count = waitingCount !== undefined ? waitingCount : (Array.isArray(waitingItems) ? waitingItems.length : 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 sm:px-6 py-3.5 no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & branch info */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-clinic-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
              Doctor Examination Console
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
              <span>Branch:</span>
              <Badge
                variant="default"
                className="font-semibold text-[11px] bg-slate-100 text-slate-700"
              >
                {displayBranch}
              </Badge>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Wifi className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span>Live Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Active patient badge (desktop only) */}
          {displayActivePatient && (
            <div className="hidden md:flex items-center gap-2 bg-clinic-50 border border-clinic-200 text-clinic-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <HeartPulse className="h-4 w-4 text-clinic-600 animate-pulse shrink-0" />
              <span>Examining:</span>
              <strong className="text-clinic-900 truncate max-w-[150px]">
                {displayActivePatient.patient?.name || displayActivePatient.name || 'Patient'}
              </strong>
              {displayActivePatient.queue_no && (
                <Badge variant="success" className="text-[10px] ml-1">
                  Ticket #{String(displayActivePatient.queue_no).padStart(2, '0')}
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
            className={`flex items-center gap-2 font-semibold text-xs transition-all cursor-pointer ${
              isQueueOpen
                ? 'border-clinic-500 text-clinic-700 bg-clinic-50/80 ring-2 ring-clinic-200'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isQueueOpen ? (
              <PanelRightClose className="h-4 w-4 text-clinic-600" />
            ) : (
              <PanelRightOpen className="h-4 w-4 text-slate-600" />
            )}
            <span>Waiting Queue</span>
            <Badge
              variant={count > 0 ? 'success' : 'secondary'}
              className="text-[10px] font-extrabold px-1.5 py-0.2"
            >
              {count}
            </Badge>
          </Button>

          {/* Persistent Save Status Indicator */}
          {saveStatus && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2 py-1 bg-slate-50 rounded-lg border border-slate-200/60">
              <Check className="h-3 w-3 text-emerald-500" />
              <span>{saveStatus}</span>
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
              loadingText="Abandoning..."
              leftIcon={<UserX className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-semibold text-xs shadow-xs cursor-pointer"
              title="Mark patient as absent / no-show and cancel encounter"
            >
              <span className="hidden sm:inline">Patient Absent</span>
              <span className="sm:hidden">Absent</span>
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
            loadingText="Calling..."
            leftIcon={<Siren className="h-4 w-4 shrink-0" />}
            rightIcon={<ChevronRight className="h-4 w-4 shrink-0" />}
            className="bg-clinic-600 hover:bg-clinic-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-sm px-4 cursor-pointer"
            title={isNextDisabled ? 'Please complete or abandon the current active encounter first' : 'Call next patient'}
          >
            <span className="hidden sm:inline">Call Next Patient</span>
            <span className="sm:hidden">Next</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
