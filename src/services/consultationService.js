import api from './api';

/**
 * Consultation API service — doctor examination completion & patient history.
 */
export const consultationService = {
  /**
   * Submit the complete consultation payload (clinical notes, diagnoses,
   * medications, advice) and finalize the examination.
   *
   * @param {Object} payload
   * @param {string} payload.live_queue_id
   * @param {string} payload.appointment_id
   * @param {string} payload.patient_id
   * @param {string} payload.branch_id
   * @param {string} payload.chief_complaint
   * @param {string} [payload.examination_findings]
   * @param {string[]} payload.diagnoses
   * @param {Array}  [payload.medications]
   * @param {string} [payload.general_advice]
   * @param {string} [payload.follow_up_date]
   * @returns {Promise<Object>}
   */
  async completeConsultation(payload) {
    const response = await api.post('/consultations/complete', payload);
    return response.data;
  },

  /**
   * Fetch full patient medical history including past prescriptions.
   *
   * @param {string} patientId
   * @returns {Promise<Object>}
   */
  async getPatientHistory(patientId) {
    const response = await api.get(`/patients/${patientId}/history`);
    return response.data;
  },
};

export default consultationService;
