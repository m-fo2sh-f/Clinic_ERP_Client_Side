import api from '../../../services/api';

/**
 * Appointments API client
 * Handles appointment scheduling, doctor lookups, and patient check-ins.
 */
export const appointmentsApi = {
  getBranchDoctors: async (branchId) => {
    const response = await api.get(`/branches/${branchId}/doctors`);
    return response.data?.data || [];
  },

  getAppointments: async (branchId, targetDate, doctorId) => {
    const response = await api.get('/appointments', {
      params: { branch_id: branchId, date: targetDate, doctor_id: doctorId || undefined },
    });
    return response.data?.data || [];
  },

  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  checkIn: async (id) => {
    return api.post(`/appointments/${id}/check-in`);
  },
};

export default appointmentsApi;
