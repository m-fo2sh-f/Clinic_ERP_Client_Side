import api from '../../../services/api';

/**
 * Start a walk-in encounter or resume an existing active draft.
 */
export const quickStartEncounter = async (payload) => {
  const response = await api.post('/encounters/quick-start', payload);
  return response.data;
};

/**
 * Save draft encounter state periodically (15s) or on debounce.
 * Accepts an AbortSignal to cancel pending requests on checkout.
 */
export const saveDraftEncounter = async (encounterId, payload, signal = null) => {
  const response = await api.patch(`/encounters/${encounterId}/draft`, payload, { signal });
  return response.data;
};

/**
 * Finalize consultation: writes diagnoses, prescriptions, and processes payment.
 */
export const completeEncounter = async (encounterId, payload) => {
  const response = await api.post(`/encounters/${encounterId}/complete`, payload);
  return response.data;
};

/**
 * Retrieve doctor's active in-progress encounter for session recovery.
 */
export const getActiveEncounter = async (branchId) => {
  const response = await api.get('/encounters/active', {
    params: { branch_id: branchId },
  });
  return response.data;
};

/**
 * Abandon active encounter when patient is absent / no-show.
 */
export const abandonEncounter = async (encounterId, reason = null) => {
  const response = await api.post(`/encounters/${encounterId}/abandon`, { reason });
  return response.data;
};

/**
 * Cancel a checked-in queue item when patient walks away.
 */
export const cancelQueueItem = async (queueId, reason = null) => {
  const response = await api.patch(`/live-queues/${queueId}/cancel`, { reason });
  return response.data;
};

/**
 * Get aggregated summary of today's encounters for the active branch/doctor.
 */
export const getTodaySummary = async (branchId) => {
  const response = await api.get('/encounters/today-summary', {
    params: { branch_id: branchId },
  });
  return response.data;
};

/**
 * Get full details of a single encounter.
 */
export const getEncounter = async (encounterId) => {
  const response = await api.get(`/encounters/${encounterId}`);
  return response.data;
};

/**
 * Quick patient search by name, phone, or medical number.
 */
export const searchPatients = async (query) => {
  const response = await api.get('/patients/search', {
    params: { query },
  });
  return response.data;
};

/**
 * Get comprehensive patient medical profile with history.
 */
export const getPatientMedicalProfile = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/medical-profile`);
  return response.data;
};
