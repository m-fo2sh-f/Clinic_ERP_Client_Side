import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Pill, Printer, Plus, Trash2, FileCheck, Calendar, Eye, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import PrescriptionPrintWrapper from './PrescriptionPrintWrapper';
import CompleteExaminationModal from './CompleteExaminationModal';
import { getPrescriptionSettings, DEFAULT_PRESCRIPTION_SETTINGS } from '../../clinic-settings/api/prescriptionSettingsApi';

/**
 * PrescriptionSheet — Digital Rx prescription editor with live add/remove medications,
 * general advice, follow-up presets, Complete Examination action,
 * and seamless react-to-print integration with specialty templates.
 */
export default function PrescriptionSheet({
  branchName,
  clinicName,
  branchId,
  medications = [],
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
  generalAdvice = '',
  onGeneralAdviceChange,
  onUpdateAdvice,
  followUpDate = '',
  onFollowUpDateChange,
  onUpdateFollowUpDate,
  isPrescriptionSaved,
  isSubmitting,
  isSaving,
  onCompleteExamination,
  activePatient,
  doctorName = 'د. الطبيب المعالج',
  vitals = {},
  diagnoses = [],
  encounter = {},
}) {
  const [settings, setSettings] = useState(DEFAULT_PRESCRIPTION_SETTINGS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Hidden print reference for react-to-print
  const printComponentRef = useRef(null);
  const hasAutoPrintedRef = useRef(false);

  const effectiveBranchName = branchName || clinicName || settings?.clinic_name || 'Clinic';
  const effectiveDoctorName = doctorName || settings?.doctor_name || 'Dr.';
  const effectiveIsSubmitting = Boolean(isSubmitting || isSaving);

  // Load clinic template settings
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const loaded = await getPrescriptionSettings(branchId);
        if (isMounted && loaded) {
          setSettings(loaded);
        }
      } catch (err) {
        console.warn('Prescription settings fetch notice:', err?.message);
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, [branchId]);

  // Page style for react-to-print (A5 or A4)
  const paperSize = settings.paper_size || 'A5';
  const pageStyle = `
    @page {
      size: ${paperSize} portrait;
      margin: 0 !important;
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .print-page-root {
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        min-height: 100vh !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    pageStyle,
    documentTitle: `Prescription_${activePatient?.name || 'Patient'}`,
  });

  // Support auto_print: trigger print dialog automatically when examination is saved
  useEffect(() => {
    if (isPrescriptionSaved && settings?.auto_print && !hasAutoPrintedRef.current) {
      hasAutoPrintedRef.current = true;
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    } else if (!isPrescriptionSaved) {
      hasAutoPrintedRef.current = false;
    }
  }, [isPrescriptionSaved, settings?.auto_print, handlePrint]);

  const handleAdviceChange = (value) => {
    if (typeof onGeneralAdviceChange === 'function') {
      onGeneralAdviceChange(value);
    } else if (typeof onUpdateAdvice === 'function') {
      onUpdateAdvice(value);
    }
  };

  const handleFollowUpChange = (value) => {
    if (typeof onFollowUpDateChange === 'function') {
      onFollowUpDateChange(value);
    } else if (typeof onUpdateFollowUpDate === 'function') {
      onUpdateFollowUpDate(value);
    }
  };

  const handleQuickFollowUp = (days) => {
    if (days === 0) {
      handleFollowUpChange('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    handleFollowUpChange(dateStr);
  };

  const handleSaveAndPrint = () => {
    setIsCompleteModalOpen(false);
    handlePrint();
    if (typeof onCompleteExamination === 'function') {
      onCompleteExamination();
    }
  };

  const handleSaveOnly = () => {
    setIsCompleteModalOpen(false);
    if (typeof onCompleteExamination === 'function') {
      onCompleteExamination();
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
          <Pill className="h-5 w-5 text-clinic-600" /> Digital Prescription Sheet (Rx)
        </CardTitle>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Quick Medication Font Size Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs" title="حجم خط الأدوية في الروشتة المطبوعة">
            <span className="text-[11px] font-bold text-slate-500 px-1 select-none">حجم الخط:</span>
            {[
              { id: 'sm', label: 'صغير' },
              { id: 'md', label: 'متوسط' },
              { id: 'lg', label: 'كبير' },
            ].map((sz) => (
              <button
                key={sz.id}
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, font_size: sz.id }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  (settings?.font_size || 'md') === sz.id
                    ? 'bg-clinic-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>

          {/* Visual On-screen Preview */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="gap-1.5"
            title="Preview how prescription will print"
          >
            <Eye className="h-4 w-4" /> Preview Rx
          </Button>

          {/* Real React-To-Print Trigger */}
          <Button
            variant="default"
            size="sm"
            onClick={() => handlePrint()}
            className="gap-1.5 bg-clinic-600 hover:bg-clinic-700 text-white"
          >
            <Printer className="h-4 w-4" /> Print Prescription
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* On-screen Prescription Interactive Form */}
        <div
          id="printable-rx-sheet"
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Rx header */}
          <div className="border-b-2 border-clinic-600 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-clinic-800 m-0">
                {effectiveBranchName}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 m-0">
                Official Medical Prescription — {effectiveDoctorName}
              </p>
            </div>
            <div className="text-right text-3xl font-black text-clinic-600">
              Rx
            </div>
          </div>

          {/* Active Patient Summary Strip if available */}
          {activePatient && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs flex items-center justify-between gap-4 flex-wrap text-slate-700">
              <div>
                <span className="text-slate-400 font-medium ml-1">Patient:</span>
                <strong className="text-slate-900 font-bold">{activePatient.name || activePatient.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium ml-1">Age / Gender:</span>
                <span className="font-semibold">{activePatient.age || '—'} / {activePatient.gender === 'female' ? 'Female' : 'Male'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium ml-1">Date:</span>
                <span className="font-mono font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          )}

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-700 m-0">
                Prescribed Medications
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMedication}
                className="no-print text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Medication
              </Button>
            </div>

            {medications.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2 m-0">
                No medications added yet. Click &quot;Add Medication&quot; to begin writing the prescription.
              </p>
            )}

            {medications.map((med) => (
              <div
                key={med.id}
                className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-start"
              >
                <input
                  className="sm:col-span-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500 font-semibold"
                  value={med.name || med.drug_name || ''}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'name', e.target.value)
                  }
                  placeholder="Medication Name"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.dosage || med.dose || ''}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'dosage', e.target.value)
                  }
                  placeholder="Dose"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.frequency || ''}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'frequency', e.target.value)
                  }
                  placeholder="Frequency"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.duration || ''}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'duration', e.target.value)
                  }
                  placeholder="Duration"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:ring-2 focus:ring-clinic-500"
                  value={med.instructions || med.instruction || ''}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'instructions', e.target.value)
                  }
                  placeholder="Instructions (الجرعة بالعربي)"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => onRemoveMedication(med.id)}
                  className="no-print text-red-500 hover:text-red-700 transition-colors self-center p-1.5 cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* General Advice */}
          <div className="pt-4 border-t space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700 m-0">
              General Advice & Instructions (التعليمات الطبية)
            </label>
            <textarea
              rows={2}
              value={generalAdvice}
              onChange={(e) => handleAdviceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500 no-print"
              placeholder="e.g. Rest, drink warm fluids, avoid heavy exertion, take with food..."
              dir="rtl"
            />
          </div>

          {/* Follow-up date with quick presets */}
          <div className="pt-4 border-t space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase text-slate-700 m-0 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-clinic-600 shrink-0" />
                <span>Follow-up Date (موعد الاستشارة القادمة)</span>
              </label>

              {/* Quick preset buttons */}
              <div className="flex items-center gap-1.5 no-print flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickFollowUp(7)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-clinic-50 text-clinic-700 border border-clinic-200 rounded-md hover:bg-clinic-100 transition-colors cursor-pointer"
                >
                  In 1 Week (7 Days)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFollowUp(14)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-clinic-50 text-clinic-700 border border-clinic-200 rounded-md hover:bg-clinic-100 transition-colors cursor-pointer"
                >
                  In 2 Weeks (14 Days)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFollowUp(30)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-clinic-50 text-clinic-700 border border-clinic-200 rounded-md hover:bg-clinic-100 transition-colors cursor-pointer"
                >
                  In 1 Month (30 Days)
                </button>
                {followUpDate && (
                  <button
                    type="button"
                    onClick={() => handleQuickFollowUp(0)}
                    className="px-2 py-1 text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Clear Follow-up
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={followUpDate || ''}
                onChange={(e) => handleFollowUpChange(e.target.value)}
                className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-clinic-500 cursor-pointer"
              />
              {followUpDate && (
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  Follow-up: {new Date(followUpDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Complete Examination CTA */}
        <div className="flex justify-end pt-4 border-t no-print">
          <Button
            variant="default"
            size="md"
            onClick={() => {
              if (!isPrescriptionSaved) {
                setIsCompleteModalOpen(true);
              }
            }}
            isLoading={effectiveIsSubmitting}
            loadingText="Saving Examination..."
            disabled={isPrescriptionSaved}
            leftIcon={<FileCheck className="h-4 w-4" />}
            className={`px-6 ${
              isPrescriptionSaved
                ? 'bg-emerald-500 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <span>{isPrescriptionSaved ? 'Examination Completed ✓' : 'Complete Examination & Save Rx'}</span>
          </Button>
        </div>
      </CardContent>

      {/* OFF-SCREEN PRELOADED PRINT TARGET FOR react-to-print (CRITICAL RULE 5: off-screen in DOM, NOT display:none) */}
      <div
        style={{
          position: 'fixed',
          left: '-99999px',
          top: '-99999px',
          width: paperSize === 'A3' ? '297mm' : paperSize === 'A4' ? '210mm' : '148mm',
          height: paperSize === 'A3' ? '420mm' : paperSize === 'A4' ? '297mm' : '210mm',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <PrescriptionPrintWrapper
          ref={printComponentRef}
          settings={settings}
          patient={activePatient}
          doctor={{ name: effectiveDoctorName, title: settings?.doctor_title }}
          branch={{ name: effectiveBranchName }}
          encounter={encounter}
          vitals={vitals}
          diagnoses={diagnoses}
          medications={medications}
          advice={generalAdvice}
          followUpDate={followUpDate}
          isPreview={false}
        />
      </div>

      {/* Visual Prescription Screen Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-clinic-400" />
                <h3 className="font-bold text-sm m-0">معاينة الروشتة المطبوعة ({paperSize}) — مطابقة للطباعة 100%</h3>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handlePrint();
                  }}
                  className="bg-clinic-600 hover:bg-clinic-500 text-white gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print Now
                </Button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Natural Page Scrolling Container without Clipping */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-300/80 flex justify-center items-start">
              <PrescriptionPrintWrapper
                settings={settings}
                patient={activePatient}
                doctor={{ name: effectiveDoctorName, title: settings?.doctor_title }}
                branch={{ name: effectiveBranchName }}
                encounter={encounter}
                vitals={vitals}
                diagnoses={diagnoses}
                medications={medications}
                advice={generalAdvice}
                followUpDate={followUpDate}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Complete Examination Choice Modal */}
      <CompleteExaminationModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onSaveAndPrint={handleSaveAndPrint}
        onSaveOnly={handleSaveOnly}
        isLoading={effectiveIsSubmitting}
        patientName={activePatient?.name || activePatient?.full_name}
        medicationsCount={medications.length}
      />
    </Card>
  );
}
