import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPrescriptionTemplate,
  updatePrescriptionTemplate,
  uploadPrescriptionImage,
  deletePrescriptionImage,
} from '../api/clinicSettingsApi';
import { DEFAULT_PRESCRIPTION_SETTINGS, ALLOWED_IMAGE_CONFIG } from '../constants/prescriptionConstants';

export const prescriptionTemplateKeys = {
  all: ['clinic-settings', 'prescription-template'],
  doctor: (branchId, doctorId) => [...prescriptionTemplateKeys.all, branchId || 'default', doctorId || 'default'],
};

export function usePrescriptionTemplate(branchId, doctorId = null) {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState(null);

  const queryKey = prescriptionTemplateKeys.doctor(branchId, doctorId);

  // 1. Fetch template settings
  const {
    data: settings = DEFAULT_PRESCRIPTION_SETTINGS,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getPrescriptionTemplate(branchId, doctorId),
    staleTime: 1000 * 60 * 5,
  });

  const showStatus = useCallback((type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  // 2. Save settings mutation
  const saveMutation = useMutation({
    mutationFn: (updatedPayload) => updatePrescriptionTemplate(updatedPayload, branchId, doctorId),
    onSuccess: (savedData) => {
      queryClient.setQueryData(queryKey, savedData);
      showStatus('success', 'تم حفظ وتحديث إعدادات وقالب الروشتة الطبية بنجاح.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة مرة أخرى.';
      showStatus('error', msg);
    },
  });

  // 3. Upload image mutation (handles either raw File or { file, imageType })
  const uploadMutation = useMutation({
    mutationFn: (args) => {
      const file = args?.file ? args.file : args;
      const imageType = args?.imageType ? args.imageType : 'image';
      return uploadPrescriptionImage(file, branchId, doctorId, imageType);
    },
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(queryKey, updatedTemplate);
      showStatus('success', 'تم رفع وتثبيت الصورة بنجاح.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'فشل رفع الصورة إلى السيرفر.';
      showStatus('error', msg);
    },
  });

  // 4. Delete image mutation (handles either raw string imageType or void)
  const deleteMutation = useMutation({
    mutationFn: (arg) => {
      const imageType = typeof arg === 'string' ? arg : 'image';
      return deletePrescriptionImage(branchId, doctorId, imageType);
    },
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(queryKey, updatedTemplate);
      showStatus('success', 'تم حذف الصورة بنجاح.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'فشل حذف الصورة من السيرفر.';
      showStatus('error', msg);
    },
  });

  // Client-side file pre-validation
  const validateImageFile = useCallback((file) => {
    if (!file) return 'لم يتم اختيار أي ملف.';
    if (!ALLOWED_IMAGE_CONFIG.mimeTypes.includes(file.type)) {
      return `صيغة الملف غير مدعومة (${file.type || 'غير معروف'}). يُسمح بـ JPG و PNG و WebP فقط.`;
    }
    if (file.size > ALLOWED_IMAGE_CONFIG.maxSizeBytes) {
      return `حجم الصورة يتجاوز الحد الأقصى (${ALLOWED_IMAGE_CONFIG.maxSizeFormatted}).`;
    }
    return null;
  }, []);

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    isSaving: saveMutation.isPending,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    statusMessage,
    saveSettings: saveMutation.mutateAsync,
    uploadImage: (file, imageType = 'image') => uploadMutation.mutateAsync({ file, imageType }),
    deleteImage: (imageType = 'image') => deleteMutation.mutateAsync(imageType),
    validateImageFile,
  };
}

export default usePrescriptionTemplate;
