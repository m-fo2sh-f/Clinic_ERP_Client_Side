import React, { useState } from 'react';
import {
  Users,
  Plus,
  Play,
  CheckCircle2,
  UserMinus,
  ArrowUp,
  ArrowDown,
  Receipt,
  Clock,
  Loader2,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import {
  useLiveQueueQuery,
  useUpdateQueueStatus,
  useDeleteQueueMutation,
  useReorderQueueMutation,
} from '../hooks/useQueue';
import { useBranchDoctorsQuery } from '../../appointments/hooks/useAppointments';
import { useBranchContext } from '../../../context/BranchContext';
import financialApi from '../../../services/financialApi';
import { useQueryClient } from '@tanstack/react-query';
import ManageInvoiceServicesModal from '../../billing/components/ManageInvoiceServicesModal';

export default function LiveQueue({ onPaymentSuccess }) {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Unknown Branch';

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const { data: branchDoctors = [] } = useBranchDoctorsQuery(branchId);

  const { data: queueData, isLoading: isLoadingQueue, error } = useLiveQueueQuery(branchId, selectedDoctorId);
  const deleteQueueMutation = useDeleteQueueMutation();
  const updateQueueMutation = useUpdateQueueStatus();
  const reorderQueueMutation = useReorderQueueMutation();

  const queryClient = useQueryClient();
  const [servicesModalAppointmentId, setServicesModalAppointmentId] = useState(null);

  const queue = queueData || [];

  const handleStatusChange = (id, newStatus) => {
    updateQueueMutation.mutate({ id, status: newStatus });
  };

  const handleRemove = (id) => {
    if (confirm("Remove patient from the queue?")) {
      deleteQueueMutation.mutate(id);
    }
  };

  const handleMove = (currentIndex, direction) => {
    if (!branchId || queue.length <= 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= queue.length) return;

    const updatedQueue = [...queue];
    const temp = updatedQueue[currentIndex];
    updatedQueue[currentIndex] = updatedQueue[targetIndex];
    updatedQueue[targetIndex] = temp;

    const orderedIds = updatedQueue.map((item) => item.id);
    reorderQueueMutation.mutate({ orderedIds, branchId });
  };


  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[500px]">
      {/* Header with Doctor Toggle */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-bold text-slate-850 text-base">Live Waiting Queue</h3>
          <p className="text-xs text-slate-500 mt-0.5">Physical patients inside {branchName || 'Selected Branch'}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-clinic-500 cursor-pointer"
          >
            <option value="">All Doctors</option>
            {branchDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          <Badge variant="success" className="px-2 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 animate-pulse">
            {queue.length} Active
          </Badge>
        </div>
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
              No patients are currently checked-in for the selected doctor view.
            </p>
          </div>
        ) : (
          queue.map((item, index) => {
            const isUnderExam = item.status === 'under_examination';
            const isPendingPayment = item.status === 'pending_payment';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isUnderExam
                  ? 'border-clinic-500 bg-clinic-50/40 shadow-sm ring-1 ring-clinic-200/60'
                  : isPendingPayment
                    ? 'border-amber-400 bg-amber-50/40 shadow-sm ring-1 ring-amber-200/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
              >
                {/* Patient Information & Queue Badge */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Queue Number Badge & Order Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`flex items-center justify-center h-12 w-12 rounded-xl font-black text-sm shadow-xs ${isUnderExam
                        ? 'bg-clinic-600 text-white ring-2 ring-clinic-400/30 shadow-clinic-200'
                        : isPendingPayment
                          ? 'bg-amber-500 text-white ring-2 ring-amber-400/30 shadow-amber-200'
                          : 'bg-slate-100 text-slate-750 border border-slate-200/80'
                        }`}
                    >
                      #{item.queue_no}
                    </div>

                    {/* Stepper Buttons for Queue Order */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0 || reorderQueueMutation.isPending}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Move patient up in queue"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === queue.length - 1 || reorderQueueMutation.isPending}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Move patient down in queue"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm truncate" title={item.patient?.name}>
                        {item.patient?.name || 'Unregistered Patient'}
                      </h4>
                    </div>

                    {/* Badges: Status & Doctor */}
                    <div className="flex flex-col items-start gap-1.5 mt-1.5 flex-wrap">
                      <Badge
                        variant={isUnderExam ? 'success' : isPendingPayment ? 'warning' : 'default'}
                        className={`text-[10px] font-bold px-2 py-0.5 ${isUnderExam
                          ? 'bg-emerald-500 text-white border-0'
                          : isPendingPayment
                            ? 'bg-amber-500 text-white border-0'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                      >
                        {isUnderExam ? 'Under Exam' : isPendingPayment ? 'Pending Payment' : 'Waiting'}
                      </Badge>

                      {item.doctor?.name && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200/60 truncate max-w-[140px]">
                          👨‍⚕️ {item.doctor.name}
                        </span>
                      )}
                    </div>

                    {/* Checked-in Time */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-1.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Checked in: {item.checked_in_at}</span>
                    </div>
                  </div>
                </div>

                {/* 🎯 ACTIONS SECTION: Clean 2-row layout in normal flex flow */}
                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-[175px]">
                  {/* Row 1: Primary Action Button (Start/Complete Exam) + Delete/Remove Button */}
                  <div className="flex items-center gap-1.5 w-full">
                    {isUnderExam ? (
                      <Button
                        variant="success"
                        size="sm"
                        isLoading={updateQueueMutation.isPending && updateQueueMutation.variables?.id === item.id}
                        disabled={updateQueueMutation.isPending || deleteQueueMutation.isPending}
                        onClick={() => handleStatusChange(item.id, 'completed')}
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                        className="flex-1 justify-center text-xs font-semibold h-8.5 px-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
                        title="Complete examination and discharge patient"
                      >
                        <span>Complete</span>
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        isLoading={updateQueueMutation.isPending && updateQueueMutation.variables?.id === item.id && updateQueueMutation.variables?.status === 'under_examination'}
                        disabled={updateQueueMutation.isPending || deleteQueueMutation.isPending}
                        onClick={() => handleStatusChange(item.id, 'under_examination')}
                        leftIcon={<Play className="h-3 w-3 fill-current shrink-0" />}
                        className="flex-1 justify-center text-xs font-semibold h-8.5 px-2 shadow-xs bg-clinic-600 hover:bg-clinic-700 text-white whitespace-nowrap"
                        title="Send patient into examination room"
                      >
                        <span>Start Exam</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={deleteQueueMutation.isPending && deleteQueueMutation.variables === item.id}
                      disabled={deleteQueueMutation.isPending || updateQueueMutation.isPending}
                      onClick={() => handleRemove(item.id)}
                      className="h-8.5 w-8.5 p-0 shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
                      title="Remove patient from queue"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Row 2: Secondary Action (+ Add Service) */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServicesModalAppointmentId(item.appointment_id)}
                    leftIcon={<Plus className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                    className="w-full justify-center text-xs font-semibold h-8.5 px-2.5 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 border-emerald-200/80 shadow-xs whitespace-nowrap cursor-pointer"
                    title="Add services or procedures for patient"
                  >
                    <span>Add Service</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Manage Invoice Services Modal for Queue Patient */}
      <ManageInvoiceServicesModal
        isOpen={!!servicesModalAppointmentId}
        appointmentId={servicesModalAppointmentId}
        branchId={branchId}
        onClose={() => setServicesModalAppointmentId(null)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
          if (onPaymentSuccess) onPaymentSuccess();
        }}
      />
    </div>
  );
}
