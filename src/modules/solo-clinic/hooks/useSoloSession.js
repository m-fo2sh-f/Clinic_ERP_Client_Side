import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBranchContext } from '../../../context/BranchContext';
import {
  quickStartEncounter,
  completeEncounter,
  getTodaySummary,
  getActiveEncounter,
  abandonEncounter,
} from '../../clinical/api/encounterApi';
import {
  loadEncounterDraft,
  clearEncounterDraft,
} from '../../clinical/services/encounterDraftStorage';
import useEncounterDraft from '../../clinical/hooks/useEncounterDraft';
import { usePatientHistoryQuery } from '../../queue/hooks/useQueue';
import { findConsultationService } from '../utils/serviceUtils';

/**
 * useSoloSession — Single Responsibility Hook
 * Manages the lifecycle of a Solo Doctor consultation session:
 * - Active in-progress encounter tracking & F5 session recovery via TanStack Query
 * - LocalStorage draft auto-save & rehydration
 * - Walk-in patient consultation initiation
 * - Abandoning/cancelling active session
 * - Finalizing consultation checkout and invoice generation
 * - Modals visibility and notifications
 */
export default function useSoloSession({ getFormData, rehydrateFromDraft, resetForm }) {
  const queryClient = useQueryClient();
  const { activeBranch, user } = useBranchContext();
  const branchId = activeBranch?.id;
  const doctorId = user?.id;

  // ── 1. Encounter & Patient State ──────────────────────────────
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [activePatient, setActivePatient] = useState(null);

  // Modals & Drawers State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInConflictError, setWalkInConflictError] = useState(null);
  const [isTodayDrawerOpen, setIsTodayDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Today Summary State
  const [todaySummary, setTodaySummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Feedback & Loading
  const [isStartingEncounter, setIsStartingEncounter] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // ── 2. Session Recovery Query (Survives F5 Refresh) ────────────
  const { data: activeEncounterData } = useQuery({
    queryKey: ['encounter', 'active', doctorId, branchId],
    queryFn: async () => {
      const res = await getActiveEncounter(branchId);
      return res?.data || null;
    },
    enabled: !!branchId && !!doctorId,
    staleTime: 1000 * 30, // 30s freshness window
  });

  // Patient medical history query
  const activePatientId = activePatient?.id || activeEncounter?.patient?.id;
  const { data: patientHistory, isLoading: historyLoading } = usePatientHistoryQuery(activePatientId);

  // ── 3. Draft Auto-Save Hook Integration ───────────────────────
  const { isSaving, lastSavedAt, cancelPendingDrafts } = useEncounterDraft(
    activeEncounter?.id,
    getFormData,
    activeEncounter?.status === 'completed'
  );

  // ── 4. Rehydration Helper ─────────────────────────────────────
  const initSessionWithEncounter = useCallback(
    (encounter, patient = null) => {
      if (!encounter) return;
      setActiveEncounter(encounter);
      setActivePatient(patient || encounter.patient);

      if (branchId) {
        localStorage.setItem(`solo_active_encounter_${branchId}`, encounter.id);
      }
      queryClient.setQueryData(['encounter', 'active', doctorId, branchId], encounter);

      // Rehydrate clinical form fields from LocalStorage draft
      const localDraft = loadEncounterDraft(encounter.id);
      rehydrateFromDraft(localDraft, encounter);
    },
    [branchId, doctorId, queryClient, rehydrateFromDraft]
  );

  // Session Recovery on Mount / Refresh
  useEffect(() => {
    if (activeEncounterData) {
      if (!activeEncounter || activeEncounter.id !== activeEncounterData.id) {
        initSessionWithEncounter(activeEncounterData, activeEncounterData.patient);
      }
    } else if (activeEncounterData === null && activeEncounter) {
      // Backend confirmed no active encounter is in progress
      setActiveEncounter(null);
      setActivePatient(null);
      resetForm();
    }
  }, [activeEncounterData, activeEncounter, initSessionWithEncounter, resetForm]);

  // ── 5. Today's Summary Fetcher ────────────────────────────────
  const fetchTodaySummary = useCallback(async () => {
    if (!branchId) return;
    setIsSummaryLoading(true);
    try {
      const res = await getTodaySummary(branchId);
      setTodaySummary(res.data);
    } catch (err) {
      console.warn('Failed to load today summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchTodaySummary();
  }, [fetchTodaySummary]);

  // ── 6. Walk-In Consultation Start ─────────────────────────────
  const startWalkIn = async (patientPayload) => {
    if (!branchId) return;
    setIsStartingEncounter(true);
    setWalkInConflictError(null);
    try {
      const res = await quickStartEncounter({
        branch_id: branchId,
        ...patientPayload,
      });

      const encounter = res.data;
      queryClient.setQueryData(['encounter', 'active', doctorId, branchId], encounter);
      queryClient.invalidateQueries({ queryKey: ['encounter', 'active', doctorId, branchId] });
      initSessionWithEncounter(encounter, encounter.patient);
      setIsWalkInModalOpen(false);
      setWalkInConflictError(null);
      setActionNotice({ type: 'success', text: 'تم بدء جلسة الكشف بنجاح' });
      fetchTodaySummary();
    } catch (err) {
      if (err.response?.status === 409) {
        setWalkInConflictError(
          err.response?.data?.message || 'المريض لديه جلسة فحص نشطة بالفعل اليوم.'
        );
      } else {
        alert(err.response?.data?.message || 'تعذر بدء جلسة الكشف');
      }
    } finally {
      setIsStartingEncounter(false);
    }
  };

  // ── 7. Abandon Session (Doctor Cancel / Patient Left) ──────────
  const abandonSession = async () => {
    if (!activeEncounter?.id) return;
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء جلسة الكشف الحالية؟ لن يتم إصدار فاتورة أو روشتة.')) {
      return;
    }
    try {
      await abandonEncounter(activeEncounter.id, 'Doctor cancelled consultation');
      clearEncounterDraft(activeEncounter.id);
      if (branchId) {
        localStorage.removeItem(`solo_active_encounter_${branchId}`);
      }
      queryClient.setQueryData(['encounter', 'active', doctorId, branchId], null);
      queryClient.invalidateQueries({ queryKey: ['encounter', 'active', doctorId, branchId] });
      setActiveEncounter(null);
      setActivePatient(null);
      resetForm();
      fetchTodaySummary();
      setActionNotice({ type: 'info', text: 'تم إلغاء جلسة الكشف بنجاح' });
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر إلغاء الجلسة');
    }
  };

  // ── 8. Final Complete & Checkout ──────────────────────────────
  const completeCheckout = async ({ discount, payments }, availableServices = [], consultationFee = 150) => {
    if (!activeEncounter?.id) return;
    setIsCompleting(true);

    // Cancel in-flight draft updates immediately
    cancelPendingDrafts();

    try {
      const formData = getFormData();

      // Ensure base consultation service is included in the invoice services payload
      let servicesPayload = [...(formData.services || [])];
      const consult = findConsultationService(availableServices);
      if (consult && !servicesPayload.some((s) => s.service_id === consult.id)) {
        servicesPayload.unshift({
          service_id: consult.id,
          price: Number(consult.price ?? consult.default_price ?? consultationFee ?? 150),
          quantity: 1,
        });
      }

      const payload = {
        chief_complaint: formData.chief_complaint,
        clinical_examination: formData.clinical_examination,
        diagnosis: formData.diagnosis,
        vitals: formData.vitals,
        private_notes: formData.private_notes,
        medications: formData.medications,
        services: servicesPayload,
        discount,
        payments,
      };

      await completeEncounter(activeEncounter.id, payload);
      clearEncounterDraft(activeEncounter.id);
      if (branchId) {
        localStorage.removeItem(`solo_active_encounter_${branchId}`);
      }
      queryClient.setQueryData(['encounter', 'active', doctorId, branchId], null);
      queryClient.invalidateQueries({ queryKey: ['encounter', 'active', doctorId, branchId] });
      setIsCheckoutModalOpen(false);
      setActionNotice({ type: 'success', text: 'تم إنهاء الكشف وإصدار الفاتورة والروشتة بنجاح!' });

      // Refresh today's summary & clear session
      fetchTodaySummary();
      setActiveEncounter(null);
      setActivePatient(null);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر إتمام الكشف والدفع');
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    activeEncounter,
    activePatient,
    patientHistory,
    historyLoading,
    todaySummary,
    isSummaryLoading,
    isStartingEncounter,
    isCompleting,
    isSaving,
    lastSavedAt,
    actionNotice,
    setActionNotice,
    // Modals
    isWalkInModalOpen,
    setIsWalkInModalOpen,
    walkInConflictError,
    setWalkInConflictError,
    isTodayDrawerOpen,
    setIsTodayDrawerOpen,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    // Actions
    startWalkIn,
    abandonSession,
    completeCheckout,
    fetchTodaySummary,
    initSessionWithEncounter,
  };
}
