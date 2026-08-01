import React, { useState, useMemo, useCallback } from 'react';
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
  Siren
} from 'lucide-react';
import { useBranchContext } from '../context/BranchContext';
import {
  useLiveQueueQuery,
  useCallNextPatientMutation,
  usePatientHistoryQuery
} from '../hooks/useQueue';
import { useQueueWebSocket } from '../hooks/useQueueWebSocket';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export default function DoctorDashboard() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Unknown Branch';

  // Live queue data
  const { data: queueItems = [], isLoading: queueLoading } = useLiveQueueQuery(branchId);
  const callNextMutation = useCallNextPatientMutation();

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

  // Doctor notes form state
  const [notes, setNotes] = useState({ diagnosis: '', prescription: '', complaint: '' });

  // WebSocket real-time sync
  const onPatientCalled = useCallback(() => {
    setNotes({ diagnosis: '', prescription: '', complaint: '' });
  }, []);
  useQueueWebSocket(branchId, onPatientCalled);

  // Handle "Next Patient" action
  const handleNextPatient = () => {
    if (!branchId || callNextMutation.isPending) return;
    callNextMutation.mutate(branchId);
    setNotes({ diagnosis: '', prescription: '', complaint: '' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── TOP ACTION BAR ─── */}
      <div className="bg-white px-6 py-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-clinic-600 shrink-0" />
            Doctor Dashboard
          </h2>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <span>Branch:</span>
            <Badge variant="default" className="font-semibold">{branchName}</Badge>
            {queueLoading && <Loader2 className="h-3.5 w-3.5 text-clinic-600 animate-spin ml-1 shrink-0" />}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Wifi className="h-4 w-4 text-emerald-500 animate-pulse shrink-0" />
            <span>Live Sync Active</span>
          </div>
          <Button
            id="btn-next-patient"
            variant="default"
            size="md"
            onClick={handleNextPatient}
            disabled={callNextMutation.isPending}
            className="bg-clinic-600 hover:bg-clinic-700 text-white font-bold gap-2 shadow-sm px-5"
          >
            {callNextMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <Siren className="h-4 w-4 shrink-0" />
            )}
            <span>Next Patient</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Button>
        </div>
      </div>

      {/* ─── MAIN GRID SYSTEM ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT SIDEBAR: LIVE QUEUE LIST (4 cols) ── */}
        <div className="lg:col-span-4">
          <Card className="flex flex-col min-h-[500px]">
            <CardHeader className="p-4 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-clinic-600 shrink-0" />
                Live Waiting Queue
              </CardTitle>
              <Badge variant="success" className="text-xs">
                {waitingItems.length} Waiting
              </Badge>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto max-h-[calc(100vh-280px)] space-y-3 flex-1">
              {queueLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="h-6 w-6 text-clinic-600 animate-spin mb-2" />
                  <span className="text-xs font-medium">Loading queue...</span>
                </div>
              ) : queueItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Queue is empty</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No checked-in patients in waiting room</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {queueItems.map((item, index) => {
                    const isUnderExam = item.status === 'under_examination';
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          isUnderExam
                            ? 'border-clinic-500 bg-clinic-50/60 shadow-xs ring-1 ring-clinic-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-lg font-bold text-xs shrink-0 ${
                            isUnderExam
                              ? 'bg-clinic-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{item.queue_no ?? index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-xs truncate m-0">
                            {item.patient?.name || 'Unknown Patient'}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 m-0 truncate">
                            Checked-in: {item.checked_in_at || '—'}
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
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT PANEL: ACTIVE PATIENT MEDICAL FILE (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          {!activeQueueItem ? (
            /* ── EMPTY STATE ── */
            <Card className="min-h-[500px] flex items-center justify-center p-8 text-center">
              <div className="flex flex-col items-center max-w-sm">
                <div className="h-20 w-20 rounded-full bg-clinic-50 text-clinic-600 flex items-center justify-center mb-4 border border-clinic-100 shadow-inner">
                  <Stethoscope className="h-10 w-10 shrink-0" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Waiting for Next Patient</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  No patient is currently under examination. Click <strong className="text-clinic-600">"Next Patient"</strong> above to call the next waiting patient into your examination room.
                </p>
              </div>
            </Card>
          ) : (
            /* ── ACTIVE PATIENT VIEW ── */
            <div className="space-y-6">
              {/* Header / Basic Info Card */}
              <Card className="overflow-hidden border-clinic-200 shadow-sm">
                <div className="bg-gradient-to-r from-clinic-600 to-clinic-700 p-6 text-white">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                        <UserRound className="h-8 w-8 text-white shrink-0" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-2xl font-extrabold text-white tracking-tight m-0">
                            {activeQueueItem.patient?.name || 'Unknown Patient'}
                          </h3>
                          <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold">
                            Ticket #{String(activeQueueItem.queue_no).padStart(2, '0')}
                          </Badge>
                        </div>
                        <p className="text-xs text-clinic-100 mt-1 flex items-center gap-2 font-medium m-0">
                          <HeartPulse className="h-3.5 w-3.5 animate-pulse text-emerald-300 shrink-0" />
                          Currently Under Examination
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 bg-white">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 text-clinic-600 animate-spin mr-2 shrink-0" />
                      <span className="text-xs text-slate-500 font-medium">Loading patient file...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" /> Age
                        </span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                          {patientHistory?.age ? `${patientHistory.age} yrs` : 'N/A'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 shrink-0" /> Gender
                        </span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 block capitalize">
                          {patientHistory?.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" /> Phone
                        </span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                          {patientHistory?.phone || activeQueueItem.patient?.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                          <HeartPulse className="h-3 w-3 shrink-0 text-red-500" /> Blood Group
                        </span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5 block">O+</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grid for Consultation Notes & Medical History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consultation Notes */}
                <Card>
                  <CardHeader className="p-4 bg-slate-50/50">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-clinic-600 shrink-0" />
                      Current Consultation Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint</label>
                      <textarea
                        id="input-complaint"
                        rows={2}
                        value={notes.complaint}
                        onChange={(e) => setNotes(prev => ({ ...prev, complaint: e.target.value }))}
                        placeholder="Patient's primary complaint..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis</label>
                      <textarea
                        id="input-diagnosis"
                        rows={2}
                        value={notes.diagnosis}
                        onChange={(e) => setNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                        placeholder="Clinical findings & diagnosis..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Prescription & Advice</label>
                      <textarea
                        id="input-prescription"
                        rows={3}
                        value={notes.prescription}
                        onChange={(e) => setNotes(prev => ({ ...prev, prescription: e.target.value }))}
                        placeholder="Medications, dosage instructions..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History Timeline */}
                <Card className="flex flex-col">
                  <CardHeader className="p-4 bg-slate-50/50">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Pill className="h-4 w-4 text-amber-500 shrink-0" />
                      Medical History & Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto max-h-[380px] space-y-3 flex-1">
                    {patientHistory?.medical_history && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" /> Chronic Conditions
                        </span>
                        <p className="text-xs text-amber-900 mt-1 m-0">{patientHistory.medical_history}</p>
                      </div>
                    )}

                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 text-slate-400 animate-spin shrink-0" />
                      </div>
                    ) : !patientHistory?.appointments?.length ? (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 m-0">No previous consultations recorded</p>
                      </div>
                    ) : (
                      <div className="relative pl-4 border-l-2 border-slate-200 space-y-4 my-2">
                        {patientHistory.appointments.map((appt) => (
                          <div key={appt.id} className="relative">
                            <div className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-clinic-600 border-2 border-white" />
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 capitalize">
                                  {appt.type?.replace('_', ' ') || 'Consultation'}
                                </span>
                                <Badge variant={appt.status === 'completed' ? 'success' : 'secondary'} className="text-[10px]">
                                  {appt.status}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 m-0">
                                {appt.appointment_time ? new Date(appt.appointment_time).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : 'N/A'}
                              </p>
                              {appt.branch_name && (
                                <p className="text-[10px] text-slate-400 font-medium m-0">📍 {appt.branch_name}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
