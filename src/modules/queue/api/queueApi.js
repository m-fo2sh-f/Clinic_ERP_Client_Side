import api from '../../../services/api';

/**
 * Queue API client
 * Handles live queue operations, doctor calls, walk-ins, and public queue displays.
 */
export const queueApi = {
  getLiveQueue: async (branchId, doctorId) => {
    const response = await api.get('/live-queues', {
      params: {
        branch_id: branchId,
        doctor_id: doctorId || undefined,
      },
    });
    return response.data?.data || [];
  },

  getPublicLiveQueue: async (branchId, doctorId) => {
    try {
      const response = await api.get('/public/live-queues', {
        params: { branch_id: branchId, doctor_id: doctorId || undefined },
      });
      return response.data?.data || [];
    } catch (_err) {
      const response = await api.get('/live-queues', {
        params: { branch_id: branchId, doctor_id: doctorId || undefined },
      });
      return response.data?.data || [];
    }
  },

  updateStatus: async (id, status) => {
    return api.patch(`/live-queues/${id}`, { status });
  },

  deleteQueueItem: async (id) => {
    return api.delete(`/live-queues/${id}`);
  },

  cancelQueueItem: async (id, reason) => {
    return api.patch(`/live-queues/${id}/cancel`, { reason });
  },

  reorderQueue: async (orderedIds, branchId) => {
    return api.post('/live-queues/reorder', {
      ordered_ids: orderedIds,
      branch_id: branchId,
    });
  },

  callNext: async (payload) => {
    const body = typeof payload === 'object' ? payload : { branch_id: payload };
    return api.post('/live-queues/next', body);
  },

  getPatientHistory: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/history`);
    return response.data?.data || null;
  },

  walkInCheckIn: async (walkInData) => {
    return api.post('/live-queues/check-in-walkin', walkInData);
  },
};

export default queueApi;
