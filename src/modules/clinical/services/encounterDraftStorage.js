/**
 * Service to manage local draft persistence and vitals normalization for clinical encounters.
 * Handles localStorage lifecycle, auto-saves, rehydration, and cleanup on consultation completion.
 */

const DRAFT_PREFIX = 'clinic_draft_';
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate standard storage key for an encounter.
 */
export const getDraftKey = (encounterId) => {
  return encounterId ? `${DRAFT_PREFIX}${encounterId}` : null;
};

/**
 * Normalize vitals object across different naming schemes (camelCase vs snake_case).
 */
export const normalizeVitals = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    bloodPressure: raw.bloodPressure || raw.blood_pressure || '',
    heartRate: raw.heartRate || raw.heart_rate || '',
    temperature: raw.temperature || raw.temp || '',
    weight: raw.weight || '',
    height: raw.height || '',
    spo2: raw.spo2 || raw.oxygen_saturation || '',
    randomBloodSugar: raw.randomBloodSugar || raw.blood_sugar || raw.random_blood_sugar || '',
  };
};

/**
 * Check if a vitals object has at least one recorded measurement.
 */
export const hasAnyVitalValue = (vitals) => {
  if (!vitals || typeof vitals !== 'object') return false;
  return Object.values(vitals).some((v) => v !== '' && v !== null && v !== undefined);
};

/**
 * Check if a clinical draft has any recorded data.
 * Returns true if all fields are empty, meaning there is nothing to persist.
 */
export const isDraftEmpty = (draftData) => {
  if (!draftData || typeof draftData !== 'object') return true;

  const chiefComplaint = draftData.chiefComplaint || draftData.chief_complaint;
  const hasChiefComplaint = Boolean(chiefComplaint && typeof chiefComplaint === 'string' && chiefComplaint.trim());

  const examFindings = draftData.examinationFindings || draftData.clinical_examination;
  const hasExamination = Boolean(examFindings && typeof examFindings === 'string' && examFindings.trim());

  const hasVitals = hasAnyVitalValue(draftData.vitals);

  const diagnosesList = draftData.diagnoses || draftData.diagnosis;
  const hasDiagnoses = Array.isArray(diagnosesList) && diagnosesList.length > 0;

  const hasMedications =
    Array.isArray(draftData.medications) &&
    draftData.medications.some((m) => Boolean((m.drug_name || m.name)?.trim()));

  const hasServices = Array.isArray(draftData.services) && draftData.services.length > 0;

  const privateNotes = draftData.privateNotes || draftData.private_notes;
  const hasPrivateNotes = Boolean(privateNotes && typeof privateNotes === 'string' && privateNotes.trim());

  const advice = draftData.generalAdvice || draftData.general_advice;
  const hasAdvice = Boolean(advice && typeof advice === 'string' && advice.trim());

  const hasFollowUp = Boolean(draftData.followUpDate || draftData.follow_up_date);

  return (
    !hasChiefComplaint &&
    !hasExamination &&
    !hasVitals &&
    !hasDiagnoses &&
    !hasMedications &&
    !hasServices &&
    !hasPrivateNotes &&
    !hasAdvice &&
    !hasFollowUp
  );
};

/**
 * Persist encounter clinical draft to browser localStorage.
 * If the draftData is empty (e.g. form was reset or completed), it purges the record entirely.
 */
export const saveEncounterDraft = (encounterId, draftData) => {
  if (!encounterId) return false;

  // Never keep an empty record in localStorage; wipe the key if there is no data
  if (isDraftEmpty(draftData)) {
    clearEncounterDraft(encounterId);
    return false;
  }

  try {
    const key = getDraftKey(encounterId);
    const payload = {
      ...draftData,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn(`[DraftStorage] Failed to persist draft for encounter ${encounterId}:`, e);
    return false;
  }
};

/**
 * Rehydrate encounter clinical draft from browser localStorage.
 */
export const loadEncounterDraft = (encounterId) => {
  if (!encounterId) return null;
  try {
    const key = getDraftKey(encounterId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isDraftEmpty(parsed)) {
      clearEncounterDraft(encounterId);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn(`[DraftStorage] Failed to load draft for encounter ${encounterId}:`, e);
    return null;
  }
};

/**
 * Completely remove encounter draft record from localStorage.
 */
export const clearEncounterDraft = (encounterId) => {
  if (!encounterId) return;
  try {
    const key = getDraftKey(encounterId);
    if (key) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem(`${DRAFT_PREFIX}${encounterId}`);
  } catch (e) {
    console.warn(`[DraftStorage] Failed to clear draft for encounter ${encounterId}:`, e);
  }
};

/**
 * Prune stale or expired session drafts from localStorage.
 */
export const pruneStaleEncounterDrafts = (currentActiveId = null, maxAgeMs = DEFAULT_MAX_AGE_MS) => {
  try {
    const now = Date.now();
    const activeKey = getDraftKey(currentActiveId);
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        if (activeKey && key === activeKey) {
          continue;
        }
        try {
          const raw = localStorage.getItem(key);
          const data = raw ? JSON.parse(raw) : null;
          if (!data?.updatedAt || isDraftEmpty(data) || now - data.updatedAt > maxAgeMs) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('[DraftStorage] Failed to prune stale drafts:', e);
  }
};
