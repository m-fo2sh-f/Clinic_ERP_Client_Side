import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import useVitalsSettings from '../hooks/useVitalsSettings';
import SpecialtyVitalsPresets from '../components/vitals/SpecialtyVitalsPresets';
import VitalsToggleList from '../components/vitals/VitalsToggleList';
import RefractionCardToggle from '../components/vitals/RefractionCardToggle';
import CustomVitalModal from '../components/vitals/CustomVitalModal';
import { DEFAULT_VITALS_CONFIG } from '../constants/vitalsConstants';

const normalizeVitalsDraft = (cfg) => ({
  enabled_keys: Array.isArray(cfg?.enabled_keys)
    ? cfg.enabled_keys
    : Array.isArray(cfg?.fields)
      ? cfg.fields.filter((f) => f.is_enabled !== false).map((f) => f.key)
      : DEFAULT_VITALS_CONFIG.enabled_keys,
  enable_refraction: Boolean(cfg?.enable_refraction ?? cfg?.refraction_card_enabled ?? false),
  custom_vitals: Array.isArray(cfg?.custom_vitals) ? cfg.custom_vitals : [],
});

export default function VitalsSettingsPage() {
  const { activeBranch } = useBranchContext();
  const outletCtx = useOutletContext() || {};
  const selectedDoctorId = outletCtx.selectedDoctorId || null;

  const {
    vitalsConfig,
    isLoading,
    isSaving,
    statusMessage,
    saveVitalsConfig,
  } = useVitalsSettings(activeBranch?.id, selectedDoctorId);

  const [draft, setDraft] = useState(() => normalizeVitalsDraft(vitalsConfig));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (vitalsConfig) {
      setDraft(normalizeVitalsDraft(vitalsConfig));
    }
  }, [vitalsConfig]);

  const handleToggleKey = (key) => {
    setDraft((prev) => {
      const keys = Array.isArray(prev?.enabled_keys) ? prev.enabled_keys : [];
      const exists = keys.includes(key);
      const newKeys = exists ? keys.filter((k) => k !== key) : [...keys, key];
      return { ...prev, enabled_keys: newKeys };
    });
  };

  const handleApplyPreset = (preset) => {
    setDraft((prev) => {
      const currentCustom = Array.isArray(prev?.custom_vitals) ? prev.custom_vitals : [];
      const presetCustom = Array.isArray(preset?.customVitals) ? preset.customVitals : [];
      return {
        ...prev,
        enabled_keys: [...(preset.activeKeys || []), ...presetCustom.map((c) => c.key)],
        enable_refraction: Boolean(preset.enableRefraction),
        custom_vitals: [
          ...currentCustom.filter((cv) => !presetCustom.some((pv) => pv.key === cv.key)),
          ...presetCustom,
        ],
      };
    });
  };

  const handleAddCustomVital = (vitalObj) => {
    setDraft((prev) => {
      const keys = Array.isArray(prev?.enabled_keys) ? prev.enabled_keys : [];
      const customs = Array.isArray(prev?.custom_vitals) ? prev.custom_vitals : [];
      return {
        ...prev,
        enabled_keys: [...keys, vitalObj.key],
        custom_vitals: [...customs, vitalObj],
      };
    });
  };

  const handleRemoveCustomVital = (key) => {
    setDraft((prev) => {
      const keys = Array.isArray(prev?.enabled_keys) ? prev.enabled_keys : [];
      const customs = Array.isArray(prev?.custom_vitals) ? prev.custom_vitals : [];
      return {
        ...prev,
        enabled_keys: keys.filter((k) => k !== key),
        custom_vitals: customs.filter((cv) => cv.key !== key),
      };
    });
  };

  const handleSave = async () => {
    try {
      await saveVitalsConfig(draft);
    } catch {
      // Feedback handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-clinic-600" />
        <span>جاري تحميل إعدادات العلامات الحيوية...</span>
      </div>
    );
  }

  const enabledKeys = Array.isArray(draft?.enabled_keys) ? draft.enabled_keys : [];
  const customVitals = Array.isArray(draft?.custom_vitals) ? draft.custom_vitals : [];

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Top Action Bar */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 m-0">
            تخصيص العلامات الحيوية والتخصصات (Dynamic Vitals Configuration)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            حدد القياسات الحيوية المرئية في شاشة كشف الطبيب وعند إدراجها بالروشتة الطبية.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setDraft(DEFAULT_VITALS_CONFIG)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>استعادة الافتراضي</span>
          </button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>حفظ التغييرات</span>
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 ${statusMessage.type === 'success'
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

      {/* 1. Specialty Presets */}
      <SpecialtyVitalsPresets
        onApplyPreset={handleApplyPreset}
        disabled={isSaving}
      />

      {/* 2. Vitals Toggles & Custom Vitals */}
      <VitalsToggleList
        enabledKeys={enabledKeys}
        customVitals={customVitals}
        onToggleKey={handleToggleKey}
        onRemoveCustomVital={handleRemoveCustomVital}
        onOpenAddModal={() => setIsModalOpen(true)}
        disabled={isSaving}
      />

      {/* 3. Refraction Toggle Card */}
      <RefractionCardToggle
        enableRefraction={draft?.enable_refraction}
        onToggleRefraction={(val) => setDraft((prev) => ({ ...prev, enable_refraction: val }))}
        disabled={isSaving}
      />

      {/* Custom Vital Modal */}
      <CustomVitalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCustomVital}
      />
    </div>
  );
}
