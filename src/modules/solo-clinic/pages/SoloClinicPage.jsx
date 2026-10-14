import React from 'react';
import { X } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';

// Dedicated Solo Clinic Components (SRP)
import SoloHeader from '../components/SoloHeader';
import SoloEmptyState from '../components/SoloEmptyState';
import SoloVitalsCard from '../components/SoloVitalsCard';
import SoloClinicalNotesCard from '../components/SoloClinicalNotesCard';
import SoloPrescriptionCard from '../components/SoloPrescriptionCard';
import SoloBillingCard from '../components/SoloBillingCard';

// Reusable Shared Clinic Components (DRY)
import ActivePatientCard from '../../clinical/components/ActivePatientCard';
import PatientHistoryModal from '../../clinical/components/PatientHistoryModal';
import PaymentCheckoutModal from '../../clinical/components/PaymentCheckoutModal';
import TodayEncountersDrawer from '../../clinical/components/TodayEncountersDrawer';
import SoloWalkInModal from '../../clinical/components/SoloWalkInModal';

// Dedicated Custom Hooks (Separation of Concerns)
import useSoloConsultation from '../hooks/useSoloConsultation';
import useSoloSession from '../hooks/useSoloSession';
import useClinicServices from '../hooks/useClinicServices';

/**
 * SoloClinicPage — Main Orchestration Page for Solo Practice Mode
 * Coordinates session lifecycle, clinical inputs, and financial checkout
 * adhering to SOLID principles and Clean Architecture.
 */
export default function SoloClinicPage() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;

  // 1. Clinical State & Form Management
  const consultation = useSoloConsultation();

  // 2. Session Lifecycle, Recovery, and Persistence
  const session = useSoloSession({
    getFormData: consultation.getFormData,
    rehydrateFromDraft: consultation.rehydrateFromDraft,
    resetForm: consultation.resetForm,
  });

  // 3. Billing & Catalog Services
  const { availableServices, consultationFee } = useClinicServices(branchId);

  const activePatient = session.activePatient || session.activeEncounter?.patient;

  // Format chronic diseases safely for the patient header card
  const chronicDiseases =
    session.patientHistory?.chronic_diseases
      ? session.patientHistory.chronic_diseases.split(',').map((d) => d.trim()).filter(Boolean)
      : activePatient?.chronic_diseases
      ? activePatient.chronic_diseases.split(',').map((d) => d.trim()).filter(Boolean)
      : [];

  return (
    <div className="space-y-6">
      {/* Action Notification Alert */}
      {session.actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{session.actionNotice.text}</span>
          <button
            type="button"
            onClick={() => session.setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Actions Bar */}
      <SoloHeader
        onOpenWalkIn={() => session.setIsWalkInModalOpen(true)}
        onOpenTodayEncounters={() => session.setIsTodayDrawerOpen(true)}
        todayEncountersCount={session.todaySummary?.total_encounters || 0}
        hasActiveEncounter={Boolean(session.activeEncounter)}
        isSaving={session.isSaving}
        lastSavedAt={session.lastSavedAt}
      />

      {/* Main Workspace Body */}
      {!session.activeEncounter ? (
        <SoloEmptyState onOpenWalkIn={() => session.setIsWalkInModalOpen(true)} />
      ) : (
        <div className="space-y-6">
          {/* Active Patient Card Banner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                بيانات المريض والجلسة الطبية النشطة
              </span>
              <button
                type="button"
                onClick={session.abandonSession}
                className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
                title="إلغاء الجلسة الحالية والعودة للشاشة الرئيسية"
              >
                <X className="h-3.5 w-3.5" />
                إلغاء جلسة الكشف
              </button>
            </div>

            <ActivePatientCard
              activeQueueItem={{
                patient: activePatient,
                encounter_id: session.activeEncounter?.id,
                status: 'under_examination',
              }}
              historyLoading={session.historyLoading}
              patientHistory={session.patientHistory}
              chronicDiseases={chronicDiseases}
              onOpenHistory={() => session.setIsHistoryModalOpen(true)}
            />
          </div>

          {/* 2-Column Clinical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Clinical Findings, Vitals, Prescriptions */}
            <div className="lg:col-span-2 space-y-6">
              <SoloVitalsCard
                vitals={consultation.vitals}
                onVitalChange={consultation.updateVital}
                onBloodPressureChange={consultation.handleBloodPressureChange}
                bmi={consultation.bmi}
                bmiCategory={consultation.bmiCategory}
              />

              <SoloClinicalNotesCard
                chiefComplaint={consultation.chiefComplaint}
                onChiefComplaintChange={consultation.setChiefComplaint}
                clinicalExamination={consultation.clinicalExamination}
                onClinicalExaminationChange={consultation.setClinicalExamination}
                diagnoses={consultation.diagnoses}
                currentDiagnosisInput={consultation.currentDiagnosisInput}
                onDiagnosisInputChange={consultation.setCurrentDiagnosisInput}
                onAddDiagnosis={consultation.addDiagnosis}
                onRemoveDiagnosis={consultation.removeDiagnosis}
              />

              <SoloPrescriptionCard
                medications={consultation.medications}
                onAddMedication={consultation.addMedication}
                onUpdateMedication={consultation.updateMedication}
                onRemoveMedication={consultation.removeMedication}
              />
            </div>

            {/* Right 1 Column: Services, Fee, Checkout, Private Notes */}
            <div className="space-y-6">
              <SoloBillingCard
                consultationFee={consultationFee}
                availableServices={availableServices}
                selectedServices={consultation.selectedServices}
                onAddService={consultation.addService}
                onRemoveService={consultation.removeService}
                privateNotes={consultation.privateNotes}
                onPrivateNotesChange={consultation.setPrivateNotes}
                onOpenCheckout={() => session.setIsCheckoutModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Drawers & Dialog Modals */}
      <SoloWalkInModal
        isOpen={session.isWalkInModalOpen}
        onClose={() => {
          session.setIsWalkInModalOpen(false);
          session.setWalkInConflictError(null);
        }}
        onSubmit={session.startWalkIn}
        isLoading={session.isStartingEncounter}
        conflictError={session.walkInConflictError}
        onClearConflict={() => session.setWalkInConflictError(null)}
      />

      <TodayEncountersDrawer
        isOpen={session.isTodayDrawerOpen}
        onClose={() => session.setIsTodayDrawerOpen(false)}
        summaryData={session.todaySummary}
        isLoading={session.isSummaryLoading}
        onRefresh={session.fetchTodaySummary}
        onResumeEncounter={(enc) => {
          session.initSessionWithEncounter(enc, enc.patient);
          session.setIsTodayDrawerOpen(false);
        }}
        onPrintPrescription={() => window.print()}
        onPrintInvoice={() => window.print()}
      />

      <PaymentCheckoutModal
        isOpen={session.isCheckoutModalOpen}
        onClose={() => session.setIsCheckoutModalOpen(false)}
        onConfirmPayment={(checkoutData) =>
          session.completeCheckout(checkoutData, availableServices, consultationFee)
        }
        isProcessing={session.isCompleting}
        services={consultation.selectedServices}
        availableServices={availableServices}
        consultationFee={consultationFee}
      />

      <PatientHistoryModal
        isOpen={session.isHistoryModalOpen}
        onClose={() => session.setIsHistoryModalOpen(false)}
        patientHistory={session.patientHistory}
        isLoading={session.historyLoading}
      />
    </div>
  );
}
