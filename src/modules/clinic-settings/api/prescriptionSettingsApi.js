import api, { getTenantStorageKey } from '../../../services/api';

/**
 * Default prescription template & printing configuration.
 */
export const DEFAULT_PRESCRIPTION_SETTINGS = {
  mode: 'builtin', // 'letterhead' | 'builtin' | 'custom_image'
  template_id: 'internal_medicine', // 'internal_medicine' | 'ophthalmology' | 'dermatology' | 'pediatrics'
  paper_size: 'A5', // 'A5' | 'A4'
  top_margin_cm: 3.5,
  bottom_margin_cm: 2.5,
  left_margin_cm: 1.5,
  right_margin_cm: 1.5,
  show_diagnosis: true,
  show_vitals: true,
  show_qr: true,
  show_serial: true,
  laser_contrast_opt: false,
  grayscale_mode: false,
  auto_print: false,
  primary_color: '#0284c7', // Sky / clinic brand blue
  clinic_name: 'عيادة النور التخصصية',
  doctor_name: 'د. محمد أحمد',
  doctor_title: 'استشاري الباطنة والقلب والأوعية الدموية',
  clinic_address: 'شارع التحرير، برج الأطباء، الدور الرابع',
  clinic_phone: '01012345678 - 0223456789',
  logo_url: '',
  custom_bg_image_url: '',
};

const getSettingsStorageKey = (branchId) => {
  return getTenantStorageKey(`prescription_settings_${branchId || 'default'}`);
};

/**
 * Fetch prescription printing settings for the given branch.
 * Falls back to localStorage and defaults if backend endpoint is unavailable.
 */
export const getPrescriptionSettings = async (branchId) => {
  const storageKey = getSettingsStorageKey(branchId);
  let localData = null;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch {
    // Ignore JSON parse errors
  }

  try {
    const response = await api.get('/clinic-settings/prescription-template', {
      params: branchId ? { branch_id: branchId } : {},
    });

    if (response?.data?.data) {
      const merged = { ...DEFAULT_PRESCRIPTION_SETTINGS, ...localData, ...response.data.data };
      localStorage.setItem(storageKey, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    // Graceful fallback to local cache or defaults if backend is 404 or unconfigured
    if (err?.response?.status !== 404) {
      console.warn('Prescription settings API call returned error, using local fallback:', err?.message);
    }
  }

  return { ...DEFAULT_PRESCRIPTION_SETTINGS, ...(localData || {}) };
};

/**
 * Save updated prescription settings to both backend and local storage.
 */
export const updatePrescriptionSettings = async (settings, branchId) => {
  const storageKey = getSettingsStorageKey(branchId);
  const payload = { ...DEFAULT_PRESCRIPTION_SETTINGS, ...settings };

  // Always save locally first for instant reactivity
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (storageErr) {
    console.error('Failed to write prescription settings to localStorage:', storageErr);
  }

  try {
    const response = await api.put('/clinic-settings/prescription-template', {
      ...payload,
      branch_id: branchId,
    });
    return response?.data?.data || payload;
  } catch (err) {
    console.warn('Prescription settings PUT to server failed (using local settings):', err?.message);
    return payload;
  }
};

/**
 * Convert file to base64 Data URI for immediate reliable preview and offline storage.
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload custom template background image.
 */
export const uploadTemplateBackground = async (file, branchId) => {
  // Always produce base64 for fallback
  const base64Url = await fileToBase64(file);

  try {
    const formData = new FormData();
    formData.append('background_image', file);
    if (branchId) formData.append('branch_id', branchId);

    const response = await api.post('/clinic-settings/prescription-template/upload-background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data?.data?.url || base64Url;
  } catch (err) {
    console.warn('Background image server upload unavailable, saved as local Data URI:', err?.message);
    return base64Url;
  }
};

export default {
  DEFAULT_PRESCRIPTION_SETTINGS,
  getPrescriptionSettings,
  updatePrescriptionSettings,
  uploadTemplateBackground,
  fileToBase64,
};
