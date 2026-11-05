import api from '../../../services/api';
import { DEFAULT_PRESCRIPTION_SETTINGS } from '../constants/prescriptionConstants';

/**
 * Fetch prescription template settings for the given branch.
 */
export const getPrescriptionTemplate = async (branchId) => {
  const response = await api.get('/clinic-settings/prescription-template', {
    params: branchId ? { branch_id: branchId } : {},
  });
  return response?.data?.data || DEFAULT_PRESCRIPTION_SETTINGS;
};

/**
 * Update prescription template settings.
 */
export const updatePrescriptionTemplate = async (settings, branchId) => {
  const payload = {
    mode: 'builtin',
    paper_size: 'A5',
    ...(settings || {}),
    branch_id: branchId,
  };
  const response = await api.put('/clinic-settings/prescription-template', payload);
  return response?.data?.data || settings;
};

/**
 * Upload a custom template background/letterhead image to the server.
 * Uses strict multipart/form-data with field name 'image'.
 */
export const uploadPrescriptionImage = async (file, branchId, doctorOverride = null) => {
  const formData = new FormData();
  formData.append('image', file);
  if (branchId) {
    formData.append('branch_id', branchId);
  }
  if (doctorOverride !== null) {
    formData.append('doctor_override', String(doctorOverride));
  }

  const response = await api.post('/clinic-settings/prescription-template/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response?.data?.data;
};

/**
 * Delete the custom template background/letterhead image from the server.
 */
export const deletePrescriptionImage = async (branchId, doctorOverride = null) => {
  const response = await api.delete('/clinic-settings/prescription-template/image', {
    params: {
      branch_id: branchId,
      ...(doctorOverride !== null ? { doctor_override: doctorOverride } : {}),
    },
  });

  return response?.data?.data;
};

/**
 * Fetch clinic billable services for a branch.
 */
export const getBranchServices = async (branchId) => {
  const response = await api.get('/billing/services', {
    params: { branch_id: branchId },
  });
  return response?.data?.data || [];
};

/**
 * Create a new billable service.
 */
export const createBranchService = async (data) => {
  const response = await api.post('/billing/services', data);
  return response?.data?.data || null;
};

/**
 * Update an existing billable service.
 */
export const updateBranchService = async (serviceId, data) => {
  const response = await api.put(`/billing/services/${serviceId}`, data);
  return response?.data?.data || null;
};

/**
 * Delete a billable service.
 */
export const deleteBranchService = async (serviceId) => {
  const response = await api.delete(`/billing/services/${serviceId}`);
  return response?.data?.data || null;
};

// =========================================================================
// Backward Compatibility for PrescriptionSheet.jsx and legacy callers
// =========================================================================
export { DEFAULT_PRESCRIPTION_SETTINGS };
export const getPrescriptionSettings = getPrescriptionTemplate;
export const updatePrescriptionSettings = updatePrescriptionTemplate;

export default {
  DEFAULT_PRESCRIPTION_SETTINGS,
  getPrescriptionTemplate,
  updatePrescriptionTemplate,
  uploadPrescriptionImage,
  deletePrescriptionImage,
  getBranchServices,
  createBranchService,
  updateBranchService,
  deleteBranchService,
  getPrescriptionSettings,
  updatePrescriptionSettings,
};
