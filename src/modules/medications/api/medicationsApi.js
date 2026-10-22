import api from '../../../services/api';

/**
 * Search drugs combining doctor's personal frequent list with central Egyptian database.
 */
export async function searchDrugs(query = '', limit = 15, { signal } = {}) {
  const params = { limit };
  if (query && query.trim() !== '') {
    params.query = query.trim();
  }

  const response = await api.get('/doctor-drugs/search', { params, signal });
  return response.data?.data || [];
}

/**
 * Fetch doctor's personal prescribing catalog.
 */
export async function getDoctorDrugs(params = {}) {
  const response = await api.get('/doctor-drugs', { params });
  return response.data?.data || [];
}

/**
 * Add a new custom drug to doctor's personal catalog.
 */
export async function createDoctorDrug(payload) {
  const response = await api.post('/doctor-drugs', payload);
  return response.data?.data;
}

/**
 * Update an existing drug in doctor's catalog.
 */
export async function updateDoctorDrug(id, payload) {
  const response = await api.put(`/doctor-drugs/${id}`, payload);
  return response.data?.data;
}

/**
 * Delete a drug from doctor's catalog.
 */
export async function deleteDoctorDrug(id) {
  const response = await api.delete(`/doctor-drugs/${id}`);
  return response.data;
}

/**
 * Toggle favorite status of a drug.
 */
export async function toggleFavoriteDrug(id) {
  const response = await api.post(`/doctor-drugs/${id}/favorite`);
  return response.data?.data;
}
