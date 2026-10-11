import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBranchContext } from '../../../context/BranchContext';
import {
  useLiveQueueQuery,
  useCallNextPatientMutation,
  usePatientHistoryQuery,
} from '../../queue/hooks/useQueue';
import { useQueueWebSocket } from '../../queue/hooks/useQueueWebSocket';
import useDoctorConsultation, {
  useCompleteConsultationMutation,
} from '../hooks/useDoctorConsultation';
import { getActiveEncounter, abandonEncounter } from '../api/encounterApi';

// Sub-components
import DoctorHeader from '../components/DoctorHeader';
import QueueDrawer from '../components/QueueDrawer';
import ActivePatientCard from '../components/ActivePatientCard';
import ClinicalFindingsCard from '../components/ClinicalFindingsCard';
import PrescriptionSheet from '../components/PrescriptionSheet';
import EmptyDoctorState from '../components/EmptyDoctorState';
import PatientHistoryModal from '../components/PatientHistoryModal';
import DoctorBillableServices from '../components/DoctorBillableServices';
import ErrorBoundary from '../../../components/ui/ErrorBoundary';
import {
  loadEncounterDraft,
  saveEncounterDraft,
  clearEncounterDraft,
  pruneStaleEncounterDrafts,
  normalizeVitals,
  hasAnyVitalValue,
  isDraftEmpty,
} from '../services/encounterDraftStorage';

export default function DoctorDashboard() {
  const { activeBranch, user } = useBranchContext();
  const queryClient = useQueryClient();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Main Branch';
  const doctorId = user?.id;

  // â”€â”€ Session Recovery: Active In-Progress Encounter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: activeEncounterData, isLoading: encounterLoading } = useQuery({
    queryKey: ['encounter', 'active', doctorId, branchId],
    queryFn: async () => {
      const res = await getActiveEncounter(branchId);
      return res?.data || null;
    },
    enabled: !!branchId && !!doctorId,
    staleTime: 1000 * 30, // 30s freshness
  });

  const activeEncounter = activeEncounterData || null;

  // â”€â”€ Queue data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: queueItems = [], isLoading: queueLoading } =
    useLiveQueueQuery(branchId, doctorId);
  const callNextMutation = useCallNextPatientMutation();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const activeQueueItem = useMemo(
    () => {
      if (activeEncounter) {
        const matchingQueue = queueItems.find(
          (item) => item.encounter_id === activeEncounter.id || item.patient_id === activeEncounter.patient_id
        );
        if (matchingQueue) return matchingQueue;
        return {
          id: activeEncounter.id,
          encounter_id: activeEncounter.id,
          appointment_id: activeEncounter.appointment_id,
          patient: activeEncounter.patient,
          patient_id: activeEncounter.patient_id,
          status: 'under_examination',
          queue_no: 1,
        };
      }
      return queueItems.find((item) => item.status === 'under_examination');
    },
    [queueItems, activeEncounter]
  );

  const activePatient = activeEncounter?.patient || activeQueueItem?.patient || null;
  const activePatientId = activePatient?.id || null;

  const waitingItems = useMemo(
    () => queueItems.filter((item) => item.status === 'checked_in'),
    [queueItems]
  );

  // â”€â”€ Patient history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: patientHistory, isLoading: historyLoading } =
    usePatientHistoryQuery(activePatientId);

  // â”€â”€ Consultation state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const consultation = useDoctorConsultation();
  const completeConsultationMutation = useCompleteConsultationMutation();

  const activeEncounterId = activeEncounter?.id || activeQueueItem?.encounter_id;

  // Prune expired or old session drafts on mount / encounter change
  useEffect(() => {
    pruneStaleEncounterDrafts(activeEncounterId);
  }, [activeEncounterId]);

  // Populate active encounter data into consultation state if recovered + LocalStorage rehydrate
  useEffect(() => {
    if (!activeEncounterId) return;

    // 1. Rehydrate from local draft if user refreshed or navigated back
    const localDraft = loadEncounterDraft(activeEncounterId);

    // A. Chief Complaint
    const chiefComplaint =
      localDraft?.chiefComplaint ||
      activeEncounter?.chief_complaint ||
      '';
    if (chiefComplaint && !consultation.clinicalNotes.chiefComplaint) {
      consultation.updateClinicalNote('chiefComplaint', chiefComplaint);
    }

    // B. Examination Findings
    const examinationFindings =
      localDraft?.examinationFindings ||
      activeEncounter?.clinical_examination ||
      '';
    if (examinationFindings && !consultation.clinicalNotes.examinationFindings) {
      consultation.updateClinicalNote('examinationFindings', examinationFindings);
    }

    // C. Vitals (restored from local draft or backend encounter)
    const rawVitals = localDraft?.vitals || activeEncounter?.vitals;
    if (rawVitals) {
      const normalized = normalizeVitals(rawVitals);
      if (hasAnyVitalValue(normalized)) {
        consultation.updateAllVitals(normalized);
      }
    }

    // D. Diagnoses
    const draftDiagnoses =
      localDraft?.diagnoses ||
      (Array.isArray(activeEncounter?.diagnosis)
        ? activeEncounter.diagnosis.map((d) => (typeof d === 'object' && d !== null ? d.description || d.name || d.label : d))
        : []);
    if (Array.isArray(draftDiagnoses) && draftDiagnoses.length > 0 && consultation.finalDiagnoses.length === 0) {
      consultation.setFinalDiagnoses(draftDiagnoses);
    }

    // E. Medications
    if (Array.isArray(localDraft?.medications) && localDraft.medications.length > 0 && consultation.medications.length === 0) {
      consultation.setMedications(localDraft.medications);
    }

    // F. General Advice & Follow-up
    if (localDraft?.generalAdvice && !consultation.generalAdvice) {
      consultation.setGeneralAdvice(localDraft.generalAdvice);
    }
    if (localDraft?.followUpDate && !consultation.followUpDate) {
      consultation.setFollowUpDate(localDraft.followUpDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEncounterId, activeEncounter]);

  // Track encounters that have been completed or abandoned to prevent re-creating draft keys on reset
  const finalizedEncountersRef = useRef(new Set());

  // Debounced auto-save to localStorage on form changes
  useEffect(() => {
    // Guard against saving after examination completion or while mutation is in progress
    if (
      !activeEncounterId ||
      finalizedEncountersRef.current.has(activeEncounterId) ||
      completeConsultationMutation.isPending ||
      consultation.isPrescriptionSaved
    ) {
      return;
    }

    const draftData = {
      chiefComplaint: consultation.clinicalNotes.chiefComplaint,
      examinationFindings: consultation.clinicalNotes.examinationFindings,
      vitals: consultation.vitals,
      diagnoses: consultation.finalDiagnoses,
      medications: consultation.medications,
      generalAdvice: consultation.generalAdvice,
      followUpDate: consultation.followUpDate,
    };

    // If the form has been reset or has no data, wipe the draft record and never write an empty key
    if (isDraftEmpty(draftData)) {
      clearEncounterDraft(activeEncounterId);
      return;
    }

    const timer = setTimeout(() => {
      // Re-verify guard inside timeout to avoid racing completion
      if (
        finalizedEncountersRef.current.has(activeEncounterId) ||
        completeConsultationMutation.isPending ||
        consultation.isPrescriptionSaved
      ) {
        return;
      }

      saveEncounterDraft(activeEncounterId, draftData);
    }, 800);

    return () => clearTimeout(timer);
  }, [
    activeEncounterId,
    consultation.clinicalNotes,
    consultation.vitals,
    consultation.finalDiagnoses,
    consultation.medications,
    consultation.generalAdvice,
    consultation.followUpDate,
    consultation.isPrescriptionSaved,
    completeConsultationMutation.isPending,
  ]);

  const abandonMutation = useMutation({
    mutationFn: ({ encounterId, reason }) => abandonEncounter(encounterId, reason),
    onSuccess: (_data, variables) => {
      if (variables?.encounterId) finalizedEncountersRef.current.add(variables.encounterId);
      if (activeEncounterId) finalizedEncountersRef.current.add(activeEncounterId);

      clearEncounterDraft(variables?.encounterId);
      clearEncounterDraft(activeEncounterId);
      consultation.resetConsultation();
      clearEncounterDraft(variables?.encounterId);
      clearEncounterDraft(activeEncounterId);
      queryClient.invalidateQueries({ queryKey: ['encounter', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
    },
  });

  const handleAbandon = useCallback(() => {
    const encounterId = activeEncounter?.id || activeQueueItem?.encounter_id;
    if (!encounterId) return;

    if (window.confirm('Are you sure you want to mark this patient as absent? The examination will be cancelled with no bill.')) {
      abandonMutation.mutate({
        encounterId,
        reason: 'Patient absent / no-show',
      });
    }
  }, [activeEncounter, activeQueueItem, abandonMutation]);

  const chronicDiseases = useMemo(() => {
    if (!patientHistory) return [];
    const diseases = [];
    if (patientHistory.chronic_diseases) {
      diseases.push(
        ...patientHistory.chronic_diseases
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
      );
    }
    return diseases;
  }, [patientHistory]);

  const onPatientCalled = useCallback(() => {
    if (activeEncounterId) {
      finalizedEncountersRef.current.add(activeEncounterId);
      clearEncounterDraft(activeEncounterId);
    }
    consultation.resetConsultation();
    queryClient.invalidateQueries({ queryKey: ['encounter', 'active'] });
  }, [activeEncounterId, consultation, queryClient]);

  useQueueWebSocket(branchId, onPatientCalled);

  const isNextDisabled = Boolean(activeEncounter || activeQueueItem);

  const handleNextPatient = useCallback(() => {
    if (!branchId || callNextMutation.isPending || isNextDisabled) return;
    callNextMutation.mutate(
      { branch_id: branchId, doctor_id: doctorId },
      {
        onSuccess: () => {
          if (activeEncounterId) {
            finalizedEncountersRef.current.add(activeEncounterId);
            clearEncounterDraft(activeEncounterId);
          }
          consultation.resetConsultation();
          queryClient.invalidateQueries({ queryKey: ['encounter', 'active'] });
        },
      }
    );
  }, [branchId, doctorId, callNextMutation, isNextDisabled, activeEncounterId, consultation, queryClient]);

  const handleCompleteExamination = useCallback(() => {
    console.log('handleCompleteExamination', activeEncounter);
    console.log('handleCompleteExamination', activeQueueItem);
    const encounterId = activeEncounter?.id || activeQueueItem?.encounter_id;
    if (!encounterId || completeConsultationMutation.isPending) return;

    // Auto-include pending diagnosis input that wasn't explicitly added
    const diagnoses = [...consultation.finalDiagnoses];
    if (consultation.diagnosisInput?.trim() && !diagnoses.includes(consultation.diagnosisInput.trim())) {
      diagnoses.push(consultation.diagnosisInput.trim());
    }

    // Use sensible default for chief complaint instead of blocking
    const chiefComplaint = consultation.clinicalNotes.chiefComplaint?.trim() || 'كشف واستشارة طبية';

    const payload = {
      encounterId,
      live_queue_id: activeQueueItem?.id,
      appointment_id: activeQueueItem?.appointment_id,
      patient_id: activePatientId,
      branch_id: branchId,
      chief_complaint: chiefComplaint,
      clinical_examination: consultation.clinicalNotes.examinationFindings || null,
      vitals: {
        blood_pressure: consultation.vitals.bloodPressure || null,
        heart_rate: consultation.vitals.heartRate || null,
        temperature: consultation.vitals.temperature || null,
        weight: consultation.vitals.weight || null,
        height: consultation.vitals.height || null,
        spo2: consultation.vitals.spo2 || null,
        blood_sugar: consultation.vitals.randomBloodSugar || null,
      },
      patient_updates: {
        blood_group: consultation.patientUpdates?.bloodGroup || null,
        chronic_diseases: Array.isArray(chronicDiseases) ? chronicDiseases.join(', ') : null,
        allergies: consultation.patientUpdates?.allergies || null,
      },
      diagnosis: diagnoses,
      medications: consultation.medications
        .filter((med) => (med.drug_name || med.name)?.trim())
        .map((med, index) => ({
          drug_name: med.drug_name || med.name,
          drug_id: med.drug_id || null,
          dose: med.dose || med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instruction: med.instruction || med.instructions || null,
          sort_order: index,
        })),
      general_advice: consultation.generalAdvice || null,
      follow_up_date: consultation.followUpDate || null,
    };

    completeConsultationMutation.mutate(payload, {
      onSuccess: () => {
        if (encounterId) finalizedEncountersRef.current.add(encounterId);
        if (activeEncounterId) finalizedEncountersRef.current.add(activeEncounterId);

        clearEncounterDraft(encounterId);
        clearEncounterDraft(activeEncounterId);
        pruneStaleEncounterDrafts();

        consultation.setIsPrescriptionSaved(true);
        setTimeout(() => {
          clearEncounterDraft(encounterId);
          clearEncounterDraft(activeEncounterId);

          consultation.resetConsultation();

          clearEncounterDraft(encounterId);
          clearEncounterDraft(activeEncounterId);
          queryClient.invalidateQueries({ queryKey: ['encounter', 'active'] });
          queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
        }, 1500);
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء حفظ الكشف';
        alert(msg);
      },
    });
  }, [
    activeEncounter,
    activeEncounterId,
    activeQueueItem,
    activePatientId,
    branchId,
    consultation,
    chronicDiseases,
    completeConsultationMutation,
    queryClient,
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <DoctorHeader
        branchName={branchName}
        activeBranchName={branchName}
        activeQueueItem={activeQueueItem}
        activePatient={activePatient}
        waitingItems={waitingItems || []}
        waitingCount={waitingItems?.length || 0}
        isQueueOpen={isQueueOpen}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        onNextPatient={handleNextPatient}
        isCallingNext={callNextMutation.isPending}
        isNextDisabled={isNextDisabled}
        onAbandon={handleAbandon}
        isAbandoning={abandonMutation.isPending}
        saveStatus={consultation.clinicalNotes.chiefComplaint ? 'Draft auto-saved' : null}
      />

      {isQueueOpen && (
        <QueueDrawer
          queueItems={queueItems}
          waitingItems={waitingItems}
          activeQueueItem={activeQueueItem}
          queueLoading={queueLoading}
          onClose={() => setIsQueueOpen(false)}
          onNextPatient={handleNextPatient}
          isCallingNext={callNextMutation.isPending}
        />
      )}

      <PatientHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        patientHistory={patientHistory}
        isLoading={historyLoading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 no-print">
        {!activeQueueItem ? (
          <EmptyDoctorState
            onNextPatient={handleNextPatient}
            isCallingNext={callNextMutation.isPending}
            onOpenQueue={() => setIsQueueOpen(true)}
            waitingCount={waitingItems.length}
          />
        ) : (
          <div className="space-y-6">
            {/* Section 1: Patient Demographics */}
            <ErrorBoundary title="Ø®Ø·Ø£ ÙÙŠ Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø±ÙŠØ¶">
              <ActivePatientCard
                activeQueueItem={activeQueueItem}
                historyLoading={historyLoading}
                patientHistory={patientHistory}
                chronicDiseases={chronicDiseases}
                onOpenHistory={() => setIsHistoryOpen(true)}
              />
            </ErrorBoundary>

            {/* Section 2: Clinical findings, vitals & diagnosis */}
            <ErrorBoundary title="Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ÙØ­Øµ Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ ÙˆØ§Ù„ØªØ´Ø®ÙŠØµ">
              <ClinicalFindingsCard
                vitals={consultation.vitals}
                onUpdateVital={consultation.updateVital}
                clinicalNotes={consultation.clinicalNotes}
                onUpdateNote={consultation.updateClinicalNote}
                finalDiagnoses={consultation.finalDiagnoses}
                diagnosisInput={consultation.diagnosisInput}
                onDiagnosisInputChange={consultation.setDiagnosisInput}
                showDiagnosisDropdown={consultation.showDiagnosisDropdown}
                onShowDropdown={() => consultation.setShowDiagnosisDropdown(true)}
                diagnosisContainerRef={consultation.diagnosisContainerRef}
                filteredDiagnoses={consultation.filteredDiagnoses}
                onAddDiagnosis={consultation.addDiagnosis}
                onRemoveDiagnosis={consultation.removeDiagnosis}
                onDiagnosisKeyDown={consultation.handleDiagnosisKeyDown}
              />
            </ErrorBoundary>

            {/* Section 3: Prescription sheet */}
            <ErrorBoundary title="Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø±ÙˆØ´ØªØ© Ø§Ù„Ø·Ø¨ÙŠØ©">
              <PrescriptionSheet
                medications={consultation.medications}
                onAddMedication={consultation.addMedication}
                onRemoveMedication={consultation.removeMedication}
                onUpdateMedication={consultation.updateMedication}
                generalAdvice={consultation.generalAdvice}
                onGeneralAdviceChange={consultation.setGeneralAdvice}
                onUpdateAdvice={consultation.setGeneralAdvice}
                followUpDate={consultation.followUpDate}
                onFollowUpDateChange={consultation.setFollowUpDate}
                onUpdateFollowUpDate={consultation.setFollowUpDate}
                isPrescriptionSaved={consultation.isPrescriptionSaved}
                onCompleteExamination={handleCompleteExamination}
                isSubmitting={completeConsultationMutation.isPending}
                isSaving={completeConsultationMutation.isPending}
                activePatient={activeQueueItem?.patient}
                doctorName={user?.name || 'Dr.'}
                branchName={branchName}
                clinicName={branchName}
              />
            </ErrorBoundary>

            {/* Section 1.5: Extra Billable Clinical Procedures (ECG, Ultrasound, etc.) */}
            <ErrorBoundary title="Ø®Ø·Ø£ ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø¥Ø¶Ø§ÙÙŠØ©">
              <DoctorBillableServices
                appointmentId={activeQueueItem?.appointment_id}
                queueId={activeQueueItem?.id}
                encounterId={activeEncounterId}
                branchId={branchId}
                isEncounterLoading={encounterLoading}
              />
            </ErrorBoundary>
          </div>
        )}
      </main>
    </div>
  );
}
