import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Save,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  X,
  FileCheck,
} from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import {
  DEFAULT_PRESCRIPTION_SETTINGS,
  getPrescriptionSettings,
  updatePrescriptionSettings,
} from '../api/prescriptionSettingsApi';
import PrescriptionTemplateGallery from './PrescriptionTemplateGallery';
import VisualMarginCalibrator from './VisualMarginCalibrator';
import ClinicalTogglesForm from './ClinicalTogglesForm';
import PrescriptionPrintWrapper from '../../clinical/components/PrescriptionPrintWrapper';
import { SAMPLE_PRESCRIPTION_DATA } from '../../clinical/templates/TemplateHelpers';

/**
 * PrescriptionSettingsTab — Unified settings manager for Prescription Templates,
 * live margin calibration, clinical display switches, and real-time print preview test.
 */
export default function PrescriptionSettingsTab() {
  const { activeBranch, user } = useBranchContext();
  const branchId = activeBranch?.id;

  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_PRESCRIPTION_SETTINGS,
    clinic_name: activeBranch?.name || DEFAULT_PRESCRIPTION_SETTINGS.clinic_name,
    doctor_name: user?.name || DEFAULT_PRESCRIPTION_SETTINGS.doctor_name,
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isScreenPreviewOpen, setIsScreenPreviewOpen] = useState(false);

  // Hidden component ref for react-to-print
  const printComponentRef = useRef(null);

  // Page style for react-to-print (A5 or A4)
  const paperSize = settings.paper_size || 'A5';
  const pageStyle = `
    @page {
      size: ${paperSize} portrait;
      margin: 0;
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-page-root {
        box-shadow: none !important;
        border: none !important;
      }
    }
  `;

  const handleTestPrint = useReactToPrint({
    contentRef: printComponentRef,
    pageStyle,
    documentTitle: `Prescription_Template_Test_${paperSize}`,
  });

  // Load settings on branch change
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await getPrescriptionSettings(branchId);
        if (isMounted) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            clinic_name: data.clinic_name || activeBranch?.name || prev.clinic_name,
            doctor_name: data.doctor_name || user?.name || prev.doctor_name,
          }));
        }
      } catch (err) {
        console.error('Failed to load prescription settings:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, [branchId, activeBranch?.name, user?.name]);

  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      setStatusMessage(null);
      await updatePrescriptionSettings(settings, branchId);
      setStatusMessage({
        type: 'success',
        text: 'تم حفظ وتحديث إعدادات وقالب الروشتة الطبية بنجاح.',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setStatusMessage({
        type: 'error',
        text: 'حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Top Action Bar */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-clinic-600" />
            <span>محرك الروشتة وإعدادات الطباعة المتقدمة (Prescription Printing Engine)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 m-0">
            تخصيص القوالب التخصصية، معايرة الهوامش لمنع التداخل مع الورق المطبوع، وفحص جودة المخرجات.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Visual Screen Preview Button */}
          <button
            type="button"
            onClick={() => setIsScreenPreviewOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>معاينة على الشاشة</span>
          </button>

          {/* Real Browser Test Print Button */}
          <button
            type="button"
            onClick={() => handleTestPrint()}
            className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-sky-600" />
            <span>طباعة تجريبية (Test Print)</span>
          </button>

          {/* Save Settings CTA */}
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 bg-clinic-600 hover:bg-clinic-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: Template Mode & Specialty Gallery */}
      <PrescriptionTemplateGallery
        values={settings}
        onChange={setSettings}
      />

      {/* Section 2: Interactive Visual Margin Calibrator */}
      <VisualMarginCalibrator
        values={settings}
        onChange={setSettings}
      />

      {/* Section 3: Clinical Toggles & Advanced Options */}
      <ClinicalTogglesForm
        values={settings}
        onChange={setSettings}
      />

      {/* Off-screen Preloaded Document for react-to-print (CRITICAL RULE 5: rendered off-screen in DOM, NOT display:none) */}
      <div
        style={{
          position: 'fixed',
          left: '-99999px',
          top: '-99999px',
          width: paperSize === 'A4' ? '210mm' : '148mm',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <PrescriptionPrintWrapper
          ref={printComponentRef}
          settings={settings}
          patient={SAMPLE_PRESCRIPTION_DATA.patient}
          doctor={{ name: settings.doctor_name, title: settings.doctor_title }}
          branch={{ name: settings.clinic_name }}
          encounter={SAMPLE_PRESCRIPTION_DATA.encounter}
          vitals={SAMPLE_PRESCRIPTION_DATA.vitals}
          diagnoses={SAMPLE_PRESCRIPTION_DATA.diagnoses}
          medications={SAMPLE_PRESCRIPTION_DATA.medications}
          advice={SAMPLE_PRESCRIPTION_DATA.advice}
          followUpDate={SAMPLE_PRESCRIPTION_DATA.followUpDate}
          isPreview={false}
        />
      </div>

      {/* Live Interactive Screen Preview Modal */}
      {isScreenPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-clinic-400" />
                <h3 className="font-bold text-sm m-0">
                  معاينة مباشرة للروشتة على الشاشة ({paperSize} Preview) — مطابقة للطباعة 100%
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTestPrint()}
                  className="px-3 py-1.5 bg-clinic-600 hover:bg-clinic-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>طباعة فورية</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsScreenPreviewOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Canvas View with Natural Paper Display */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-300/80 flex justify-center items-start">
              <PrescriptionPrintWrapper
                settings={settings}
                patient={SAMPLE_PRESCRIPTION_DATA.patient}
                doctor={{ name: settings.doctor_name, title: settings.doctor_title }}
                branch={{ name: settings.clinic_name }}
                encounter={SAMPLE_PRESCRIPTION_DATA.encounter}
                vitals={SAMPLE_PRESCRIPTION_DATA.vitals}
                diagnoses={SAMPLE_PRESCRIPTION_DATA.diagnoses}
                medications={SAMPLE_PRESCRIPTION_DATA.medications}
                advice={SAMPLE_PRESCRIPTION_DATA.advice}
                followUpDate={SAMPLE_PRESCRIPTION_DATA.followUpDate}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
