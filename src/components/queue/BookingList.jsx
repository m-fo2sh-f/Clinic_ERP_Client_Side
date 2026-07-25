import React, { useState } from 'react';
import { CalendarDays, Clock, UserCheck, Trash2, Edit2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import AppointmentModal from '../ui/AppointmentModal';
import { useBranchContext } from '../../context/BranchContext';
import { useUpdateAppointmentMutation, useDeleteAppointmentMutation, useCheckInMutation } from '../../hooks/useAppointments';

export default function BookingList({ bookings = [], branchName }) {
  const updateAppointmentMutation = useUpdateAppointmentMutation();
  const deleteAppointmentMutation = useDeleteAppointmentMutation();
  const checkInMutation = useCheckInMutation();

  const { selectedBranchId } = useBranchContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null); // 🎯 حفظ الـ ID بتاع المريض الحالي

  const [modalDefaultValues, setModalDefaultValues] = useState({
    patientName: '',
    patientPhone: '',
    apptType: 'check_up',
    apptTime: ''
  });

  // 🎯 تصحيح قراءة الداتا عند الضغط على زرار التعديل
  const handleEditClick = (booking) => {
    setSelectedAppointmentId(booking.id);
    setSelectedPatientId(booking.patient?.id || null); // حفظ الـ ID الخاص بالمريض

    setModalDefaultValues({
      patientName: booking.patient?.name || '',
      patientPhone: booking.patient?.phone || '',
      apptType: booking.type || 'check_up',
      apptTime: booking.appointment_time || '' // استخدام appointment_time المظبوطة
    });
    setIsModalOpen(true);
  };

  const onSubmitUpdate = (data) => {
    const payload = {
      branch_id: selectedBranchId,
      type: data.apptType,
      status: "booking",
      appointment_time: data.apptTime,
      patient_id: selectedPatientId, // 🎯 إرسال الـ patient_id عشان الباكيند يعرف إنه نفس المريض
      patient: {
        name: data.patientName,
        phone: data.patientPhone
      }
    };


    updateAppointmentMutation.mutate({ id: selectedAppointmentId, ...payload }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedAppointmentId(null);
        setSelectedPatientId(null);
      },
      onError: (error) => {
        console.error("Update error:", error?.response?.data || error);
      }
    });
  };

  const handleCheckIn = (id) => {
    checkInMutation.mutate(id); // Send primitive string ID instead of an object
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointmentMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Today's Bookings</h3>
          <p className="text-xs text-slate-500 mt-0.5">Awaiting physical arrival at {branchName || 'Selected Branch'}</p>
        </div>
        <Badge variant="secondary" className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-slate-100">
          {bookings.length} Scheduled
        </Badge>
      </div>

      {/* Booking List Cards */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[600px]">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 h-full text-center">
            <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-4 border border-slate-100">
              <CalendarDays className="h-8 w-8" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">No Scheduled Bookings Remaining</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const isConsultation = booking.type === 'consultation';
            const badgeVariant = isConsultation ? 'info' : (booking.type === 'procedure' ? 'warning' : 'default');

            return (
              <div
                key={booking.id}
                className="group relative p-4 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-white hover:border-clinic-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* 🎯 قراءة الاسم والتليفون من booking.patient المظبوطة */}
                      <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-clinic-700 transition-colors">
                        {booking.patient?.name || 'No Name'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{booking.patient?.phone || 'No Phone'}</p>
                    </div>
                    <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold py-0.5 px-2">
                      {booking.type}
                    </Badge>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-100/80 px-2 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {/* 🎯 قراءة وقت الحجز من appointment_time المظبوطة */}
                      <span>{booking.appointment_time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(booking)}
                        className="flex items-center gap-1 text-xs px-2 h-8 font-semibold text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                        className="flex items-center gap-1 text-xs px-2 h-8 font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleCheckIn(booking.id)}
                        className="flex items-center gap-1 text-xs px-2.5 h-8 font-semibold shadow-xs transition-all hover:translate-x-[2px]"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Check-In</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="update"
        defaultValues={modalDefaultValues}
        onSubmit={onSubmitUpdate}
      />
    </div>
  );
}