import React, { useState, useMemo, useCallback, useEffect } from 'react';
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

  // Populate active encounter data into consultation state if recovered + LocalStorage rehydrate
  useEffect(() => {
    if (!activeEncounterId) return;
    const storageKey = `clinic_draft_${activeEncounterId}`;

    // 1. Try local storage first if power was lost
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chiefComplaint && !consultation.clinicalNotes.chiefComplaint) {
          consultation.updateClinicalNote('chiefComplaint', parsed.chiefComplaint);
        }
        if (parsed.examinationFindings && !consultation.clinicalNotes.examinationFindings) {
          consultation.updateClinicalNote('examinationFindings', parsed.examinationFindings);
        }
      }
    } catch (e) {
      console.warn('Failed to parse local draft:', e);
    }

    // 2. Populate active encounter from backend if fields still empty
    if (activeEncounter) {
      if (activeEncounter.chief_complaint && !consultation.clinicalNotes.chiefComplaint) {
        consultation.updateClinicalNote('chiefComplaint', activeEncounter.chief_complaint);
      }
      if (activeEncounter.clinical_examination && !consultation.clinicalNotes.examinationFindings) {
        consultation.updateClinicalNote('examinationFindings', activeEncounter.clinical_examination);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEncounterId, activeEncounter]);

  // Debounced auto-save to localStorage on form changes
  useEffect(() => {
    if (!activeEncounterId) return;
    const storageKey = `clinic_draft_${activeEncounterId}`;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            chiefComplaint: consultation.clinicalNotes.chiefComplaint,
            examinationFindings: consultation.clinicalNotes.examinationFindings,
            vitals: consultation.vitals,
            diagnoses: consultation.finalDiagnoses,
            updatedAt: Date.now(),
          })
        );
      } catch (e) {
        console.warn('Failed to persist draft to localStorage:', e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    activeEncounterId,
    consultation.clinicalNotes,
    consultation.vitals,
    consultation.finalDiagnoses,
  ]);

  const abandonMutation = useMutation({
    mutationFn: ({ encounterId, reason }) => abandonEncounter(encounterId, reason),
    onSuccess: () => {
      if (activeEncounterId) {
        localStorage.removeItem(`clinic_draft_${activeEncounterId}`);
      }
      consultation.resetConsultation();
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
    consultation.resetConsultation();
    queryClient.invalidateQueries({ queryKey: ['encounter', 'active'] });
  }, [consultation, queryClient]);

  useQueueWebSocket(branchId, onPatientCalled);

  const isNextDisabled = Boolean(activeEncounter || activeQueueItem);

  const handleNextPatient = useCallback(() => {
    if (!branchId || callNextMutation.isPending || isNextDisabled) return;
    callNextMutation.mutate(
      { branch_id: branchId, doctor_id: doctorId },
      {
        onSuccess: () => {
          consultation.resetConsultation();
          queryClient.invalidateQueries({ queryKey: ['encounter', 'active'] });
        },
      }
    );
  }, [branchId, doctorId, callNextMutation, isNextDisabled, consultation, queryClient]);

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
    const chiefComplaint = consultation.clinicalNotes.chiefComplaint?.trim() || 'ÙƒØ´Ù ÙˆØ§Ø³ØªØ´Ø§Ø±Ø© Ø·Ø¨ÙŠØ©';

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
        if (activeEncounterId) {
          try {
            localStorage.removeItem(`clinic_draft_${activeEncounterId}`);
          } catch (e) {
            console.warn('Failed to clear draft from localStorage:', e);
          }
        }
        consultation.setIsPrescriptionSaved(true);
        setTimeout(() => {
          consultation.resetConsultation();
          queryClient.invalidateQueries({ queryKey: ['encounter', 'active'] });
          queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
        }, 1500);
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || error?.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„ÙƒØ´Ù';
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
                onUpdateAdvice={consultation.setGeneralAdvice}
                followUpDate={consultation.followUpDate}
                onUpdateFollowUpDate={consultation.setFollowUpDate}
                isPrescriptionSaved={consultation.isPrescriptionSaved}
                onCompleteExamination={handleCompleteExamination}
                isSaving={completeConsultationMutation.isPending}
                activePatient={activeQueueItem?.patient}
                doctorName={user?.name || 'Dr.'}
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
