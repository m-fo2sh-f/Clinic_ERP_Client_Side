import api from './api';

export const patientService = {
  /**
   * Fetch patient directory with optional branch filter and search query.
   */
  async getPatients(branchId, search = '') {
    const params = {};
    if (branchId) params.branch_id = branchId;
    if (search) params.search = search;
    
    const response = await api.get('/patients', { params });
    return response.data;
  },

  /**
   * Fetch complete medical profile and appointment history for a patient.
   */
  async getPatientDetails(id) {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  /**
   * Auto-complete search for patient selector inputs.
   */
  async searchPatients(query) {
    const response = await api.get('/patients/search', {
      params: { q: query }
    });
    return response.data;
  }
};

export default patientService;
