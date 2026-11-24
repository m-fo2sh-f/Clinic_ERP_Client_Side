import api from '../../../services/api';

/**
 * Patient API client
 * Encapsulates all HTTP operations for patients directory, medical profiles, and history.
 */
export const patientApi = {
  getPatients: async (branchId, search = '') => {
    const response = await api.get('/patients', {
      params: {
        branch_id: branchId,
        search: search?.trim() || undefined,
      },
    });
    return response.data?.data || [];
  },

  searchPatients: async (searchTerm, signal) => {
    const response = await api.get('/patients/search', {
      params: { q: searchTerm.trim() },
      signal,
    });
    return response.data?.data || [];
  },

  getPatientDetail: async (patientId) => {
    const response = await api.get(`/patients/${patientId}`);
    return response.data?.data || null;
  },

  getPatientSummary: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/summary`);
    return response.data?.data || null;
  },

  updatePatient: async (id, patientData) => {
    return api.put(`/patients/${id}`, patientData);
  },
};

export default patientApi;
