import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBranchServices,
  createBranchService,
  updateBranchService,
  deleteBranchService,
} from '../api/clinicSettingsApi';

export const servicesKeys = {
  all: ['clinic-settings', 'services'],
  branch: (branchId) => [...servicesKeys.all, branchId || 'default'],
};

export function useClinicServicesManager(branchId, isReadOnly = false) {
  const queryClient = useQueryClient();
  const queryKey = servicesKeys.branch(branchId);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // 1. Fetch services
  const {
    data: services = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getBranchServices(branchId),
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 2,
  });

  const showFeedback = useCallback((type, text) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  // 2. Create mutation
  const createMutation = useMutation({
    mutationFn: (newService) => createBranchService({ ...newService, branch_id: branchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      showFeedback('success', 'تمت إضافة الخدمة الطبية وتسعيرها بنجاح.');
      setIsModalOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'فشل إنشاء الخدمة الطبية.';
      showFeedback('error', msg);
    },
  });

  // 3. Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBranchService(id, { ...data, branch_id: branchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      showFeedback('success', 'تم تعديل بيانات وسعر الخدمة بنجاح.');
      setIsModalOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'فشل تحديث الخدمة.';
      showFeedback('error', msg);
    },
  });

  // 4. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBranchService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      showFeedback('success', 'تم حذف الخدمة الطبية بنجاح.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'فشل حذف الخدمة.';
      showFeedback('error', msg);
    },
  });

  // Filtered services
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const term = searchQuery.toLowerCase().trim();
    return services.filter((s) =>
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.code && s.code.toLowerCase().includes(term))
    );
  }, [services, searchQuery]);

  const openAddModal = useCallback(() => {
    if (isReadOnly) return;
    setEditingService(null);
    setIsModalOpen(true);
  }, [isReadOnly]);

  const openEditModal = useCallback((service) => {
    if (isReadOnly) return;
    setEditingService(service);
    setIsModalOpen(true);
  }, [isReadOnly]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingService(null);
  }, []);

  const handleSave = useCallback(async (formData) => {
    if (isReadOnly) return;
    if (editingService) {
      await updateMutation.mutateAsync({ id: editingService.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  }, [isReadOnly, editingService, updateMutation, createMutation]);

  const handleDelete = useCallback(async (serviceId) => {
    if (isReadOnly) return;
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة الطبية؟')) {
      try {
        await deleteMutation.mutateAsync(serviceId);
      } catch {
        // Handled by mutation onError feedback toast
      }
    }
  }, [isReadOnly, deleteMutation]);

  return {
    services: filteredServices,
    allServicesCount: services.length,
    isLoading,
    isError,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    editingService,
    openAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    feedbackMsg,
  };
}

export default useClinicServicesManager;
