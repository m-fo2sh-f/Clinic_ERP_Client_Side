import { useState, useCallback, useMemo } from 'react';
import { normalizeVitals } from '../../clinical/services/encounterDraftStorage';

/**
 * useSoloConsultation — Single Responsibility Hook
 * Manages clinical consultation state: complaints, examination, diagnoses, vitals,
 * digital prescriptions, billable services, and confidential notes.
 */
export default function useSoloConsultation() {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalExamination, setClinicalExamination] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [currentDiagnosisInput, setCurrentDiagnosisInput] = useState('');
  const [vitals, setVitals] = useState({});
  const [privateNotes, setPrivateNotes] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // ── 1. Vitals Management & Auto-Formatting ──────────────────────
  const updateVital = useCallback((field, value) => {
    setVitals((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleBloodPressureChange = useCallback((e) => {
    const rawVal = e.target.value;
    const clean = rawVal.replace(/[^\d/]/g, '');
    const digitsOnly = clean.replace(/\D/g, '');

    let formatted = clean;
    if (digitsOnly.length === 3 && !clean.includes('/')) {
      formatted = `${digitsOnly}/`;
    } else if (digitsOnly.length > 3 && !clean.includes('/')) {
      formatted = `${digitsOnly.slice(0, 3)}/${digitsOnly.slice(3, 6)}`;
    }

    setVitals((prev) => ({
      ...prev,
      bloodPressure: formatted,
    }));
  }, []);

  // Real-time BMI calculation
  const bmi = useMemo(() => {
    const weight = parseFloat(vitals?.weight);
    const height = parseFloat(vitals?.height);
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const val = weight / (heightInMeters * heightInMeters);
      return val.toFixed(1);
    }
    return null;
  }, [vitals?.weight, vitals?.height]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const num = parseFloat(bmi);
    if (num < 18.5) return { label: 'نقص في الوزن (Underweight)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (num < 25) return { label: 'وزن مثالي (Normal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (num < 30) return { label: 'زيادة في الوزن (Overweight)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'سمنة (Obese)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  }, [bmi]);

  // ── 2. Diagnoses Tag Handlers ──────────────────────────────────
  const addDiagnosis = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ',') && currentDiagnosisInput.trim()) {
      e.preventDefault();
      const val = currentDiagnosisInput.trim();
      setDiagnoses((prev) => (prev.includes(val) ? prev : [...prev, val]));
      setCurrentDiagnosisInput('');
    }
  }, [currentDiagnosisInput]);

  const removeDiagnosis = useCallback((tag) => {
    setDiagnoses((prev) => prev.filter((d) => d !== tag));
  }, []);

  // ── 3. Digital Prescription (Medications) Handlers ─────────────
  const addMedication = useCallback(() => {
    setMedications((prev) => [
      ...prev,
      {
        drug_name: '',
        dose: '1 قرص',
        frequency: 'كل 12 ساعة',
        duration: '5 أيام',
        instruction: 'بعد الأكل',
      },
    ]);
  }, []);

  const updateMedication = useCallback((index, field, value) => {
    setMedications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeMedication = useCallback((index) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── 4. Services Checklist Handlers ─────────────────────────────
  const addService = useCallback((service) => {
    if (!service) return;
    setSelectedServices((prev) => {
      if (prev.some((s) => s.service_id === service.id)) return prev;
      return [
        ...prev,
        {
          service_id: service.id,
          price: Number(service.price ?? service.default_price ?? 0),
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeService = useCallback((serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s.service_id !== serviceId));
  }, []);

  // ── 5. Form Snapshot Getter for Draft Auto-Save ────────────────
  const getFormData = useCallback(() => {
    return {
      chief_complaint: chiefComplaint,
      clinical_examination: clinicalExamination,
      diagnosis: diagnoses,
      vitals,
      private_notes: privateNotes,
      medications: medications.filter((m) => m.drug_name && m.drug_name.trim() !== ''),
      services: selectedServices,
    };
  }, [chiefComplaint, clinicalExamination, diagnoses, vitals, privateNotes, medications, selectedServices]);

  // ── 6. Draft Rehydration from LocalStorage or Backend Encounter 
  const rehydrateFromDraft = useCallback((localDraft, enc) => {
    // A. Chief Complaint
    const cc =
      localDraft?.chief_complaint ||
      localDraft?.chiefComplaint ||
      enc?.chief_complaint ||
      '';
    setChiefComplaint(cc);

    // B. Examination Findings
    const exam =
      localDraft?.clinical_examination ||
      localDraft?.examinationFindings ||
      enc?.clinical_examination ||
      '';
    setClinicalExamination(exam);

    // C. Vitals
    const rawVitals = localDraft?.vitals || enc?.vitals || {};
    setVitals(normalizeVitals(rawVitals));

    // D. Diagnoses
    const draftDiag = localDraft?.diagnosis || localDraft?.diagnoses;
    if (Array.isArray(draftDiag) && draftDiag.length > 0) {
      setDiagnoses(
        draftDiag.map((d) => (typeof d === 'object' && d !== null ? d.description || d.name || d.label : d))
      );
    } else if (Array.isArray(enc?.diagnosis)) {
      setDiagnoses(
        enc.diagnosis.map((d) => (typeof d === 'object' && d !== null ? d.description || d.name || d.label : d))
      );
    } else {
      setDiagnoses([]);
    }

    // E. Private Notes
    const notes = localDraft?.private_notes || enc?.private_notes || '';
    setPrivateNotes(notes);

    // F. Medications
    const draftMeds = localDraft?.medications;
    if (Array.isArray(draftMeds) && draftMeds.length > 0) {
      setMedications(draftMeds);
    } else if (enc?.prescription?.items?.length) {
      setMedications(
        enc.prescription.items.map((i) => ({
          drug_name: i.drug_name,
          dose: i.dose,
          frequency: i.frequency,
          duration: i.duration,
          instruction: i.instruction,
        }))
      );
    } else {
      setMedications([]);
    }

    // G. Selected Services
    const draftServices = localDraft?.services;
    if (Array.isArray(draftServices) && draftServices.length > 0) {
      setSelectedServices(draftServices);
    } else {
      setSelectedServices([]);
    }
  }, []);

  // ── 7. Reset Form ──────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setChiefComplaint('');
    setClinicalExamination('');
    setDiagnoses([]);
    setCurrentDiagnosisInput('');
    setVitals({});
    setPrivateNotes('');
    setMedications([]);
    setSelectedServices([]);
  }, []);

  return {
    chiefComplaint,
    setChiefComplaint,
    clinicalExamination,
    setClinicalExamination,
    diagnoses,
    setDiagnoses,
    currentDiagnosisInput,
    setCurrentDiagnosisInput,
    addDiagnosis,
    removeDiagnosis,
    vitals,
    setVitals,
    updateVital,
    handleBloodPressureChange,
    bmi,
    bmiCategory,
    privateNotes,
    setPrivateNotes,
    medications,
    setMedications,
    addMedication,
    updateMedication,
    removeMedication,
    selectedServices,
    setSelectedServices,
    addService,
    removeService,
    getFormData,
    rehydrateFromDraft,
    resetForm,
  };
}
