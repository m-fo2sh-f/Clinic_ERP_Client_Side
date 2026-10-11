import { useState, useEffect, useRef, useCallback } from 'react';
import { saveEncounterDraft } from '../services/encounterDraftStorage';

/**
 * Hook to manage periodic local draft saving without server network calls.
 *
 * @param {string|null} encounterId Active encounter UUID
 * @param {Function} getFormData Function returning the latest clinical form data
 * @param {boolean} isCompleted Whether the encounter is already finalized
 */
export default function useEncounterDraft(encounterId, getFormData, isCompleted = false) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const timerRef = useRef(null);
  const lastPayloadHashRef = useRef('');

  // Cancel any ongoing interval timer (called before complete/checkout)
  const cancelPendingDrafts = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveDraft = useCallback((customPayload = null) => {
    if (!encounterId || isCompleted) return;

    const payload = customPayload || getFormData();
    if (!payload) return;

    // Fast deduplication check to avoid unnecessary storage writes
    const currentHash = JSON.stringify(payload);
    if (currentHash === lastPayloadHashRef.current) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      saveEncounterDraft(encounterId, payload);
      lastPayloadHashRef.current = currentHash;
      setLastSavedAt(new Date());
    } catch (err) {
      console.warn('Draft local-save notice:', err.message);
      setSaveError('Failed to save draft locally');
    } finally {
      setIsSaving(false);
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
