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
  branch: (branchId) => [...prescriptionTemplateKeys.all, branchId || 'default'],
};

export function usePrescriptionTemplate(branchId, doctorOverride = null) {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState(null);

  const queryKey = prescriptionTemplateKeys.branch(branchId);

  // 1. Fetch template settings
  const {
    data: settings = DEFAULT_PRESCRIPTION_SETTINGS,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getPrescriptionTemplate(branchId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const showStatus = useCallback((type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  // 2. Save settings mutation
  const saveMutation = useMutation({
    mutationFn: (updatedPayload) => updatePrescriptionTemplate(updatedPayload, branchId),
    onSuccess: (savedData) => {
      queryClient.setQueryData(queryKey, savedData);
      showStatus('success', 'تم حفظ وتحديث إعدادات وقالب الروشتة الطبية بنجاح.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة مرة أخرى.';
      showStatus('error', msg);
    },
  });

  // 3. Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: (file) => uploadPrescriptionImage(file, branchId, doctorOverride),
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(queryKey, updatedTemplate);
      showStatus('success', 'تم رفع وتثبيت صورة الروشتة على السيرفر بنجاح.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'فشل رفع الصورة إلى السيرفر.';
      showStatus('error', msg);
    },
  });

  // 4. Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePrescriptionImage(branchId, doctorOverride),
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(queryKey, updatedTemplate);
      showStatus('success', 'تم حذف صورة الروشتة واستعادة القالب النظيف.');
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
      return `صيغة الملف غير مدعومة (${file.type || 'غير معروف'}). يُسمح فقط بـ JPG و PNG و WebP. يرجى تجنب ملفات SVG أو PDF.`;
    }

    if (file.size > ALLOWED_IMAGE_CONFIG.maxSizeBytes) {
      return `حجم الصورة (${(file.size / (1024 * 1024)).toFixed(2)} MB) يتجاوز الحد الأقصى المسموح (${ALLOWED_IMAGE_CONFIG.maxSizeFormatted}).`;
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
    uploadImage: uploadMutation.mutateAsync,
    deleteImage: deleteMutation.mutateAsync,
    validateImageFile,
  };
}

export default usePrescriptionTemplate;
