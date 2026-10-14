import React from 'react';
import { Stethoscope, UserPlus, Calendar, RotateCcw, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/ui/Button';

/**
 * SoloHeader — Single Responsibility Component
 * Renders the top bar for the solo clinic workspace with action triggers and auto-save indicator.
 */
export default function SoloHeader({
  onOpenWalkIn,
  onOpenTodayEncounters,
  todayEncountersCount = 0,
  hasActiveEncounter = false,
  isSaving = false,
  lastSavedAt = null,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Title & Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-clinic-50 text-clinic-600 flex items-center justify-center font-bold">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">العيادة الفردية (Solo Practice)</h2>
          <p className="text-[11px] text-slate-400">إدارة الفحص السريري، الروشتات، والتحصيل الفوري</p>
        </div>
      </div>

      {/* Action Buttons & Status Indicator */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <Button
          variant="primary"
          onClick={onOpenWalkIn}
          className="text-xs gap-2 py-2 font-bold shadow-xs cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          بدء كشف طبي (Walk-in)
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenTodayEncounters}
          className="text-xs gap-2 py-2 relative cursor-pointer"
        >
          <Calendar className="h-4 w-4" />
          كشوفات اليوم
          {todayEncountersCount > 0 && (
            <span className="bg-clinic-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {todayEncountersCount}
            </span>
          )}
        </Button>

        {/* Auto-Save Status Badge */}
        {hasActiveEncounter && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
            {isSaving ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 text-clinic-600 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  تم الحفظ{' '}
                  {lastSavedAt
                    ? lastSavedAt.toLocaleTimeString('ar-EG', {
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : ''}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
