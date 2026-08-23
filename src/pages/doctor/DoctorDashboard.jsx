import React, { useState, useMemo, useCallback } from 'react';
import { useBranchContext } from '../../context/BranchContext';
import {
  useLiveQueueQuery,
  useCallNextPatientMutation,
  usePatientHistoryQuery,
} from '../../hooks/useQueue';
import { useQueueWebSocket } from '../../hooks/useQueueWebSocket';
import useDoctorConsultation, {
  useCompleteConsultationMutation,
} from '../../hooks/useDoctorConsultation';

// Sub-components
import DoctorHeader from '../../components/doctor/DoctorHeader';
import QueueDrawer from '../../components/doctor/QueueDrawer';
import ActivePatientCard from '../../components/doctor/ActivePatientCard';
import ClinicalFindingsCard from '../../components/doctor/ClinicalFindingsCard';
import PrescriptionSheet from '../../components/doctor/PrescriptionSheet';
import EmptyDoctorState from '../../components/doctor/EmptyDoctorState';
import PatientHistoryModal from '../../components/doctor/PatientHistoryModal';

/**
 * DoctorDashboard — orchestrator / container component.
 *
 * Composes the doctor examination console from dedicated sub-components
 * and delegates all consultation state to the `useDoctorConsultation` hook.
 */
export default function DoctorDashboard() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Main Branch';

  // ── Queue data ───────────────────────────────────────────────
  const { data: queueItems = [], isLoading: queueLoading } =
    useLiveQueueQuery(branchId);
  const callNextMutation = useCallNextPatientMutation();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const activeQueueItem = useMemo(
    () => queueItems.find((item) => item.status === 'under_examination'),
    [queueItems]
  );
  const activePatientId = activeQueueItem?.patient?.id || null;

  const waitingItems = useMemo(
    () => queueItems.filter((item) => item.status === 'checked_in'),
    [queueItems]
  );

  // ── Patient history ──────────────────────────────────────────
  const { data: patientHistory, isLoading: historyLoading } =
    usePatientHistoryQuery(activePatientId);

  // ── Consultation state (custom hook) ─────────────────────────
  const consultation = useDoctorConsultation();

  // ── Complete Consultation mutation ───────────────────────────
  const completeConsultationMutation = useCompleteConsultationMutation();

  // ── Chronic diseases derived from real patient data ──────────
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

  // ── WebSocket real-time sync ─────────────────────────────────
  const onPatientCalled = useCallback(() => {
    consultation.resetConsultation();
  }, [consultation.resetConsultation]);

  useQueueWebSocket(branchId, onPatientCalled);

  // ── Call next patient ────────────────────────────────────────
  const handleNextPatient = useCallback(() => {
    if (!branchId || callNextMutation.isPending) return;
    callNextMutation.mutate(branchId, {
      onSuccess: () => consultation.resetConsultation(),
    });
  }, [branchId, callNextMutation, consultation.resetConsultation]);

  // ── Complete Examination ─────────────────────────────────────
  const handleCompleteExamination = useCallback(() => {
    if (!activeQueueItem || completeConsultationMutation.isPending) return;

    // Validate minimum required fields on the client
    if (!consultation.clinicalNotes.chiefComplaint.trim()) {
      alert('Please enter the Chief Complaint before completing.');
      return;
    }
    if (consultation.finalDiagnoses.length === 0) {
      alert('Please add at least one Diagnosis before completing.');
      return;
    }

    const payload = {
      live_queue_id: activeQueueItem.id,
      appointment_id: activeQueueItem.appointment_id,
      patient_id: activeQueueItem.patient?.id,
      branch_id: branchId,
      chief_complaint: consultation.clinicalNotes.chiefComplaint,
      examination_findings: consultation.clinicalNotes.examinationFindings || null,
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
      diagnoses: consultation.finalDiagnoses,
      medications: consultation.medications
        .filter((med) => med.name?.trim())
        .map((med, index) => ({
          name: med.name,
          drug_id: med.drug_id || null,
          dosage: med.dosage || med.dose || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || med.instruction || null,
          sort_order: index,
        })),
      general_advice: consultation.generalAdvice || null,
      follow_up_date: consultation.followUpDate || null,
    };

    completeConsultationMutation.mutate(payload, {
      onSuccess: () => {
        consultation.setIsPrescriptionSaved(true);
        // Auto-reset after a brief visual confirmation
        setTimeout(() => {
          consultation.resetConsultation();
        }, 2000);
      },
      onError: (error) => {
        const message =
          error?.response?.data?.message || 'Failed to complete consultation.';
        alert(message);
      },
    });
  }, [
    activeQueueItem,
    branchId,
    chronicDiseases,
    consultation,
    completeConsultationMutation,
  ]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-16">
      {/* Print-only styles for Rx prescription sheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-rx-sheet, #printable-rx-sheet * {
            visibility: visible;
          }
          #printable-rx-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <DoctorHeader
        branchName={branchName}
        activeQueueItem={activeQueueItem}
        waitingItems={waitingItems}
        isQueueOpen={isQueueOpen}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        onNextPatient={handleNextPatient}
        isCallingNext={callNextMutation.isPending}
      />

      {/* Queue Drawer */}
      {isQueueOpen && (
        <QueueDrawer
          queueItems={queueItems}
          waitingItems={waitingItems}
          queueLoading={queueLoading}
          onClose={() => setIsQueueOpen(false)}
          onNextPatient={handleNextPatient}
          isCallingNext={callNextMutation.isPending}
        />
      )}

      {/* Patient History Modal */}
      <PatientHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        patientHistory={patientHistory}
        isLoading={historyLoading}
      />

      {/* Main content area */}
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
            {/* Section 1: Patient demographics & chronic diseases */}
            <ActivePatientCard
              activeQueueItem={activeQueueItem}
              historyLoading={historyLoading}
              patientHistory={patientHistory}
              chronicDiseases={chronicDiseases}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />

            {/* Section 2: Clinical findings, vitals & diagnosis */}
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

            {/* Section 3: Prescription sheet */}
            <PrescriptionSheet
              branchName={branchName}
              medications={consultation.medications}
              onAddMedication={consultation.addMedication}
              onUpdateMedication={consultation.updateMedication}
              onRemoveMedication={consultation.removeMedication}
              generalAdvice={consultation.generalAdvice}
              onGeneralAdviceChange={consultation.setGeneralAdvice}
              followUpDate={consultation.followUpDate}
              onFollowUpDateChange={consultation.setFollowUpDate}
              isPrescriptionSaved={consultation.isPrescriptionSaved}
              isSubmitting={completeConsultationMutation.isPending}
              onCompleteExamination={handleCompleteExamination}
            />
          </div>
        )}
      </main>
    </div>
  );
}
