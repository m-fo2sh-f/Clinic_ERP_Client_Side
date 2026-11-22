import api from '../../../services/api';
import { DEFAULT_PRESCRIPTION_SETTINGS } from '../constants/prescriptionConstants';
import { DEFAULT_VITALS_CONFIG } from '../constants/vitalsConstants';

/**
 * Fetch prescription template settings for a branch and optional doctor.
 */
export const getPrescriptionTemplate = async (branchId, doctorId = null) => {
  const params = {};
  if (branchId) params.branch_id = branchId;
  if (doctorId !== null && doctorId !== undefined) params.doctor_id = doctorId;

  const response = await api.get('/clinic-settings/prescription-template', { params });
  return response?.data?.data || DEFAULT_PRESCRIPTION_SETTINGS;
};

/**
 * Update prescription template settings.
 */
export const updatePrescriptionTemplate = async (settings, branchId, doctorId = null) => {
  const payload = {
    mode: 'builtin',
    paper_size: 'A5',
    ...(settings || {}),
    branch_id: branchId,
  };
  if (doctorId !== null && doctorId !== undefined) {
    payload.doctor_id = doctorId;
  }
  const response = await api.put('/clinic-settings/prescription-template', payload);
  return response?.data?.data || settings;
};

/**
 * Upload a custom template background or letterhead guide image.
 */
export const uploadPrescriptionImage = async (file, branchId, doctorId = null, imageType = 'image') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('image_type', imageType);
  if (branchId) formData.append('branch_id', branchId);
  if (doctorId !== null && doctorId !== undefined) formData.append('doctor_id', doctorId);

  const response = await api.post('/clinic-settings/prescription-template/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data?.data;
};

/**
 * Delete a prescription background or guide image.
 */
export const deletePrescriptionImage = async (branchId, doctorId = null, imageType = 'image') => {
  const params = { image_type: imageType };
  if (branchId) params.branch_id = branchId;
  if (doctorId !== null && doctorId !== undefined) params.doctor_id = doctorId;

  const response = await api.delete('/clinic-settings/prescription-template/image', { params });
  return response?.data?.data;
};

/**
 * Fetch vitals configuration for a branch and optional doctor.
 */
export const getVitalsConfig = async (branchId, doctorId = null) => {
  const params = {};
  if (branchId) params.branch_id = branchId;
  if (doctorId !== null && doctorId !== undefined) params.doctor_id = doctorId;

  const response = await api.get('/clinic-settings/vitals-config', { params });
  return response?.data?.data || DEFAULT_VITALS_CONFIG;
};

/**
 * Update vitals configuration.
 */
export const updateVitalsConfig = async (vitalsConfig, branchId, doctorId = null) => {
  const enabledKeys = vitalsConfig?.enabled_keys || [];
  const enableRefraction = Boolean(vitalsConfig?.enable_refraction ?? vitalsConfig?.refraction_card_enabled);
  const customVitals = vitalsConfig?.custom_vitals || [];

  const payload = {
    enabled_keys: enabledKeys,
    enable_refraction: enableRefraction,
    refraction_card_enabled: enableRefraction,
    custom_vitals: customVitals,
    branch_id: branchId,
  };
  if (doctorId !== null && doctorId !== undefined) {
    payload.doctor_id = doctorId;
  }
  const response = await api.put('/clinic-settings/vitals-config', payload);
  return response?.data?.data || vitalsConfig;
};

/**
 * Services API
 */
export const getBranchServices = async (branchId) => {
  const response = await api.get('/billing/services', { params: { branch_id: branchId } });
  return response?.data?.data || [];
};

export const createBranchService = async (data) => {
  const response = await api.post('/billing/services', data);
  return response?.data?.data || null;
};

export const updateBranchService = async (serviceId, data) => {
  const response = await api.put(`/billing/services/${serviceId}`, data);
  return response?.data?.data || null;
};

export const deleteBranchService = async (serviceId) => {
  const response = await api.delete(`/billing/services/${serviceId}`);
  return response?.data?.data || null;
};
