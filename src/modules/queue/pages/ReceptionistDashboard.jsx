import React, { useMemo, useState } from 'react';
import QuickActions from '../components/QuickActions';
import BookingList from '../components/BookingList';
import LiveQueue from '../components/LiveQueue';
import { Receipt } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import HeaderActions from '../../../components/ui/HeaderActions';

import { formatDateToYMD } from '../../../utils/dateFormat';
import { useAppointmentsQuery } from '../../appointments/hooks/useAppointments';
import { useQueueWebSocket } from '../hooks/useQueueWebSocket';
import useBilling from '../../billing/hooks/useBilling';
import PendingPaymentsDrawer from '../../billing/components/PendingPaymentsDrawer';
import ErrorBoundary from '../../../components/ui/ErrorBoundary';

export default function ReceptionistDashboard() {
  const { activeBranch } = useBranchContext();
  const [targetDate, setTargetDate] = useState(formatDateToYMD(new Date()));
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);

  const branchId = activeBranch?.id;
  const branchName = activeBranch ? activeBranch.name : 'Unknown Branch';

  useQueueWebSocket(branchId);
  const { pendingInvoices, pendingCount } = useBilling(branchId);

  const { data: appointments = [], isLoading, isError } = useAppointmentsQuery(branchId, targetDate);

  const { bookings, queue, stats, patients } = useMemo(() => {
    const activeBookings = [];
    const activeQueue = [];
    const patientsMap = new Map();

    let checkedInCount = 0;

    appointments.forEach((appt) => {
      if (appt.patient) {
        patientsMap.set(appt.patient.id, appt.patient);
      }
      const formattedAppt = {
        id: appt.id,
        patient: {
          id: appt.patient?.id || '',
          name: appt.patient?.name || '',
          phone: appt.patient?.phone || '',
        },
        type: appt.type,
        appointment_time: appt.appointment_time,
        status: appt.status,
        queueNo: appt.queue_no || '-',
        checkedInTime: appt.checked_in_time || 'N/A'
      };

      if (appt.status === 'booking') {
        activeBookings.push(formattedAppt);
      } else if (appt.status === 'checked_in' || appt.status === 'under_examination' || appt.status === 'pending_payment') {
        activeQueue.push(formattedAppt);
        checkedInCount++;
      }
    });

    return {
      bookings: activeBookings,
      queue: activeQueue,
      stats: {
        total: appointments.length,
        checkedIn: checkedInCount,
        remaining: activeBookings.length
      },
      patients: Array.from(patientsMap.values())
    };
  }, [appointments]);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500 font-bold">Error loading appointments. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Action Portal: Pending Invoices injected directly into top Navbar */}
      <HeaderActions>
        <button
          onClick={() => setIsPaymentsOpen(true)}
          className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
            pendingCount > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-500/30 animate-pulse'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="فواتير الانتظار المعلقة"
        >
          <Receipt className={`h-4 w-4 ${pendingCount > 0 ? 'text-white' : 'text-emerald-600'}`} />
          <span className="hidden sm:inline">فواتير معلقة</span>
          <span className="sm:hidden">الفواتير</span>
          {pendingCount > 0 ? (
            <span className="bg-white text-emerald-700 font-mono text-[11px] px-2 py-0.2 rounded-full font-black">
              {pendingCount}
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              0
            </span>
          )}
        </button>
      </HeaderActions>

      {/* Primary Dashboard Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: CONTROL DESK & STATS */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-6">
          <ErrorBoundary title="خطأ في الإجراءات السريعة">
            <QuickActions
              stats={stats}
              patients={patients}
            />
          </ErrorBoundary>
        </div>

        {/* COLUMN 2: BOOKINGS LIST */}
        <div className="lg:col-span-6 xl:col-span-4">
          <ErrorBoundary title="خطأ في جدول الحجوزات">
            <BookingList
              bookings={bookings}
              branchName={branchName}
            />
          </ErrorBoundary>
        </div>

        {/* COLUMN 3: LIVE WAITING QUEUE */}
        <div className="lg:col-span-6 xl:col-span-5">
          <ErrorBoundary title="خطأ في صالة الانتظار الحية">
            <LiveQueue
              onOpenPayments={() => setIsPaymentsOpen(true)}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Slide-over Pending Payments Drawer */}
      <ErrorBoundary title="خطأ في سداد الفواتير">
        <PendingPaymentsDrawer
          isOpen={isPaymentsOpen}
          onClose={() => setIsPaymentsOpen(false)}
          pendingInvoices={pendingInvoices}
        />
      </ErrorBoundary>
    </div>
  );
}
