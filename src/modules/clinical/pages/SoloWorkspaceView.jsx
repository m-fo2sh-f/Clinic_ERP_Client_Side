import React, { useState, useEffect, useCallback } from 'react';
import {
  UserSearch,
  UserPlus,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Pill,
  Stethoscope,
  CreditCard,
  User,
  ShieldAlert,
  HeartPulse,
  RotateCcw,
  X,
} from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import Button from '../../../components/ui/Button';
import DynamicVitalsForm from '../components/DynamicVitalsForm';
import QuickPatientDrawer from '../components/QuickPatientDrawer';
import PaymentCheckoutModal from '../components/PaymentCheckoutModal';
import TodayEncountersDrawer from '../components/TodayEncountersDrawer';
import useEncounterDraft from '../hooks/useEncounterDraft';
import {
  searchPatients,
  quickStartEncounter,
  completeEncounter,
  getTodaySummary,
} from '../api/encounterApi';
import api from '../../../services/api';

export default function SoloWorkspaceView() {
  const { activeBranch, vitalsConfig } = useBranchContext();
  const branchId = activeBranch?.id;

  // ── 1. Encounter & Patient State ──────────────────────────────
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [activePatient, setActivePatient] = useState(null);

  // Form State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalExamination, setClinicalExamination] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [currentDiagnosisInput, setCurrentDiagnosisInput] = useState('');
  const [vitals, setVitals] = useState({});
  const [privateNotes, setPrivateNotes] = useState('');

  // Prescription Items
  const [medications, setMedications] = useState([]);

  // Selected billable services
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [consultationFee, setConsultationFee] = useState(150);

  // ── 2. Drawers & Modals ───────────────────────────────────────
  const [isRegisterDrawerOpen, setIsRegisterDrawerOpen] = useState(false);
  const [isTodayDrawerOpen, setIsTodayDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Search Combobox State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Today Summary State
  const [todaySummary, setTodaySummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Loading & Feedback
  const [isStartingEncounter, setIsStartingEncounter] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // ── 3. Fetch Initial Data (Services Catalog & Summary) ────────
  const fetchServices = useCallback(async () => {
    try {
      const response = await api.get('/billing/services');
      const list = response.data?.data || response.data || [];
      setAvailableServices(list);

      const consult = list.find((s) => s.code === 'CONSULTATION' || s.code === 'GEN-01');
      if (consult) {
        setConsultationFee(Number(consult.price ?? consult.default_price ?? 150));
      }
    } catch (err) {
      console.error('Failed to load clinic services:', err);
    }
  }, []);

  const fetchTodaySummary = useCallback(async () => {
    if (!branchId) return;
    setIsSummaryLoading(true);
    try {
      const res = await getTodaySummary(branchId);
      setTodaySummary(res.data);
    } catch (err) {
      console.warn('Failed to load today summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchServices();
    fetchTodaySummary();
  }, [fetchServices, fetchTodaySummary]);

  // ── 4. Patient Search Debounce ────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchPatients(searchQuery.trim());
        setSearchResults(res.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── 5. Form Data Getter for Auto-Save Hook ────────────────────
  const getFormData = useCallback(() => {
    return {
      chief_complaint: chiefComplaint,
      clinical_examination: clinicalExamination,
      diagnosis: diagnoses,
      vitals,
      private_notes: privateNotes,
    };
  }, [chiefComplaint, clinicalExamination, diagnoses, vitals, privateNotes]);

  const { isSaving, lastSavedAt, cancelPendingDrafts } = useEncounterDraft(
    activeEncounter?.id,
    getFormData,
    activeEncounter?.status === 'completed'
  );

  // ── 6. Encounter Initialization Handlers ──────────────────────
  const initFormWithEncounter = (enc, pat = null) => {
    setActiveEncounter(enc);
    setActivePatient(pat || enc.patient);
    setChiefComplaint(enc.chief_complaint || '');
    setClinicalExamination(enc.clinical_examination || '');
    setDiagnoses(Array.isArray(enc.diagnosis) ? enc.diagnosis.map(d => d.description || d) : []);
    setVitals(enc.vitals || {});
    setPrivateNotes(enc.private_notes || '');

    // Reset checkout and medications
    if (enc.prescription?.items?.length) {
      setMedications(enc.prescription.items.map(i => ({
        drug_name: i.drug_name,
        dose: i.dose,
        frequency: i.frequency,
        duration: i.duration,
        instruction: i.instruction,
      })));
    } else {
      setMedications([]);
    }
    setSelectedServices([]);
  };

  const handleStartWalkIn = async (patientPayload) => {
    if (!branchId) return;
    setIsStartingEncounter(true);
    try {
      const res = await quickStartEncounter({
        branch_id: branchId,
        ...patientPayload,
      });

      const enc = res.data;
      initFormWithEncounter(enc, enc.patient);
      setIsRegisterDrawerOpen(false);
      setIsSearchOpen(false);
      setSearchQuery('');
      setActionNotice({ type: 'success', text: 'تم بدء جلسة الكشف بنجاح' });
      fetchTodaySummary();
    } catch (err) {
      if (err.response?.status === 409) {
        // Patient has active draft -> ask to resume
        if (window.confirm('المريض لديه جلسة فحص نشطة بالفعل. هل تريد استئناف الجلسة الحالية؟')) {
          const res = await quickStartEncounter({
            branch_id: branchId,
            ...patientPayload,
            resume_existing: true,
          });
          initFormWithEncounter(res.data, res.data.patient);
          setIsRegisterDrawerOpen(false);
          setIsSearchOpen(false);
        }
      } else {
        alert(err.response?.data?.message || 'تعذر بدء جلسة الكشف');
      }
    } finally {
      setIsStartingEncounter(false);
    }
  };

  const handleSelectExistingPatient = (patient) => {
    handleStartWalkIn({ patient_id: patient.id });
  };

  // ── 7. Medication Item Handlers ───────────────────────────────
  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { drug_name: '', dose: '1 قرص', frequency: 'كل 12 ساعة', duration: '5 أيام', instruction: 'بعد الأكل' },
    ]);
  };

  const handleUpdateMedication = (index, field, value) => {
    const next = [...medications];
    next[index][field] = value;
    setMedications(next);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // ── 8. Diagnosis Tag Handlers ─────────────────────────────────
  const handleAddDiagnosis = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && currentDiagnosisInput.trim()) {
      e.preventDefault();
      const val = currentDiagnosisInput.trim();
      if (!diagnoses.includes(val)) {
        setDiagnoses([...diagnoses, val]);
      }
      setCurrentDiagnosisInput('');
    }
  };

  const handleRemoveDiagnosis = (tag) => {
    setDiagnoses(diagnoses.filter((d) => d !== tag));
  };

  // ── 9. Final Complete & Checkout ──────────────────────────────
  const handleConfirmCheckout = async ({ discount, payments }) => {
    if (!activeEncounter?.id) return;
    setIsCompleting(true);

    // Cancel in-flight draft requests immediately
    cancelPendingDrafts();

    try {
      const payload = {
        chief_complaint: chiefComplaint,
        clinical_examination: clinicalExamination,
        diagnosis: diagnoses,
        vitals,
        private_notes: privateNotes,
        medications: medications.filter((m) => m.drug_name.trim() !== ''),
        services: selectedServices,
        discount,
        payments,
      };

      await completeEncounter(activeEncounter.id, payload);
      setIsCheckoutModalOpen(false);
      setActionNotice({ type: 'success', text: 'تم إنهاء الكشف وإصدار الفاتورة والروشتة بنجاح!' });

      // Refresh today's summary & clear active encounter
      fetchTodaySummary();
      setActiveEncounter(null);
      setActivePatient(null);
      setChiefComplaint('');
      setClinicalExamination('');
      setDiagnoses([]);
      setVitals({});
      setPrivateNotes('');
      setMedications([]);
      setSelectedServices([]);
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر إتمام الكشف والدفع');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Top Bar: Quick Actions & Live Patient Search ──────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Autocomplete */}
        <div className="relative w-full md:w-96">
          <div className="relative">
            <UserSearch className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="ابحث بالاسم، رقم الهاتف أو الملف الطبي..."
              className="w-full pr-10 pl-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 1 && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto p-1.5 animate-fadeIn">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400">جاري البحث...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 mb-2">لم يتم العثور على مريض بهذا الاسم</p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setIsRegisterDrawerOpen(true);
                    }}
                    className="text-xs"
                  >
                    تسجيل سريع ومباشر
                  </Button>
                </div>
              ) : (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectExistingPatient(p)}
                    className="w-full text-right p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {p.phone} • {p.gender === 'male' ? 'ذكر' : 'أنثى'} • {p.age ? `${p.age} سنة` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {p.medical_number}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            onClick={() => setIsRegisterDrawerOpen(true)}
            className="text-xs gap-2 py-2"
          >
            <UserPlus className="h-4 w-4 text-clinic-600" />
            مريض جديد (Walk-in)
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsTodayDrawerOpen(true)}
            className="text-xs gap-2 py-2 relative"
          >
            <Calendar className="h-4 w-4" />
            كشوفات اليوم
            {todaySummary?.total_encounters > 0 && (
              <span className="bg-clinic-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {todaySummary.total_encounters}
              </span>
            )}
          </Button>

          {/* Auto-Save Indicator */}
          {activeEncounter && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
              {isSaving ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 text-clinic-600 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    تم الحفظ {lastSavedAt ? lastSavedAt.toLocaleTimeString('ar-EG', { minute: '2-digit', second: '2-digit' }) : ''}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Active Patient Banner or Empty Prompt ────────────────── */}
      {!activeEncounter ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-clinic-50 border border-clinic-100 text-clinic-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">جاهز لبدء كشف طبي جديد</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            ابحث عن مريض مسجل مسبقاً من حقل البحث بالأعلى، أو اضغط على زر مريض جديد لتسجيل بياناته وبدء الكشف فوراً.
          </p>
          <Button variant="primary" onClick={() => setIsRegisterDrawerOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            تسجيل مريض جديد والبدء
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patient Details Banner */}
          <div className="bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-clinic-500/20 text-clinic-400 border border-clinic-500/30 flex items-center justify-center font-bold text-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-white">{activePatient?.name}</h2>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                    {activePatient?.medical_number}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>{activePatient?.phone}</span>
                  <span>•</span>
                  <span>{activePatient?.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                  <span>•</span>
                  <span>{activePatient?.age ? `${activePatient.age} سنة` : 'العمر غير مسجل'}</span>
                </div>
              </div>
            </div>

            {/* Badges: Blood, Allergies, Diseases */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {activePatient?.blood_group && (
                <span className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                  فصيلة الدم: {activePatient.blood_group}
                </span>
              )}
              {activePatient?.allergies && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  حساسية: {activePatient.allergies}
                </span>
              )}
              {activePatient?.chronic_diseases && (
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1">
                  <HeartPulse className="h-3.5 w-3.5" />
                  {activePatient.chronic_diseases}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('هل تريد إنهاء أو تغيير جلسة الكشف الحالية؟')) {
                    setActiveEncounter(null);
                    setActivePatient(null);
                  }
                }}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs underline cursor-pointer"
              >
                تغيير المريض
              </button>
            </div>
          </div>

          {/* ── Main Clinical Grid (2 Columns) ────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Left Column: Clinical Core (2 cols on large screen) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dynamic Vitals Form */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
                <DynamicVitalsForm
                  vitalsConfig={vitalsConfig}
                  vitals={vitals}
                  onChange={(key, val) => setVitals((prev) => ({ ...prev, [key]: val }))}
                />
              </div>

              {/* Clinical Findings & Diagnoses */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-clinic-600" />
                  الفحص السريري والتشخيص (Clinical Notes)
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    شكوى المريض الرئيسية (Chief Complaint)
                  </label>
                  <textarea
                    rows={2}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="اكتب شكوى المريض، الأعراض ومدتها..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الفحص الطبي والملاحظات (Examination Findings)
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalExamination}
                    onChange={(e) => setClinicalExamination(e.target.value)}
                    placeholder="ملاحظات الفحص، أصوات الصدر، البطن، فحص الحلق..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none"
                  />
                </div>

                {/* Structured Diagnoses Tag Chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    التشخيص (Diagnoses) - اضغط Enter للإضافة
                  </label>
                  <div className="border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-clinic-500/20 focus-within:border-clinic-500 bg-white">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {diagnoses.map((tag) => (
                        <span
                          key={tag}
                          className="bg-clinic-50 text-clinic-700 border border-clinic-200 text-xs px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveDiagnosis(tag)}
                            className="hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={currentDiagnosisInput}
                      onChange={(e) => setCurrentDiagnosisInput(e.target.value)}
                      onKeyDown={handleAddDiagnosis}
                      placeholder="اكتب التشخيص ثم اضغط Enter..."
                      className="w-full text-xs outline-none bg-transparent p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Prescription Builder */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="h-4 w-4 text-clinic-600" />
                    الروشتة والعلاج (Prescription)
                  </h3>
                  <Button size="sm" variant="outline" onClick={handleAddMedication} className="text-xs py-1 gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    إضافة دواء
                  </Button>
                </div>

                {medications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    لم تتم إضافة أي أدوية بعد. اضغط "إضافة دواء" لكتابة العلاج.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl items-center"
                      >
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={med.drug_name}
                            onChange={(e) => handleUpdateMedication(idx, 'drug_name', e.target.value)}
                            placeholder="اسم الدواء والشكل الصيدلي..."
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none font-semibold text-slate-800"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={med.dose}
                            onChange={(e) => handleUpdateMedication(idx, 'dose', e.target.value)}
                            placeholder="الجرعة"
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleUpdateMedication(idx, 'frequency', e.target.value)}
                            placeholder="التكرار"
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={med.instruction}
                            onChange={(e) => handleUpdateMedication(idx, 'instruction', e.target.value)}
                            placeholder="التعليمات (قبل/بعد الأكل)"
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(idx)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Right Column: Billing & Instant Checkout */}
            <div className="space-y-6">
              {/* Billing Services Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-clinic-600" />
                  الفاتورة والخدمات الطبية
                </h3>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>كشف استشاري (أساسي)</span>
                    <span className="font-mono text-clinic-600">{consultationFee} ج.م</span>
                  </div>
                </div>

                {/* Extra Billable Services Dropdown Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    إضافة خدمات إضافية (رسم قلب، سونار، غيار...)
                  </label>
                  <select
                    onChange={(e) => {
                      const serviceId = e.target.value;
                      if (!serviceId) return;
                      if (!selectedServices.some((s) => s.service_id === serviceId)) {
                        setSelectedServices([...selectedServices, { service_id: serviceId, quantity: 1 }]);
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none bg-white"
                  >
                    <option value="">+ اختر خدمة إضافية...</option>
                    {availableServices
                      .filter((as) => as.code !== 'CONSULTATION' && as.code !== 'GEN-01')
                      .map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.price ?? srv.default_price} ج.م)
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Extra Services List */}
                {selectedServices.length > 0 && (
                  <div className="space-y-1.5">
                    {selectedServices.map((sel) => {
                      const matched = availableServices.find((as) => as.id === sel.service_id);
                      return (
                        <div
                          key={sel.service_id}
                          className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        >
                          <span className="font-medium text-slate-700">{matched?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-slate-900">
                              {matched?.price ?? matched?.default_price} ج.م
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedServices(selectedServices.filter((s) => s.service_id !== sel.service_id))
                              }
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Primary Checkout Button */}
                <div className="pt-3 border-t border-slate-100">
                  <Button
                    variant="primary"
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-clinic-600/20 gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    إنهاء الكشف والتحصيل الفوري
                  </Button>
                </div>
              </div>

              {/* Private Notes */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  ملاحظات الطبيب السرية (خاصة بك فقط)
                </label>
                <textarea
                  rows={4}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder="ملاحظات شخصية لا تظهر للمريض ولا تطبع في الروشتة..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawers & Modals ────────────────────────────────────── */}
      <QuickPatientDrawer
        isOpen={isRegisterDrawerOpen}
        onClose={() => setIsRegisterDrawerOpen(false)}
        onRegisterPatient={handleStartWalkIn}
        isSubmitting={isStartingEncounter}
      />

      <TodayEncountersDrawer
        isOpen={isTodayDrawerOpen}
        onClose={() => setIsTodayDrawerOpen(false)}
        summaryData={todaySummary}
        isLoading={isSummaryLoading}
        onRefresh={fetchTodaySummary}
        onResumeEncounter={(enc) => {
          initFormWithEncounter(enc, enc.patient);
          setIsTodayDrawerOpen(false);
        }}
        onPrintPrescription={() => {
          window.print();
        }}
        onPrintInvoice={() => {
          window.print();
        }}
      />

      <PaymentCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirmPayment={handleConfirmCheckout}
        isProcessing={isCompleting}
        services={selectedServices}
        availableServices={availableServices}
        consultationFee={consultationFee}
      />
    </div>
  );
}
