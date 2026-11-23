import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import {
  Save,
  Printer,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Move,
  Columns2,
  Rows3,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyStart,
} from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import usePrescriptionTemplate from '../hooks/usePrescriptionTemplate';
import useVitalsSettings from '../hooks/useVitalsSettings';
import TemplateModeSelector from '../components/prescription/TemplateModeSelector';
import BuiltinSpecialtyPicker from '../components/prescription/BuiltinSpecialtyPicker';
import CustomTemplateUploader from '../components/prescription/CustomTemplateUploader';
import VisualMarginCalibrator from '../components/prescription/VisualMarginCalibrator';
import ClinicalTogglesCard from '../components/prescription/ClinicalTogglesCard';
import { FreeformPrescriptionStudio } from '../components/prescription/studio';
import PrescriptionPrintWrapper from '../../clinical/components/PrescriptionPrintWrapper';
import { SAMPLE_PRESCRIPTION_DATA } from '../../clinical/templates/TemplateHelpers';
import {
  DEFAULT_PRESCRIPTION_SETTINGS,
  DEFAULT_FREEFORM_LAYOUT,
  LAYOUT_MODES,
  STANDARD_FLOW_LAYOUTS,
  VITALS_DIRECTIONS,
  getPrintPageStyle,
} from '../constants/prescriptionConstants';

export default function PrescriptionSettingsPage() {
  const { activeBranch } = useBranchContext();
  const outletCtx = useOutletContext() || {};
  const selectedDoctorId = outletCtx.selectedDoctorId || null;

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
  } = usePrescriptionTemplate(activeBranch?.id, selectedDoctorId);

  const { vitalsConfig: liveVitalsConfig } = useVitalsSettings(activeBranch?.id, selectedDoctorId);

  const [draftSettings, setDraftSettings] = useState(settings || DEFAULT_PRESCRIPTION_SETTINGS);

  useEffect(() => {
    if (settings) {
      setDraftSettings({
        ...DEFAULT_PRESCRIPTION_SETTINGS,
        ...settings,
        freeform_layout: settings.freeform_layout || DEFAULT_FREEFORM_LAYOUT,
      });
    }
  }, [settings]);

  const printComponentRef = useRef(null);
  const current = draftSettings || DEFAULT_PRESCRIPTION_SETTINGS;
  const effectiveVitalsConfig = liveVitalsConfig || current.vitals_config;
  const paperSize = current.paper_size || 'A4';
  const layoutMode = current.layout_mode || LAYOUT_MODES.STANDARD_FLOW;

  const handleTestPrint = useReactToPrint({
    contentRef: printComponentRef,
    pageStyle: getPrintPageStyle(paperSize),
    documentTitle: `Prescription_Template_Test_${paperSize}`,
  });

  const handleFieldChange = (key, val) => setDraftSettings((prev) => ({ ...prev, [key]: val }));

  const handleUploadImage = async (file, type = 'image') => {
    try {
      const updated = await uploadImage(file, type);
      if (updated) {
        setDraftSettings((prev) => ({
          ...prev,
          ...updated,
          ...(type === 'image'
            ? {
                image_url: updated.image_url,
                custom_image_url: updated.custom_image_url || updated.image_url,
                image_path: updated.image_path,
                mode: 'custom_image',
              }
            : {
                guide_image_url: updated.guide_image_url,
                guide_image_path: updated.guide_image_path,
              }),
        }));
      }
    } catch {
      // Feedback toast handled by mutation hook
    }
  };

  const handleDeleteImage = async (type = 'image') => {
    try {
      const updated = await deleteImage(type);
      if (updated) {
        setDraftSettings((prev) => ({
          ...prev,
          ...updated,
          ...(type === 'image'
            ? {
                image_url: null,
                custom_image_url: null,
                image_path: null,
                mode: 'builtin',
              }
            : {
                guide_image_url: null,
                guide_image_path: null,
              }),
        }));
      }
    } catch {
      // Feedback toast handled by mutation hook
    }
  };

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
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading prescription template and layout engine...</span>
      </div>
    );
  }

  const isBusy = isSaving || isUploading || isDeleting;

  return (
    <div className="space-y-6 animate-in fade-in text-left" dir="ltr">
      {/* Top Action Bar */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 m-0">Prescription Engine &amp; Layout Studio</h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            Design standard flow layouts with calibrated margins or drag-and-drop nodes in the Freeform Canvas Studio.
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
            <span>Test Print</span>
          </button>

          <Button
            type="button"
            disabled={isBusy}
            onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
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

      {/* Layout Engine Mode Toggle */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => handleFieldChange('layout_mode', LAYOUT_MODES.STANDARD_FLOW)}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            layoutMode === LAYOUT_MODES.STANDARD_FLOW
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutTemplate className="h-4 w-4" />
          <span>Standard Flow &amp; Calibrated Margins</span>
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => handleFieldChange('layout_mode', LAYOUT_MODES.FREEFORM_CANVAS)}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            layoutMode === LAYOUT_MODES.FREEFORM_CANVAS
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Move className="h-4 w-4" />
          <span>Freeform Canvas Studio (Interactive Drag &amp; Drop)</span>
        </button>
      </div>

      {/* Conditional View: Studio vs Standard Flow */}
      {layoutMode === LAYOUT_MODES.FREEFORM_CANVAS ? (
        <FreeformPrescriptionStudio
          layout={current.freeform_layout || DEFAULT_FREEFORM_LAYOUT}
          onChangeLayout={(newLayout) => handleFieldChange('freeform_layout', newLayout)}
          paperSize={paperSize}
          onPaperSizeChange={(ps) => handleFieldChange('paper_size', ps)}
          guideImageUrl={current.guide_image_url}
          onUploadGuideImage={(file) => handleUploadImage(file, 'guide_image')}
          onDeleteGuideImage={() => handleDeleteImage('guide_image')}
          customImageUrl={current.image_url || current.custom_image_url}
          vitalsConfig={effectiveVitalsConfig}
          isUploading={isUploading}
          isDeleting={isDeleting}
          disabled={isBusy}
        />
      ) : (
        <div className="space-y-6">
          <TemplateModeSelector
            selectedMode={current.mode || 'builtin'}
            onSelectMode={(mode) => handleFieldChange('mode', mode)}
            disabled={isBusy}
          />

          {(current.mode || 'builtin') === 'builtin' && (
            <BuiltinSpecialtyPicker
              selectedTemplateId={current.template_id || 'egyptian_clinic'}
              onSelectTemplate={(tid) => handleFieldChange('template_id', tid)}
              selectedColor={current.primary_color || '#991b1b'}
              onSelectColor={(col) => handleFieldChange('primary_color', col)}
              disabled={isBusy}
            />
          )}

          {current.mode === 'custom_image' && (
            <CustomTemplateUploader
              imageUrl={current.image_url || current.custom_image_url}
              onUpload={(file) => handleUploadImage(file, 'image')}
              onDelete={() => handleDeleteImage('image')}
              validateFile={validateImageFile}
              isUploading={isUploading}
              isDeleting={isDeleting}
              disabled={isBusy}
            />
          )}

          {/* Standard Flow Column & Vitals Arrangement Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 m-0">Standard Flow Layout Structure</h3>
              <p className="text-xs text-slate-500 mt-0.5 m-0">
                Choose the structural distribution of vital signs, eye refraction, and medications on the sheet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column arrangement selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Prescription Column Format:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleFieldChange('standard_flow_layout', STANDARD_FLOW_LAYOUTS.SIDE_BY_SIDE)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                      (current.standard_flow_layout || STANDARD_FLOW_LAYOUTS.SIDE_BY_SIDE) === STANDARD_FLOW_LAYOUTS.SIDE_BY_SIDE
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Columns2 className="h-4 w-4 text-blue-600" />
                      <span>Side-by-Side (2 Columns)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Vitals &amp; Refraction on left; Medications on right.
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleFieldChange('standard_flow_layout', STANDARD_FLOW_LAYOUTS.STACKED)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                      current.standard_flow_layout === STANDARD_FLOW_LAYOUTS.STACKED
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Rows3 className="h-4 w-4 text-blue-600" />
                      <span>Stacked (1 Column)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Full-width vitals banner above full-width medications list.
                    </span>
                  </button>
                </div>
              </div>

              {/* Vitals orientation selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Vitals Display Orientation:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleFieldChange('vitals_direction', VITALS_DIRECTIONS.HORIZONTAL)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                      (current.vitals_direction || VITALS_DIRECTIONS.HORIZONTAL) === VITALS_DIRECTIONS.HORIZONTAL
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <AlignHorizontalJustifyStart className="h-4 w-4 text-blue-600" />
                      <span>Horizontal (Flow)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Inline wrap of active clinic vitals.
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleFieldChange('vitals_direction', VITALS_DIRECTIONS.VERTICAL)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                      current.vitals_direction === VITALS_DIRECTIONS.VERTICAL
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <AlignVerticalJustifyStart className="h-4 w-4 text-blue-600" />
                      <span>Vertical (List)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Stacked rows ideal for multi-vital exams.
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <VisualMarginCalibrator
            settings={current}
            margins={current.margins}
            paperSize={paperSize}
            onMarginChange={(m) => handleFieldChange('margins', m)}
            onPaperSizeChange={(ps) => handleFieldChange('paper_size', ps)}
            vitalsConfig={effectiveVitalsConfig}
            disabled={isBusy}
          />

          <ClinicalTogglesCard
            settings={current}
            onToggleChange={handleFieldChange}
            disabled={isBusy}
          />
        </div>
      )}

      {/* Off-screen Preloaded Print Replica for Testing */}
      <div
        style={{
          position: 'fixed',
          left: '-99999px',
          top: '-99999px',
          width: paperSize === 'A4' ? '210mm' : '148mm',
          height: paperSize === 'A4' ? '297mm' : '210mm',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <PrescriptionPrintWrapper
          ref={printComponentRef}
          settings={current}
          vitalsConfig={effectiveVitalsConfig}
          patient={SAMPLE_PRESCRIPTION_DATA.patient}
          doctor={SAMPLE_PRESCRIPTION_DATA.doctor}
          encounter={SAMPLE_PRESCRIPTION_DATA.encounter}
          vitals={SAMPLE_PRESCRIPTION_DATA.vitals}
          diagnoses={SAMPLE_PRESCRIPTION_DATA.diagnoses}
          medications={SAMPLE_PRESCRIPTION_DATA.medications}
          advice={SAMPLE_PRESCRIPTION_DATA.advice}
          followUpDate={SAMPLE_PRESCRIPTION_DATA.followUpDate}
          visionData={SAMPLE_PRESCRIPTION_DATA.visionData}
        />
      </div>
    </div>
  );
}
