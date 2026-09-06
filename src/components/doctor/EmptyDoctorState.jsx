import React from 'react';
import {
  Stethoscope,
  ChevronRight,
  Loader2,
  Siren,
  ClipboardList,
} from 'lucide-react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * EmptyDoctorState — placeholder card displayed when no patient is under examination.
 *
 * @param {Object}   props
 * @param {Function} props.onNextPatient   – Call next patient action
 * @param {boolean}  props.isCallingNext   – Mutation pending state
 * @param {Function} props.onOpenQueue     – Open the queue drawer
 * @param {number}   props.waitingCount    – Number of waiting patients
 */
export default function EmptyDoctorState({
  onNextPatient,
  isCallingNext,
  onOpenQueue,
  waitingCount,
}) {
  return (
    <Card className="min-h-[520px] flex items-center justify-center p-8 text-center border-slate-200/80 shadow-sm bg-white rounded-2xl">
      <div className="flex flex-col items-center max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-clinic-50 text-clinic-600 flex items-center justify-center mb-5 border border-clinic-200 shadow-inner">
          <Stethoscope className="h-10 w-10 shrink-0" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          No Active Patient Selected
        </h2>
        <p className="text-xs text-slate-550 leading-relaxed mb-6">
          Click{' '}
          <strong className="text-clinic-600 font-bold">
            &quot;Call Next Patient&quot;
          </strong>{' '}
          to invite the next waiting patient into your examination room and open
          their clinical medical record.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="md"
            onClick={onNextPatient}
            isLoading={isCallingNext}
            loadingText="Calling Next Patient..."
            leftIcon={<Siren className="h-4 w-4" />}
            rightIcon={<ChevronRight className="h-4 w-4" />}
            className="bg-clinic-600 hover:bg-clinic-700 text-white font-bold px-6 py-2.5 shadow-md cursor-pointer"
          >
            <span>Call Next Patient</span>
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={onOpenQueue}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            <span>View Queue ({waitingCount})</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
