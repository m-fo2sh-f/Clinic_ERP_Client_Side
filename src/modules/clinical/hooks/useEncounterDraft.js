import { useState, useEffect, useRef, useCallback } from 'react';
import { saveDraftEncounter } from '../api/encounterApi';

/**
 * Hook to manage 15-second auto-save drafts with AbortController cancellation on checkout.
 *
 * @param {string|null} encounterId Active encounter UUID
 * @param {Function} getFormData Function returning the latest clinical form data
 * @param {boolean} isCompleted Whether the encounter is already finalized
 */
export default function useEncounterDraft(encounterId, getFormData, isCompleted = false) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const abortControllerRef = useRef(null);
  const timerRef = useRef(null);
  const lastPayloadHashRef = useRef('');

  // Cancel any ongoing draft request (called before complete/checkout)
  const cancelPendingDrafts = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveDraft = useCallback(async (customPayload = null) => {
    if (!encounterId || isCompleted) return;

    const payload = customPayload || getFormData();
    if (!payload) return;

    // Fast deduplication check to avoid unnecessary network calls
    const currentHash = JSON.stringify(payload);
    if (currentHash === lastPayloadHashRef.current) {
      return;
    }

    // Abort previous in-flight save request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveDraftEncounter(encounterId, payload, controller.signal);
      lastPayloadHashRef.current = currentHash;
      setLastSavedAt(new Date());
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.warn('Draft auto-save notice:', err.message);
        setSaveError(err.response?.data?.message || 'Failed to auto-save draft');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsSaving(false);
      }
    }
  }, [encounterId, isCompleted, getFormData]);

  // Periodic 15-second background auto-save interval
  useEffect(() => {
    if (!encounterId || isCompleted) {
      cancelPendingDrafts();
      return;
    }

    timerRef.current = setInterval(() => {
      saveDraft();
    }, 15000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [encounterId, isCompleted, saveDraft, cancelPendingDrafts]);

  return {
    isSaving,
    lastSavedAt,
    saveError,
    saveNow: saveDraft,
    cancelPendingDrafts,
  };
}
