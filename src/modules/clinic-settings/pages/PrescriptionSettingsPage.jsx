import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Save, Printer, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import usePrescriptionTemplate from '../hooks/usePrescriptionTemplate';
import TemplateModeSelector from '../components/prescription/TemplateModeSelector';
import BuiltinSpecialtyPicker from '../components/prescription/BuiltinSpecialtyPicker';
import CustomTemplateUploader from '../components/prescription/CustomTemplateUploader';
import VisualMarginCalibrator from '../components/prescription/VisualMarginCalibrator';
import ClinicalTogglesCard from '../components/prescription/ClinicalTogglesCard';
import PrescriptionPrintWrapper from '../../clinical/components/PrescriptionPrintWrapper';
import { SAMPLE_PRESCRIPTION_DATA } from '../../clinical/templates/TemplateHelpers';
import { DEFAULT_PRESCRIPTION_SETTINGS, getPrintPageStyle } from '../constants/prescriptionConstants';

export default function PrescriptionSettingsPage() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;

  const {
    settings,
    isLoading,
    isSaving,
    isUploading,
    isDeleting,
    statusMessage,
    saveSettings,
    uploadImage,
    deleteImage,
    validateImageFile,
  } = usePrescriptionTemplate(branchId);

  const [draftSettings, setDraftSettings] = useState(settings || DEFAULT_PRESCRIPTION_SETTINGS);

  useEffect(() => {
    if (settings) {
      setDraftSettings(settings);
    }
  }, [settings]);

  const printComponentRef = useRef(null);
  const current = draftSettings || DEFAULT_PRESCRIPTION_SETTINGS;
  const paperSize = current.paper_size || 'A5';

  const handleTestPrint = useReactToPrint({
    contentRef: printComponentRef,
    pageStyle: getPrintPageStyle(paperSize),
    documentTitle: `Prescription_Template_Test_${paperSize}`,
  });

  const handleFieldChange = (key, val) => setDraftSettings((prev) => ({ ...prev, [key]: val }));

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      await saveSettings(draftSettings);
    } catch {
      // Feedback toast handled by mutation hook
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-clinic-600" />
        <span>جاري تحميل إعدادات وقوالب الروشتة...</span>
      </div>
    );
  }

  const isBusy = isSaving || isUploading || isDeleting;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Action Bar */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 m-0">تخصيص محرك وقوالب الروشتة (Prescription Engine)</h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            حدد النمط والهوامش واضغط على "حفظ التغييرات" لتطبيقها فوراً على كل كشوفات الفرع.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleTestPrint()}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>تجربة الطباعة</span>
          </button>

          <Button
            type="button"
            disabled={isBusy}
            onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>حفظ التغييرات</span>
          </Button>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Mode Selector */}
      <TemplateModeSelector
        selectedMode={current.mode || 'builtin'}
        onSelectMode={(mode) => handleFieldChange('mode', mode)}
        disabled={isBusy}
      />

      {/* 2. Builtin Specialty Templates (If Builtin Mode) */}
      {(current.mode || 'builtin') === 'builtin' && (
        <BuiltinSpecialtyPicker
          selectedTemplateId={current.template_id || 'egyptian_clinic'}
          onSelectTemplate={(tid) => handleFieldChange('template_id', tid)}
          selectedColor={current.primary_color || '#991b1b'}
          onSelectColor={(col) => handleFieldChange('primary_color', col)}
          disabled={isBusy}
        />
      )}

      {/* 3. Custom Image Uploader (If Custom Image Mode) */}
      {current.mode === 'custom_image' && (
        <CustomTemplateUploader
          imageUrl={current.image_url || current.custom_image_url}
          onUpload={uploadImage}
          onDelete={deleteImage}
          validateFile={validateImageFile}
          isUploading={isUploading}
          isDeleting={isDeleting}
          disabled={isBusy}
        />
      )}

      {/* 4. Visual Margin Calibrator */}
      <VisualMarginCalibrator
        settings={current}
        margins={current.margins}
        paperSize={current.paper_size || 'A5'}
        onMarginChange={(m) => handleFieldChange('margins', m)}
        onPaperSizeChange={(ps) => handleFieldChange('paper_size', ps)}
        disabled={isBusy}
      />

      {/* 5. Clinical Toggles */}
      <ClinicalTogglesCard
        settings={current}
        onToggleChange={handleFieldChange}
        disabled={isBusy}
      />

      {/* Off-screen Preloaded Print Replica for Testing (CRITICAL RULE 5: off-screen in DOM, NOT display:none) */}
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
          settings={current}
          patient={SAMPLE_PRESCRIPTION_DATA.patient}
          doctor={SAMPLE_PRESCRIPTION_DATA.doctor}
          encounter={SAMPLE_PRESCRIPTION_DATA.encounter}
          vitals={SAMPLE_PRESCRIPTION_DATA.vitals}
          diagnoses={SAMPLE_PRESCRIPTION_DATA.diagnoses}
          medications={SAMPLE_PRESCRIPTION_DATA.medications}
          advice={SAMPLE_PRESCRIPTION_DATA.advice}
          followUpDate={SAMPLE_PRESCRIPTION_DATA.followUpDate}
        />
      </div>
    </div>
  );
}
