import React, { useState } from 'react';
import { PlusCircle, Calendar, UserCheck, Clock, UserPlus, Loader2, X } from 'lucide-react';
import Button from '../ui/Button';
import dayjs from 'dayjs';
import AppointmentModal from '../ui/AppointmentModal';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/Dialog';
import { useBranchContext } from '../../context/BranchContext';
import { useCreateAppointmentMutation } from '../../hooks/useAppointments';
import { useWalkInMutation } from '../../hooks/useQueue';

export default function QuickActions({ stats = { total: 0, checkedIn: 0, remaining: 0 }, patients = [] }) {
  const { selectedBranchId, activeBranch } = useBranchContext();
  const branchId = selectedBranchId || activeBranch?.id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '' });

  const createAppointmentMutation = useCreateAppointmentMutation();
  const walkInMutation = useWalkInMutation();

  const onSubmitAppointment = (data, selectedPatientIdFromModal) => {
    const payload = {
      branch_id: branchId,
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
        console.error("Appointment creation error:", error?.response?.data || error);
      }
    });
  };

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!walkInForm.name.trim() || !walkInForm.phone.trim()) return;

    const payload = {
      branch_id: branchId,
      patient: {
        name: walkInForm.name.trim(),
        phone: walkInForm.phone.trim()
      }
    };

    walkInMutation.mutate(payload, {
      onSuccess: () => {
        setWalkInForm({ name: '', phone: '' });
        setIsWalkInOpen(false);
      },
      onError: (error) => {
        console.error("Walk-In check-in error:", error?.response?.data || error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Triggers */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Clinic Control Desk</h3>
        <Button
          variant="default"
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-xs py-3 font-semibold transition-all hover:shadow-md cursor-pointer"
        >
          <PlusCircle className="h-4 w-4 shrink-0" />
          <span>New Appointment Book</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsWalkInOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-xs py-3 font-semibold border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Direct Walk-In Check-In</span>
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
        onSubmit={onSubmitAppointment}
        patients={patients}
      />

      {/* Direct Walk-In Modal */}
      <Dialog isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 m-0">Direct Walk-In Check-In</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Check in a patient directly into the waiting room queue without prior booking.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogClose onClick={() => setIsWalkInOpen(false)} />

        <form onSubmit={handleWalkInSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              value={walkInForm.name}
              onChange={(e) => setWalkInForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Ahmed Mahmoud"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={walkInForm.phone}
              onChange={(e) => setWalkInForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. 01012345678"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsWalkInOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={walkInMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
            >
              {walkInMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
              <span>Confirm Walk-In Check-In</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}