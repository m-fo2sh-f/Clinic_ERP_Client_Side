import React, { useState } from 'react';
import { CalendarDays, Clock, UserCheck, Trash2, Edit2 } from 'lucide-react';
import { formatDateTime } from '../../../utils/dateFormat';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import AppointmentModal from '../../appointments/components/AppointmentModal';
import { useBranchContext } from '../../../context/BranchContext';
import { useUpdateAppointmentMutation, useDeleteAppointmentMutation, useCheckInMutation } from '../../appointments/hooks/useAppointments';

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

  // 🎯 Correctly read patient data and MRN upon clicking edit
  const handleEditClick = (booking) => {
    setSelectedAppointmentId(booking.id);
    setSelectedPatientId(booking.patient?.id || null);

    setModalDefaultValues({
      patientId: booking.patient?.id || null,
      patientName: booking.patient?.name || '',
      patientPhone: booking.patient?.phone || '',
      patientAge: booking.patient?.age || '',
      patientGender: booking.patient?.gender || 'male',
      patientMedicalNumber: booking.patient?.medical_number || '',
      totalCompletedCount: booking.patient?.total_completed_count || booking.patient?.completed_appointments_count || 0,
      doctorId: booking.doctor_id || booking.doctor?.id || '',
      apptType: booking.type || 'check_up',
      apptTime: formatDateTime(booking.appointment_time)
    });
    setIsModalOpen(true);
  };

  const onSubmitUpdate = (data, selectedPatientIdFromModal, strategy) => {
    const payload = {
      branch_id: selectedBranchId,
      doctor_id: data.doctorId || undefined,
      type: data.apptType,
      status: "booking",
      appointment_time: data.apptTime,
      strategy: strategy || "UPDATE_CURRENT",
    };

    if (strategy === "REASSIGN_EXISTING" && selectedPatientIdFromModal) {
      payload.patient_id = selectedPatientIdFromModal;
    } else if (strategy === "CREATE_AND_ASSIGN") {
      payload.patient = {
        name: data.patientName,
        phone: data.patientPhone,
        age: data.patientAge ? parseInt(data.patientAge, 10) : undefined,
        gender: data.patientGender || undefined,
        medical_number: data.patientMedicalNumber || undefined,
      };
    } else {
      // UPDATE_CURRENT or default fallback
      payload.patient = {
        name: data.patientName,
        phone: data.patientPhone,
        age: data.patientAge ? parseInt(data.patientAge, 10) : undefined,
        gender: data.patientGender || undefined,
        medical_number: data.patientMedicalNumber || undefined,
      };
    }

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
    checkInMutation.mutate(id);
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-clinic-700 transition-colors">
                          {booking.patient?.name || 'No Name'}
                        </h4>
                        {booking.patient?.medical_number && (
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded font-bold">
                            {booking.patient.medical_number}
                          </span>
                        )}
                      </div>
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
                      <span>{formatDateTime(booking.appointment_time)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteAppointmentMutation.isPending || checkInMutation.isPending}
                        onClick={() => handleEditClick(booking)}
                        className="flex items-center gap-1 text-xs px-2 h-8 font-semibold text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                        title="Edit / Reassign Appointment"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={deleteAppointmentMutation.isPending && deleteAppointmentMutation.variables === booking.id}
                        disabled={deleteAppointmentMutation.isPending || checkInMutation.isPending}
                        onClick={() => handleDelete(booking.id)}
                        className="flex items-center gap-1 text-xs px-2 h-8 font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Cancel / Delete Appointment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        isLoading={checkInMutation.isPending && checkInMutation.variables === booking.id}
                        disabled={checkInMutation.isPending || deleteAppointmentMutation.isPending}
                        onClick={() => handleCheckIn(booking.id)}
                        leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                        className="text-xs px-2.5 h-8 font-semibold shadow-xs transition-all hover:translate-x-[2px]"
                      >
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
        isLoading={updateAppointmentMutation.isPending}
      />
    </div>
  );
}