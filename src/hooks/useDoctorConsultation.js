import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DIAGNOSIS_DICTIONARY } from '../constants/medicalDiagnoses';
import { consultationService } from '../services/consultationService';
import { markQueryInvalidated, debouncedInvalidate } from '../utils/invalidationTracker';

/**
 * Custom hook that encapsulates all doctor consultation state and handlers.
 *
 * Manages:
 * - Clinical notes (chief complaint & examination findings)
 * - Final diagnoses (autocomplete multi-tag)
 * - Medications (dynamic Rx rows)
 * - General advice text
 * - Follow-up date
 * - Prescription saved flag
 */
export default function useDoctorConsultation() {
  // ── Clinical Notes ───────────────────────────────────────────
  const [clinicalNotes, setClinicalNotes] = useState({
    chiefComplaint: '',
    examinationFindings: '',
  });

  const updateClinicalNote = useCallback((field, value) => {
    setClinicalNotes((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Diagnosis Autocomplete Multi-Tag ─────────────────────────
  const [finalDiagnoses, setFinalDiagnoses] = useState([]);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);
  const diagnosisContainerRef = useRef(null);

  const filteredDiagnoses = useMemo(() => {
    if (!diagnosisInput.trim()) return DIAGNOSIS_DICTIONARY;
    const query = diagnosisInput.trim().toLowerCase();
    return DIAGNOSIS_DICTIONARY.filter(
      (item) => item.toLowerCase().includes(query) && !finalDiagnoses.includes(item)
    );
  }, [diagnosisInput, finalDiagnoses]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        diagnosisContainerRef.current &&
        !diagnosisContainerRef.current.contains(event.target)
      ) {
        setShowDiagnosisDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addDiagnosis = useCallback(
    (value) => {
      const val = value.trim();
      if (val && !finalDiagnoses.includes(val)) {
        setFinalDiagnoses((prev) => [...prev, val]);
      }
      setDiagnosisInput('');
      setShowDiagnosisDropdown(false);
    },
    [finalDiagnoses]
  );

  const removeDiagnosis = useCallback((tagToRemove) => {
    setFinalDiagnoses((prev) => prev.filter((item) => item !== tagToRemove));
  }, []);

  const removeLastDiagnosis = useCallback(() => {
    setFinalDiagnoses((prev) => prev.slice(0, -1));
  }, []);

  const handleDiagnosisKeyDown = useCallback(
    (e) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (filteredDiagnoses.length > 0 && diagnosisInput.trim().length > 0) {
          e.preventDefault();
          addDiagnosis(filteredDiagnoses[0]);
        } else if (diagnosisInput.trim().length > 0) {
          e.preventDefault();
          addDiagnosis(diagnosisInput);
        }
      } else if (e.key === 'Backspace' && !diagnosisInput && finalDiagnoses.length > 0) {
        removeLastDiagnosis();
      }
    },
    [filteredDiagnoses, diagnosisInput, finalDiagnoses, addDiagnosis, removeLastDiagnosis]
  );

  // ── Medications ──────────────────────────────────────────────
  const [medications, setMedications] = useState([]);

  const addMedication = useCallback(() => {
    const newMed = {
      id: Date.now(),
      name: '',
      dose: '',
      dosage: '',
      frequency: '',
      duration: '',
      instruction: '',
      instructions: '',
    };
    setMedications((prev) => [...prev, newMed]);
  }, []);

  const updateMedication = useCallback((id, field, value) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  }, []);

  const removeMedication = useCallback((id) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  }, []);

  // ── Vital Signs State ───────────────────────────────────────
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    spo2: '',
    randomBloodSugar: '',
  });

  const updateVital = useCallback((field, value) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Advice & Follow-up ──────────────────────────────────────
  const [generalAdvice, setGeneralAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isPrescriptionSaved, setIsPrescriptionSaved] = useState(false);

  // ── Reset (on next patient call) ────────────────────────────
  const resetConsultation = useCallback(() => {
    setClinicalNotes({ chiefComplaint: '', examinationFindings: '' });
    setVitals({
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      spo2: '',
      randomBloodSugar: '',
    });
    setFinalDiagnoses([]);
    setDiagnosisInput('');
    setMedications([]);
    setGeneralAdvice('');
    setFollowUpDate('');
    setIsPrescriptionSaved(false);
  }, []);

  return {
    // Clinical notes
    clinicalNotes,
    updateClinicalNote,

    // Vitals
    vitals,
    updateVital,

    // Diagnosis autocomplete
    finalDiagnoses,
    diagnosisInput,
    setDiagnosisInput,
    showDiagnosisDropdown,
    setShowDiagnosisDropdown,
    diagnosisContainerRef,
    filteredDiagnoses,
    addDiagnosis,
    removeDiagnosis,
    handleDiagnosisKeyDown,

    // Medications
    medications,
    addMedication,
    updateMedication,
    removeMedication,

    // Advice & follow-up
    generalAdvice,
    setGeneralAdvice,
    followUpDate,
    setFollowUpDate,

    // Prescription state
    isPrescriptionSaved,
    setIsPrescriptionSaved,

    // Reset
    resetConsultation,
  };
}

/**
 * React Query mutation for completing a doctor consultation.
 * Submits the full clinical payload and invalidates all related caches on success.
 */
export function useCompleteConsultationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => consultationService.completeConsultation(payload),
    onMutate: () => markQueryInvalidated(),
    onSuccess: (_data, variables) => {
      markQueryInvalidated();
      debouncedInvalidate(queryClient, [
        ['liveQueue'],
        ['appointments'],
        ['patientHistory', variables.patient_id],
      ], 100);
    },
  });
}

