import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Clock,
  ArrowUp,
  ArrowDown,
  Receipt,
  AlertCircle,
  RefreshCw,
  UserX,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import {
  useLiveQueueQuery,
  useCancelQueueMutation,
  useReorderQueueMutation,
} from '../hooks/useQueue';
import { useBranchDoctorsQuery } from '../../appointments/hooks/useAppointments';
import { useBranchContext } from '../../../context/BranchContext';
import { useQueryClient } from '@tanstack/react-query';
import ManageInvoiceServicesModal from '../../billing/components/ManageInvoiceServicesModal';

/**
 * LiveQueue — Receptionist live waiting room queue monitor.
 *
 * Workflow Rules:
 * - "Start Exam" button is removed (examination starts exclusively from inside doctor's room).
 * - Stats counter cards and search bar removed per user preference.
 * - Queue reordering is restricted strictly among waiting patients.
 */
export default function LiveQueue({ onPaymentSuccess, onOpenPayments }) {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Selected Branch';

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const { data: branchDoctors = [] } = useBranchDoctorsQuery(branchId);

  const {
    data: queueData = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useLiveQueueQuery(branchId, selectedDoctorId);

  const cancelQueueMutation = useCancelQueueMutation();
  const reorderQueueMutation = useReorderQueueMutation();
  const queryClient = useQueryClient();

  const [servicesModalQueueItem, setServicesModalQueueItem] = useState(null);
  const [cancellingItem, setCancellingItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('انصراف المريض دون كشف');

  const queue = queueData || [];

  // Waiting patients list for safe reordering
  const waitingItems = useMemo(() => {
    return queue.filter(
      (item) => item.status === 'checked_in' || item.status === 'waiting'
    );
  }, [queue]);

  const handleMoveWaiting = (itemId, direction) => {
    const wIndex = waitingItems.findIndex((w) => w.id === itemId);
    if (wIndex === -1) return;

    const targetIndex = direction === 'up' ? wIndex - 1 : wIndex + 1;
    if (targetIndex < 0 || targetIndex >= waitingItems.length) return;

    const newWaiting = [...waitingItems];
    const temp = newWaiting[wIndex];
    newWaiting[wIndex] = newWaiting[targetIndex];
    newWaiting[targetIndex] = temp;

    const orderedIds = newWaiting.map((item) => item.id);
    reorderQueueMutation.mutate({ orderedIds, branchId });
  };

  const handleConfirmCancel = () => {
    if (!cancellingItem) return;
    cancelQueueMutation.mutate(
      {
        id: cancellingItem.id,
        reason: cancelReason,
      },
      {
        onSuccess: () => {
          setCancellingItem(null);
          setCancelReason('انصراف المريض دون كشف');
        },
      }
    );
  };

  const getStatusBadgeConfig = (status) => {
    switch (status) {
      case 'checked_in':
      case 'waiting':
        return { label: 'في الانتظار', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'under_examination':
        return { label: 'مع الطبيب', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'pending_payment':
        return { label: 'في انتظار السداد', className: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'completed':
        return { label: 'مكتمل', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'cancelled':
      case 'no_show':
        return { label: 'ملغي / انصراف', className: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: status, className: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-full min-h-[500px]">
      {/* Header with Doctor Toggle */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-150">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm m-0 flex items-center gap-2">
              صالة الانتظار المباشرة (Live Queue)
              {isFetching && (
                <RefreshCw className="h-3 w-3 text-slate-400 animate-spin" />
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 m-0 font-medium">
              المرضى المتواجدون بالعيادة — {branchName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-clinic-500 cursor-pointer shadow-2xs"
          >
            <option value="">جميع الأطباء</option>
            {branchDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Badge variant="success" className="px-2 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100">
            {queue.length} بالصالة
          </Badge>
        </div>
      </div>

      {/* Waiting Queue List */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="h-7 w-7 text-clinic-600 animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600">جارٍ تحميل طابور الانتظار...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-xs font-bold">حدث خطأ أثناء تحميل الطابور</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 text-xs"
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-3 border border-slate-100">
              <Clock className="h-8 w-8" />
            </div>
            <p className="font-bold text-slate-700 text-sm">صالة الانتظار خالية حالياً</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
              لا يوجد مرضى بانتظار الكشف للطبيب المحدد حالياً.
            </p>
          </div>
        ) : (
          queue.map((item) => {
            const isUnderExam = item.status === 'under_examination';
            const isPendingPayment = item.status === 'pending_payment';
            const isWaiting = item.status === 'checked_in' || item.status === 'waiting';
            const badgeConfig = getStatusBadgeConfig(item.status);

            const waitingIndex = isWaiting ? waitingItems.findIndex((w) => w.id === item.id) : -1;
            const canMoveUp = isWaiting && waitingIndex > 0;
            const canMoveDown = isWaiting && waitingIndex !== -1 && waitingIndex < waitingItems.length - 1;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isUnderExam
                    ? 'border-amber-300 bg-amber-50/30 shadow-xs ring-1 ring-amber-200/50'
                    : isPendingPayment
                    ? 'border-purple-300 bg-purple-50/30 shadow-xs ring-1 ring-purple-200/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Patient Information & Queue Badge */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Queue Number Badge & Order Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`flex items-center justify-center h-11 w-11 rounded-xl font-black text-sm shadow-2xs ${
                        isUnderExam
                          ? 'bg-amber-600 text-white'
                          : isPendingPayment
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      #{item.queue_no}
                    </div>

                    {/* Stepper Buttons for Queue Order (Waiting only) */}
                    {isWaiting && (
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveWaiting(item.id, 'up')}
                          disabled={!canMoveUp || reorderQueueMutation.isPending}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="تقديم الدور"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveWaiting(item.id, 'down')}
                          disabled={!canMoveDown || reorderQueueMutation.isPending}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="تأخير الدور"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Patient Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm truncate m-0" title={item.patient?.name}>
                        {item.patient?.name || 'مريض غير مسجل'}
                      </h4>
                      {item.patient?.medical_number && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                          {item.patient.medical_number}
                        </span>
                      )}
                    </div>

                    {/* Badges: Status & Doctor */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeConfig.className}`}
                      >
                        {badgeConfig.label}
                      </span>

                      {(item.doctor?.name || item.appointment?.doctor?.name) && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200/60 truncate max-w-[140px]">
                          👨‍⚕️ {item.doctor?.name || item.appointment?.doctor?.name}
                        </span>
                      )}

                      {item.checked_in_at && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="h-3 w-3 shrink-0" />
                          {item.checked_in_at}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Section: Strict Medical Workflow */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Indicator / Actions */}
                  {isUnderExam ? (
                    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span>الكشف جاري مع الطبيب</span>
                    </div>
                  ) : isPendingPayment ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => (onOpenPayments ? onOpenPayments() : onPaymentSuccess?.())}
                      leftIcon={<Receipt className="h-3.5 w-3.5 text-white shrink-0" />}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                    >
                      <span>تحصيل الفاتورة</span>
                    </Button>
                  ) : (
                    /* Waiting Patient Actions: Cancel / Left ONLY (NO Start Exam!) */
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancellingItem(item)}
                      disabled={cancelQueueMutation.isPending}
                      leftIcon={<UserX className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                      className="h-8 px-2.5 text-xs border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium rounded-lg transition-colors cursor-pointer"
                      title="انصراف المريض دون كشف"
                    >
                      <span>انصراف</span>
                    </Button>
                  )}

                  {/* Secondary Action: Add Service */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServicesModalQueueItem(item)}
                    leftIcon={<Plus className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                    className="text-xs font-semibold h-8 px-2.5 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 border-emerald-200/80 shadow-2xs whitespace-nowrap cursor-pointer"
                    title="إضافة خدمات أو إجراءات إضافية"
                  >
                    <span>خدمات</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2.5 text-rose-600">
              <UserX className="h-5 w-5" />
              <h4 className="font-bold text-sm text-slate-900 m-0">تأكيد انصراف / إلغاء دور</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed m-0">
              هل أنت متأكد من إلغاء دور المريض{' '}
              <strong className="text-slate-900">{cancellingItem.patient?.name}</strong> (رقم الدور #{cancellingItem.queue_no})؟
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                سبب الإلغاء:
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingItem(null)}
                disabled={cancelQueueMutation.isPending}
                className="text-xs"
              >
                تراجع
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmCancel}
                isLoading={cancelQueueMutation.isPending}
                loadingText="جارٍ الإلغاء..."
                className="text-xs font-bold"
              >
                تأكيد الإلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Invoice Services Modal for Queue Patient */}
      <ManageInvoiceServicesModal
        isOpen={!!servicesModalQueueItem}
        queueItem={servicesModalQueueItem}
        appointmentId={servicesModalQueueItem?.appointment_id}
        queueId={servicesModalQueueItem?.id}
        encounterId={servicesModalQueueItem?.encounter_id}
        branchId={branchId}
        onClose={() => setServicesModalQueueItem(null)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
          queryClient.invalidateQueries({ queryKey: ['billing'] });
          if (onPaymentSuccess) onPaymentSuccess();
        }}
      />
    </div>
  );
}
