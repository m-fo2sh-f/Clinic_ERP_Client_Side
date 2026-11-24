import React, { useState } from 'react';
import { CalendarDays, Clock, UserCheck, Trash2, Edit2 } from 'lucide-react';
import { formatDateTime, formatTimeOnly } from '../../../utils/dateFormat';
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

  const [modalDefaultValues, setModalDefaultValues] = useState({
    patientName: '',
    patientPhone: '',
    apptType: 'check_up',
    apptTime: ''
  });

  // 🎯 Correctly read patient data and MRN upon clicking edit
  const handleEditClick = (booking) => {
    setSelectedAppointmentId(booking.id);

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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-full min-h-[480px]">
      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate">حجوزات اليوم (Today's Bookings)</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">في انتظار الحضور بالعيادة ({branchName || 'الفرع'})</p>
        </div>
        <Badge variant="secondary" className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-slate-100 shrink-0">
          {bookings.length} محجوز
        </Badge>
      </div>

      {/* Booking List Cards */}
      <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 max-h-[600px]">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 h-full text-center">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-full text-slate-400 mb-3 border border-slate-100">
              <CalendarDays className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <p className="font-bold text-slate-700 text-sm">لا توجد حجوزات متبقية لليوم</p>
            <p className="text-xs text-slate-400 mt-0.5">تم تسجيل وصول جميع المرضى المحجوزين.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const isConsultation = booking.type === 'consultation';
            const badgeVariant = isConsultation ? 'info' : (booking.type === 'procedure' ? 'warning' : 'default');

            return (
              <div
                key={booking.id}
                className="group relative p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-clinic-250 hover:shadow-2xs transition-all duration-150"
              >
                <div className="flex flex-col space-y-2.5">
                  {/* Patient Name + MRN + Type Badge */}
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-clinic-700 transition-colors truncate max-w-[180px] sm:max-w-none" title={booking.patient?.name}>
                          {booking.patient?.name || 'مريض غير مسجل'}
                        </h4>
                        {booking.patient?.medical_number && (
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded font-bold shrink-0">
                            {booking.patient.medical_number}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium truncate">{booking.patient?.phone || 'بدون هاتف'}</p>
                    </div>
                    <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold py-0.5 px-2 shrink-0">
                      {booking.type}
                    </Badge>
                  </div>

                  {/* Actions & Timing Row */}
                  <div className="border-t border-slate-100/90 pt-2.5 flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-slate-100/80 px-2 py-0.5 rounded-md shrink-0 cursor-default"
                      title={`موعد الحجز: ${formatDateTime(booking.appointment_time)}`}
                    >
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="whitespace-nowrap font-mono">{formatTimeOnly(booking.appointment_time) || formatDateTime(booking.appointment_time)}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteAppointmentMutation.isPending || checkInMutation.isPending}
                        onClick={() => handleEditClick(booking)}
                        className="h-7 w-7 p-0 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg shrink-0 transition-colors cursor-pointer"
                        title="تعديل الحجز"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={deleteAppointmentMutation.isPending && deleteAppointmentMutation.variables === booking.id}
                        disabled={deleteAppointmentMutation.isPending || checkInMutation.isPending}
                        onClick={() => handleDelete(booking.id)}
                        className="h-7 w-7 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 transition-colors cursor-pointer"
                        title="إلغاء الحجز"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        isLoading={checkInMutation.isPending && checkInMutation.variables === booking.id}
                        disabled={checkInMutation.isPending || deleteAppointmentMutation.isPending}
                        onClick={() => handleCheckIn(booking.id)}
                        leftIcon={<UserCheck className="h-3.5 w-3.5 shrink-0" />}
                        className="whitespace-nowrap shrink-0 text-xs px-2.5 h-7 font-bold shadow-2xs transition-all hover:translate-x-0.5 rounded-lg cursor-pointer"
                      >
                        <span>وصول</span>
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