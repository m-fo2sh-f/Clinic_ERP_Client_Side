import React, { useMemo, useState } from 'react';
import QuickActions from '../components/QuickActions';
import BookingList from '../components/BookingList';
import LiveQueue from '../components/LiveQueue';
import { Wifi, ShieldCheck, Loader2, Receipt } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';

import { formatDateToYMD } from '../../../utils/dateFormat';
import { useAppointmentsQuery } from '../../appointments/hooks/useAppointments';
import { useQueueWebSocket } from '../hooks/useQueueWebSocket';
import useBilling from '../../billing/hooks/useBilling';
import PendingPaymentsDrawer from '../../billing/components/PendingPaymentsDrawer';

export default function ReceptionistDashboard() {
  const { activeBranch } = useBranchContext();
  const [targetDate, setTargetDate] = useState(formatDateToYMD(new Date()));
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);

  const branchId = activeBranch?.id;
  const branchName = activeBranch ? activeBranch.name : 'Unknown Branch';

  useQueueWebSocket(branchId);
  const { pendingInvoices, pendingCount, refetchPending } = useBilling(branchId);

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
      {/* Top Banner Status Bar */}
      <div className="bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Receptionist Dashboard</h2>
          <p className="text-xs text-slate-550 mt-1 flex items-center gap-1.5 font-medium">
            <span>Active branch: </span>
            <strong className="text-clinic-600 bg-clinic-50 px-2 py-0.5 rounded text-[11px] font-semibold">{branchName}</strong>
            {isLoading && <Loader2 className="h-3 w-3 text-clinic-500 animate-spin ml-2" />}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pending Invoices Trigger Button */}
          <button
            onClick={() => setIsPaymentsOpen(true)}
            className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
              pendingCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-500/30 animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Pending Invoices</span>
            {pendingCount > 0 ? (
              <span className="bg-white text-emerald-700 font-mono text-[11px] px-2 py-0.5 rounded-full font-black">
                {pendingCount}
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                0
              </span>
            )}
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-550 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-slate-650">Appointments Synced Live</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-550 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <ShieldCheck className="h-4 w-4 text-clinic-600" />
            <span className="text-slate-600">Appointments Module Active</span>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: CONTROL DESK & STATS */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-6">
          <QuickActions
            stats={stats}
            patients={patients}
          />
        </div>

        {/* COLUMN 2: BOOKINGS LIST */}
        <div className="lg:col-span-6 xl:col-span-4">
          <BookingList
            bookings={bookings}
            branchName={branchName}
          />
        </div>

        {/* COLUMN 3: LIVE WAITING QUEUE */}
        <div className="lg:col-span-6 xl:col-span-5">
          <LiveQueue onPaymentSuccess={() => refetchPending()} />
        </div>
      </div>

      {/* Slide-over Pending Payments Drawer */}
      <PendingPaymentsDrawer
        isOpen={isPaymentsOpen}
        onClose={() => setIsPaymentsOpen(false)}
        pendingInvoices={pendingInvoices}
        onPaymentSuccess={() => refetchPending()}
      />
    </div>
  );
}
