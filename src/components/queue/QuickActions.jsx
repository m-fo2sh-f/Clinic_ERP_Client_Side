import React, { useState } from 'react';
import { PlusCircle, Calendar, UserCheck, Clock } from 'lucide-react';
import Button from '../ui/Button';
import dayjs from 'dayjs';
import AppointmentModal from '../ui/AppointmentModal';
import { useBranchContext } from '../../context/BranchContext';
import { useCreateAppointmentMutation } from '../../hooks/useAppointments';


export default function QuickActions({ stats = { total: 0, checkedIn: 0, remaining: 0 }, patients = [] }) {
  const { selectedBranchId } = useBranchContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createAppointmentMutation = useCreateAppointmentMutation();

  const onSubmit = (data, selectedPatientIdFromModal) => {

    const payload = {
      branch_id: selectedBranchId,
      appointment_time: data.apptTime,
      type: data.apptType,
      status: "booking",
    };

    if (selectedPatientIdFromModal) {
      payload.patient_id = selectedPatientIdFromModal;
    } else {
      payload.patient = {
        name: data.patientName,
        phone: data.patientPhone
      };
    }

    createAppointmentMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: (error) => {
        console.error("إيرور الباكيند:", error?.response?.data || error);
      }
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Action Trigger */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Clinic Control Desk</h3>
        <Button
          variant="default"
          onClick={handleOpenModal}
          className="w-full flex items-center justify-center gap-2 text-sm py-5 font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-md cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Appointment Book</span>
        </Button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 gap-4">
        {/* Total Appts Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-clinic-300 transition-all">
          <div className="absolute top-0 right-0 p-3 bg-clinic-50 rounded-bl-xl text-clinic-600 transition-colors group-hover:bg-clinic-100">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings Today</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-550 font-medium">
            <span>Overall scheduled patients today</span>
          </div>
        </div>

        {/* Checked-In Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 right-0 p-3 bg-emerald-50 rounded-bl-xl text-emerald-600 transition-colors group-hover:bg-emerald-100">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Physically Checked-In</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.checkedIn}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live in waiting room</span>
          </div>
        </div>

        {/* Remaining Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 right-0 p-3 bg-amber-50 rounded-bl-xl text-amber-600 transition-colors group-hover:bg-amber-100">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Arrivals</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.remaining}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-550 font-medium">
            <span>Awaiting check-in action</span>
          </div>
        </div>
      </div>

      {/* Appointment Booking Dialog */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
        defaultValues={{
          patientName: '',
          patientPhone: '',
          apptType: 'check_up',
          apptTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }}
        onSubmit={onSubmit}
        patients={patients}
      />
    </div>
  );
}