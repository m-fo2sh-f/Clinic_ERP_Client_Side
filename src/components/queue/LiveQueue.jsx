import React from 'react';
import { Users, GripVertical, Play, CheckCircle2, UserMinus, ArrowUp, ArrowDown } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useLiveQueueQuery, useUpdateQueueStatus, useDeleteQueueMutation } from '../../hooks/useQueue';
import { useBranchContext } from '../../context/BranchContext';

export default function LiveQueue() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Unknown Branch';

  const { data: queueData, isLoading: isLoadingQueue, error } = useLiveQueueQuery(branchId);
  const deleteQueueMutation = useDeleteQueueMutation();
  const updateQueueMutation = useUpdateQueueStatus();




  const queue = queueData || [];



  const handleStatusChange = (id, newStatus) => {
    console.log(id, newStatus)
    updateQueueMutation.mutate({ id, status: newStatus });
  };

  const handleRemove = (id) => {
    if (confirm("Remove patient from the queue?")) {
      deleteQueueMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-850 text-base">Live Waiting Queue</h3>
          <p className="text-xs text-slate-500 mt-0.5">Physical patients inside {branchName || 'Selected Branch'}</p>
        </div>
        <Badge variant="success" className="px-2 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 animate-pulse">
          {queue.length} Active
        </Badge>
      </div>

      {/* Waiting Queue List */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[600px]">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 h-full text-center">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-4 border border-emerald-100/50">
              <Users className="h-8 w-8 animate-pulse" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">Waiting Room is Empty</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
              No patients are currently checked-in. Scheduled arrivals will appear here once checked-in.
            </p>
          </div>
        ) : (
          queue.map((item, index) => {
            const isUnderExam = item.status === 'under_examination';

            return (
              <div
                key={item.id}
                className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${isUnderExam
                  ? 'border-clinic-500 bg-clinic-50/45 shadow-sm ring-1 ring-clinic-100'
                  : 'border-slate-150 bg-white hover:border-slate-300'
                  }`}
              >
                {/* Drag handle placeholder */}
                <div
                  className="text-slate-350 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100"
                  title="Drag handles - Order can be dynamically adjusted"
                >
                  <GripVertical className="h-4.5 w-4.5" />
                </div>

                {/* Queue Number Badge */}
                <div className={`flex items-center justify-center h-8 w-8 rounded-lg font-bold text-sm ${isUnderExam
                  ? 'bg-clinic-600 text-white shadow-sm shadow-clinic-200'
                  : 'bg-slate-100 text-slate-750'
                  }`}>
                  #{index + 1}
                </div>

                {/* Patient Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800 text-sm truncate">
                      {item.patient.name}
                    </h4>
                    <Badge
                      variant={isUnderExam ? 'success' : 'default'}
                      className={`text-[9px] font-bold px-1.5 py-0.2 ${isUnderExam ? 'bg-emerald-500 text-white border-0' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Checked-in at {item.checked_in_at}
                  </p>
                </div>

                {/* Queue Reorder Control & Actions */}
                <div className="flex items-center gap-1">
                  {/* Up / Down simple interactive controls */}
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button
                      onClick={() => { }}
                      disabled={index === 0}
                      className="p-0.5 rounded text-slate-450 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move patient up in queue"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => { }}
                      disabled={index === queue.length - 1}
                      className="p-0.5 rounded text-slate-450 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move patient down in queue"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Actions */}
                  {isUnderExam ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'completed')}
                      className="h-8 w-8 p-0 rounded-lg flex items-center justify-center shadow-xs bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                      title="Mark Examination as Completed & discharge"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStatusChange(item.id, 'under_examination')}
                        className="h-8 w-8 p-0 rounded-lg flex items-center justify-center shadow-xs bg-clinic-600 hover:bg-clinic-700 focus:ring-clinic-500"
                        title="Send patient into Examination Room"
                      >
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                        className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-slate-400"
                        title="Mark as No-Show / Remove"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
