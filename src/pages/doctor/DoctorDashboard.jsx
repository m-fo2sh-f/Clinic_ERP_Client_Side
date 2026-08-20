import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  UserRound,
  Stethoscope,
  Clock,
  Phone,
  HeartPulse,
  ChevronRight,
  FileText,
  Pill,
  AlertCircle,
  Loader2,
  Wifi,
  ClipboardList,
  Calendar,
  BadgeCheck,
  Siren,
  Printer,
  Plus,
  Trash2,
  X,
  PanelRightClose,
  PanelRightOpen,
  Tag,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Search,
  Check
} from 'lucide-react';
import { useBranchContext } from '../../context/BranchContext';
import {
  useLiveQueueQuery,
  useCallNextPatientMutation,
  usePatientHistoryQuery
} from '../../hooks/useQueue';
import { useQueueWebSocket } from '../../hooks/useQueueWebSocket';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

// Extensive medical diagnosis dictionary for real-time autocomplete
const DIAGNOSIS_DICTIONARY = [
  'التهاب الحلق الحاد (Acute Pharyngitis)',
  'التهاب الشعب الهوائية (Acute Bronchitis)',
  'التهاب المعدة الحاد (Acute Gastritis)',
  'التهاب الأذن الوسطى (Otitis Media)',
  'التهاب اللوزتين الحاد (Acute Tonsillitis)',
  'التهاب الجيوب الأنفية (Sinusitis)',
  'التهاب الزائدة الدودية (Acute Appendicitis)',
  'النزلة المعوية الحادة (Gastroenteritis)',
  'ارتفاع ضغط الدم (Hypertension)',
  'مرض السكري النوع الثاني (Type 2 Diabetes)',
  'الربو الشعبي (Bronchial Asthma)',
  'صداع نصفي (Migraine)',
  'حساسية الجلد (Dermatitis)',
  'التهاب المفاصل (Arthritis)',
  'انزلاق غضروفي (Herniated Disc)',
  'قرحة المعدة (Peptic Ulcer)',
  'التهاب المسالك البولية (Urinary Tract Infection)',
  'فقر الدم (Anemia)',
  'تكيس المبيضين (PCOS)',
  'نزلة برد حادة (Common Cold)',
  'الإنفلونزا الموسمية (Influenza)'
];

export default function DoctorDashboard() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Main Branch';

  // Live queue data
  const { data: queueItems = [], isLoading: queueLoading } = useLiveQueueQuery(branchId);
  const callNextMutation = useCallNextPatientMutation();

  // Collapsible Queue Drawer State
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Active patient (under_examination) & waiting queue items
  const activeQueueItem = useMemo(
    () => queueItems.find((item) => item.status === 'under_examination'),
    [queueItems]
  );
  const activePatientId = activeQueueItem?.patient?.id || null;
  const waitingItems = useMemo(
    () => queueItems.filter((item) => item.status === 'waiting'),
    [queueItems]
  );

  // Patient history for the active patient
  const { data: patientHistory, isLoading: historyLoading } = usePatientHistoryQuery(activePatientId);

  // Section 1: Chronic Diseases State
  const [chronicDiseases, setChronicDiseases] = useState([
    'Diabetes Type 2 (السكري)',
    'Hypertension (ضغط الدم)'
  ]);
  const [newChronicInput, setNewChronicInput] = useState('');

  // Section 2: Clinical Findings & Final Diagnosis State
  const [clinicalNotes, setClinicalNotes] = useState({
    chiefComplaint: '',
    examinationFindings: ''
  });

  // Autocomplete Multi-Tag Diagnosis State
  const [finalDiagnoses, setFinalDiagnoses] = useState([
    'التهاب الحلق الحاد (Acute Pharyngitis)'
  ]);
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);
  const diagnosisContainerRef = useRef(null);

  // Section 3: Digital Prescription (Rx) State
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Augmentin 1g',
      dosage: '1 Tablet',
      frequency: 'Every 12 hours',
      duration: '7 Days',
      instructions: 'After meals'
    }
  ]);
  const [generalAdvice, setGeneralAdvice] = useState(
    'Drink plenty of fluids and rest. Follow up in 7 days if symptoms persist.'
  );
  const [followUpDate, setFollowUpDate] = useState('');
  const [isPrescriptionSaved, setIsPrescriptionSaved] = useState(false);

  // Filter autocomplete suggestions
  const filteredDiagnoses = useMemo(() => {
    if (!diagnosisInput.trim()) return DIAGNOSIS_DICTIONARY;
    const query = diagnosisInput.trim().toLowerCase();
    return DIAGNOSIS_DICTIONARY.filter((item) =>
      item.toLowerCase().includes(query) && !finalDiagnoses.includes(item)
    );
  }, [diagnosisInput, finalDiagnoses]);

  // Click outside to close diagnosis dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (diagnosisContainerRef.current && !diagnosisContainerRef.current.contains(event.target)) {
        setShowDiagnosisDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // WebSocket real-time sync
  const onPatientCalled = useCallback(() => {
    setClinicalNotes({
      chiefComplaint: '',
      examinationFindings: ''
    });
    setFinalDiagnoses([]);
    setDiagnosisInput('');
    setMedications([]);
    setGeneralAdvice('Drink plenty of fluids and rest.');
    setIsPrescriptionSaved(false);
  }, []);
  useQueueWebSocket(branchId, onPatientCalled);

  // Handle "Next Patient" action
  const handleNextPatient = () => {
    if (!branchId || callNextMutation.isPending) return;
    callNextMutation.mutate(branchId, {
      onSuccess: () => {
        setClinicalNotes({
          chiefComplaint: '',
          examinationFindings: ''
        });
        setFinalDiagnoses([]);
        setDiagnosisInput('');
        setMedications([]);
        setGeneralAdvice('Drink plenty of fluids and rest.');
        setIsPrescriptionSaved(false);
      }
    });
  };

  // Chronic Disease Tag Handlers
  const handleAddChronicDisease = (diseaseToAdd) => {
    const val = (diseaseToAdd || newChronicInput).trim();
    if (val && !chronicDiseases.includes(val)) {
      setChronicDiseases((prev) => [...prev, val]);
      setNewChronicInput('');
    }
  };

  const handleRemoveChronicDisease = (indexToRemove) => {
    setChronicDiseases((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Diagnosis Tag & Autocomplete Handlers
  const handleAddDiagnosisTag = (diagnosisValue) => {
    const val = diagnosisValue.trim();
    if (val && !finalDiagnoses.includes(val)) {
      setFinalDiagnoses((prev) => [...prev, val]);
    }
    setDiagnosisInput('');
    setShowDiagnosisDropdown(false);
  };

  const handleRemoveDiagnosisTag = (tagToRemove) => {
    setFinalDiagnoses((prev) => prev.filter((item) => item !== tagToRemove));
  };

  const handleDiagnosisKeyDown = (e) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      if (filteredDiagnoses.length > 0 && diagnosisInput.trim().length > 0) {
        e.preventDefault();
        handleAddDiagnosisTag(filteredDiagnoses[0]);
      } else if (diagnosisInput.trim().length > 0) {
        e.preventDefault();
        handleAddDiagnosisTag(diagnosisInput);
      }
    } else if (e.key === 'Backspace' && !diagnosisInput && finalDiagnoses.length > 0) {
      setFinalDiagnoses((prev) => prev.slice(0, -1));
    }
  };

  // Medication Row Management
  const handleAddMedication = () => {
    const newMed = { id: Date.now(), name: '', dosage: '', frequency: '', duration: '', instructions: '' };
    setMedications((prev) => [...prev, newMed]);
  };

  const handleUpdateMedication = (id, field, value) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleRemoveMedication = (id) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  // Print Prescription Sheet
  const handlePrintPrescription = () => {
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-16">
      {/* ─── PRINT ONLY STYLES FOR RX PRESCRIPTION SHEET ─── */}
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

      {/* ─── TOP NAVIGATION HEADER ─── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 sm:px-6 py-3.5 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-clinic-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
                Doctor Examination Console
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                <span>Branch:</span>
                <Badge variant="default" className="font-semibold text-[11px] bg-slate-100 text-slate-700">
                  {branchName}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Wifi className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span>Live Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            {activeQueueItem && (
              <div className="hidden md:flex items-center gap-2 bg-clinic-50 border border-clinic-200 text-clinic-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <HeartPulse className="h-4 w-4 text-clinic-600 animate-pulse shrink-0" />
                <span>Examining:</span>
                <strong className="text-clinic-900 truncate max-w-[150px]">
                  {activeQueueItem.patient?.name || 'Patient'}
                </strong>
                <Badge variant="success" className="text-[10px] ml-1">
                  Ticket #{String(activeQueueItem.queue_no).padStart(2, '0')}
                </Badge>
              </div>
            )}

            <Button
              id="btn-toggle-queue"
              variant="outline"
              size="sm"
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`flex items-center gap-2 font-semibold text-xs transition-all cursor-pointer ${
                isQueueOpen
                  ? 'border-clinic-500 text-clinic-700 bg-clinic-50/80 ring-2 ring-clinic-200'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isQueueOpen ? (
                <PanelRightClose className="h-4 w-4 text-clinic-600" />
              ) : (
                <PanelRightOpen className="h-4 w-4 text-slate-600" />
              )}
              <span>Waiting Queue</span>
              <Badge
                variant={waitingItems.length > 0 ? 'success' : 'secondary'}
                className="text-[10px] font-extrabold px-1.5 py-0.2"
              >
                {waitingItems.length}
              </Badge>
            </Button>

            <Button
              id="btn-next-patient-header"
              variant="default"
              size="sm"
              onClick={handleNextPatient}
              disabled={callNextMutation.isPending}
              className="bg-clinic-600 hover:bg-clinic-700 text-white font-bold gap-1.5 shadow-sm px-4 cursor-pointer"
            >
              {callNextMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Siren className="h-4 w-4 shrink-0" />
              )}
              <span className="hidden sm:inline">Call Next Patient</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─── COLLAPSIBLE WAITING QUEUE DRAWER ─── */}
      {isQueueOpen && (
        <div className="fixed inset-0 z-40 flex justify-end no-print">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsQueueOpen(false)}
          />
          <aside className="relative w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-50 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-clinic-600" />
                <h3 className="font-bold text-slate-900 text-sm m-0">Live Waiting Queue</h3>
                <Badge variant="success" className="text-xs font-bold">
                  {waitingItems.length} Waiting
                </Badge>
              </div>
              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-100 bg-clinic-50/50">
              <Button
                variant="default"
                size="sm"
                onClick={handleNextPatient}
                disabled={callNextMutation.isPending}
                className="w-full bg-clinic-600 hover:bg-clinic-700 text-white font-bold gap-2 py-2.5 shadow-sm"
              >
                {callNextMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <Siren className="h-4 w-4 shrink-0 animate-pulse" />
                )}
                <span>Call Next Patient Now</span>
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {queueLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="h-6 w-6 text-clinic-600 animate-spin mb-2" />
                  <span className="text-xs font-medium">Loading queue...</span>
                </div>
              ) : queueItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 m-0">Waiting room is empty</p>
                  <p className="text-[11px] text-slate-400 mt-1">No checked-in patients</p>
                </div>
              ) : (
                queueItems.map((item, index) => {
                  const isUnderExam = item.status === 'under_examination';
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                        isUnderExam
                          ? 'border-clinic-500 bg-clinic-50/80 ring-1 ring-clinic-300 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center h-9 w-9 rounded-lg font-black text-xs shrink-0 ${
                          isUnderExam
                            ? 'bg-clinic-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        #{item.queue_no ?? index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate m-0">
                          {item.patient?.name || 'Unknown Patient'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 m-0 truncate">
                          {item.patient?.phone || 'No phone'}
                        </p>
                      </div>
                      <Badge
                        variant={isUnderExam ? 'success' : 'secondary'}
                        className="text-[10px] font-bold shrink-0 capitalize"
                      >
                        {isUnderExam ? 'Under Exam' : 'Waiting'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ─── MAIN WORKSPACE CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 no-print">
        {!activeQueueItem ? (
          <Card className="min-h-[520px] flex items-center justify-center p-8 text-center border-slate-200/80 shadow-sm bg-white rounded-2xl">
            <div className="flex flex-col items-center max-w-md">
              <div className="h-20 w-20 rounded-2xl bg-clinic-50 text-clinic-600 flex items-center justify-center mb-5 border border-clinic-200 shadow-inner">
                <Stethoscope className="h-10 w-10 shrink-0" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Patient Selected</h2>
              <p className="text-xs text-slate-550 leading-relaxed mb-6">
                Click <strong className="text-clinic-600 font-bold">"Call Next Patient"</strong> to invite the next waiting patient into your examination room and open their clinical medical record.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  size="md"
                  onClick={handleNextPatient}
                  disabled={callNextMutation.isPending}
                  className="bg-clinic-600 hover:bg-clinic-700 text-white font-bold gap-2 px-6 py-2.5 shadow-md cursor-pointer"
                >
                  {callNextMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Siren className="h-4 w-4" />
                  )}
                  <span>Call Next Patient</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsQueueOpen(true)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold gap-2"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>View Queue ({waitingItems.length})</span>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* SECTION 1: DEMOGRAPHICS */}
            <Card className="overflow-hidden border-slate-200 shadow-sm bg-white rounded-2xl">
              <div className="bg-gradient-to-r from-clinic-700 via-clinic-600 to-clinic-800 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                      <UserRound className="h-8 w-8 text-white shrink-0" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-extrabold text-white tracking-tight m-0">
                          {activeQueueItem.patient?.name || 'Unknown Patient'}
                        </h2>
                        <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold px-2.5 py-0.5">
                          Ticket #{String(activeQueueItem.queue_no).padStart(2, '0')}
                        </Badge>
                      </div>
                      <p className="text-xs text-clinic-100 mt-1 flex items-center gap-2 font-medium m-0">
                        <HeartPulse className="h-3.5 w-3.5 animate-pulse text-emerald-300 shrink-0" />
                        Active Medical Session
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 bg-white space-y-6">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 text-clinic-600 animate-spin mr-2 shrink-0" />
                    <span className="text-xs text-slate-500 font-medium">Loading details...</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 m-0 flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                        Chronic Diseases & Medical Conditions
                      </h4>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      {chronicDiseases.map((disease, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200/80">
                          <Tag className="h-3 w-3 text-amber-700" />
                          <span>{disease}</span>
                          <button onClick={() => handleRemoveChronicDisease(idx)}><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 2: CLINICAL FINDINGS & DIAGNOSIS */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl !overflow-visible">
              <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
                  <FileText className="h-5 w-5 text-clinic-600 shrink-0" />
                  Clinical Examination & Final Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 !overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                      Chief Complaint <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNotes.chiefComplaint}
                      onChange={(e) => setClinicalNotes((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                      Physical Examination
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNotes.examinationFindings}
                      onChange={(e) => setClinicalNotes((prev) => ({ ...prev, examinationFindings: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500"
                    />
                  </div>
                </div>

                <div className="relative" ref={diagnosisContainerRef}>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    Final Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <div className="min-h-[46px] p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-clinic-500 flex flex-wrap items-center gap-2 cursor-text" onClick={() => setShowDiagnosisDropdown(true)}>
                    {finalDiagnoses.map((diag, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-clinic-100 text-clinic-900 border border-clinic-200 rounded-lg text-xs font-bold">
                        <Check className="h-3.5 w-3.5" />
                        <span>{diag}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveDiagnosisTag(diag); }}><X className="h-3.5 w-3.5" /></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={diagnosisInput}
                      onChange={(e) => { setDiagnosisInput(e.target.value); setShowDiagnosisDropdown(true); }}
                      onKeyDown={handleDiagnosisKeyDown}
                      placeholder={finalDiagnoses.length === 0 ? "Search for diagnosis..." : "Add another..."}
                      className="flex-1 min-w-[200px] border-none bg-transparent text-xs font-semibold focus:outline-none p-1"
                    />
                  </div>
                  {showDiagnosisDropdown && (diagnosisInput.trim().length > 0 || filteredDiagnoses.length > 0) && (
                    <div className="absolute top-full left-0 right-0 z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1">
                      {filteredDiagnoses.length === 0 ? (
                        <button type="button" onClick={() => handleAddDiagnosisTag(diagnosisInput)} className="w-full text-left px-4 py-2.5 hover:bg-clinic-50 text-xs font-semibold text-clinic-700">
                          Add custom: "{diagnosisInput}"
                        </button>
                      ) : (
                        filteredDiagnoses.map((item, idx) => (
                          <button key={idx} type="button" onClick={() => handleAddDiagnosisTag(item)} className="w-full text-left px-4 py-2.5 hover:bg-clinic-50 text-xs font-medium text-slate-800 flex justify-between">
                            {item} <span className="font-bold text-clinic-600">+ Add</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SECTION 3: RX */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
                  <Pill className="h-5 w-5 text-clinic-600" /> Digital Prescription Sheet
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handlePrintPrescription} className="gap-1.5"><Printer className="h-4 w-4" /> Print Rx</Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div id="printable-rx-sheet" className="bg-white border-2 border-slate-200 rounded-2xl p-8 space-y-6">
                  <div className="border-b-2 border-clinic-600 pb-4 flex justify-between">
                    <div><h2 className="text-xl font-extrabold text-clinic-800">{branchName}</h2></div>
                    <div className="text-right text-3xl font-black text-clinic-600">Rx</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase text-slate-700">Prescribed Medications</h3>
                      <Button variant="outline" size="sm" onClick={handleAddMedication} className="no-print text-xs"><Plus className="h-3.5 w-3.5" /> Add Row</Button>
                    </div>
                    {medications.map((med) => (
                      <div key={med.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input className="sm:col-span-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-lg" value={med.name} onChange={(e) => handleUpdateMedication(med.id, 'name', e.target.value)} placeholder="Name" />
                        <input className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg" value={med.dosage} onChange={(e) => handleUpdateMedication(med.id, 'dosage', e.target.value)} placeholder="Dosage" />
                        <input className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg" value={med.frequency} onChange={(e) => handleUpdateMedication(med.id, 'frequency', e.target.value)} placeholder="Frequency" />
                        <button onClick={() => handleRemoveMedication(med.id)} className="no-print text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="px-3 py-1.5 text-xs border rounded-lg bg-slate-50 font-medium text-slate-800" />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t no-print">
                  <Button variant="default" size="md" onClick={() => setIsPrescriptionSaved(true)} className="bg-emerald-600 gap-2">
                    <FileCheck className="h-4 w-4" /> {isPrescriptionSaved ? "Saved!" : "Complete Examination"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
