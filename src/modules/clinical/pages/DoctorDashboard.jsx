import React, { useState, useMemo, useCallback } from 'react';
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

// Sub-components
import DoctorHeader from '../components/DoctorHeader';
import QueueDrawer from '../components/QueueDrawer';
import ActivePatientCard from '../components/ActivePatientCard';
import ClinicalFindingsCard from '../components/ClinicalFindingsCard';
import PrescriptionSheet from '../components/PrescriptionSheet';
import EmptyDoctorState from '../components/EmptyDoctorState';
import PatientHistoryModal from '../components/PatientHistoryModal';
import DoctorBillableServices from '../components/DoctorBillableServices';

export default function DoctorDashboard() {
  const { activeBranch, user } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Main Branch';
  const doctorId = user?.id;

  // ── Queue data ───────────────────────────────────────────────
  const { data: queueItems = [], isLoading: queueLoading } =
    useLiveQueueQuery(branchId, doctorId);
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

  // ── Consultation state ───────────────────────────────────────
  const consultation = useDoctorConsultation();
  const completeConsultationMutation = useCompleteConsultationMutation();

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
  }, [consultation.resetConsultation]);

  useQueueWebSocket(branchId, onPatientCalled);

  const handleNextPatient = useCallback(() => {
    if (!branchId || callNextMutation.isPending) return;
    callNextMutation.mutate({ branch_id: branchId, doctor_id: doctorId }, {
      onSuccess: () => consultation.resetConsultation(),
    });
  }, [branchId, doctorId, callNextMutation, consultation.resetConsultation]);

  const handleCompleteExamination = useCallback(() => {
    if (!activeQueueItem || completeConsultationMutation.isPending) return;

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
        setTimeout(() => {
          consultation.resetConsultation();
        }, 2000);
      },
    });
  }, [
    activeQueueItem,
    branchId,
    consultation,
    chronicDiseases,
    completeConsultationMutation,
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <DoctorHeader
        branchName={branchName}
        activeBranchName={branchName}
        activeQueueItem={activeQueueItem}
        activePatient={activeQueueItem?.patient}
        waitingItems={waitingItems || []}
        waitingCount={waitingItems?.length || 0}
        isQueueOpen={isQueueOpen}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        onNextPatient={handleNextPatient}
        isCallingNext={callNextMutation.isPending}
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
              medications={consultation.medications}
              onAddMedication={consultation.addMedication}
              onRemoveMedication={consultation.removeMedication}
              onUpdateMedication={consultation.updateMedication}
              generalAdvice={consultation.generalAdvice}
              onUpdateAdvice={consultation.setGeneralAdvice}
              followUpDate={consultation.followUpDate}
              onUpdateFollowUpDate={consultation.setFollowUpDate}
              isPrescriptionSaved={consultation.isPrescriptionSaved}
              onSavePrescription={handleCompleteExamination}
              isSaving={completeConsultationMutation.isPending}
              activePatient={activeQueueItem?.patient}
              doctorName={user?.name || 'Dr.'}
              clinicName={branchName}
            />

            {/* Section 1.5: Extra Billable Clinical Procedures (ECG, Ultrasound, etc.) */}
            <DoctorBillableServices
              appointmentId={activeQueueItem?.appointment_id}
              branchId={branchId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
