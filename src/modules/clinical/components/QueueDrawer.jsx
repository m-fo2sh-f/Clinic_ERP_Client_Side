import React from 'react';
import {
  ClipboardList,
  Clock,
  Loader2,
  Siren,
  X,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

/**
 * QueueDrawer — slide-in drawer displaying the live waiting queue.
 *
 * @param {Object}  props
 * @param {Array}   props.queueItems      – Full queue items array
 * @param {Array}   props.waitingItems    – Filtered waiting-status items
 * @param {boolean} props.queueLoading    – Whether queue data is loading
 * @param {Function} props.onClose        – Close the drawer
 * @param {Function} props.onNextPatient  – Call next patient action
 * @param {boolean} props.isCallingNext   – Mutation pending state
 */
export default function QueueDrawer({
  queueItems,
  waitingItems,
  queueLoading,
  onClose,
  onNextPatient,
  isCallingNext,
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside className="relative w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-50 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-clinic-600" />
            <h3 className="font-bold text-slate-900 text-sm m-0">
              Live Waiting Queue
            </h3>
            <Badge variant="success" className="text-xs font-bold">
              {waitingItems.length} Waiting
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Call Next CTA */}
        <div className="p-4 border-b border-slate-100 bg-clinic-50/50">
          <Button
            variant="default"
            size="sm"
            onClick={onNextPatient}
            isLoading={isCallingNext}
            loadingText="Calling Next Patient..."
            leftIcon={<Siren className="h-4 w-4 shrink-0 animate-pulse" />}
            className="w-full bg-clinic-600 hover:bg-clinic-700 text-white font-bold py-2.5 shadow-sm"
          >
            <span>Call Next Patient Now</span>
          </Button>
        </div>

        {/* Queue list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {queueLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 text-clinic-600 animate-spin mb-2" />
              <span className="text-xs font-medium">Loading queue...</span>
            </div>
          ) : queueItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 m-0">
                Waiting room is empty
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                No checked-in patients
              </p>
            </div>
          ) : (
            queueItems.map((item, index) => {
              const isUnderExam = item.status === 'under_examination';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isUnderExam
                      ? 'border-clinic-500 bg-clinic-50/80 ring-1 ring-clinic-300 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-9 w-9 rounded-lg font-black text-xs shrink-0 ${
                      isUnderExam
                        ? 'bg-clinic-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    #{item.queue_no ?? index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate m-0">
                      {item.patient?.name || 'Unknown Patient'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 m-0 truncate">
                      {item.patient?.phone || 'No phone'}
                    </p>
                  </div>
                  <Badge
                    variant={isUnderExam ? 'success' : 'secondary'}
                    className="text-[10px] font-bold shrink-0 capitalize"
                  >
                    {isUnderExam ? 'Under Exam' : 'Waiting'}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
