import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Activity,
  Clock,
  Users,
  Volume2,
  ChevronRight,
  Sparkles,
  Stethoscope,
  MapPin,
  UserCheck
} from 'lucide-react';
import { useBranchContext } from '../context/BranchContext';
import { useLiveQueueQuery } from '../hooks/useQueue';
import { useQueueWebSocket } from '../hooks/useQueueWebSocket';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

// 🎯 1. مكون الساعة المستقل بداخل الملف لمنع إعادة رسم المكون الرئيسي كل ثانية
function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateStr = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="text-right">
      <p className="text-2xl font-black text-white tracking-widest font-mono m-0">{timeStr}</p>
      <p className="text-xs text-slate-400 mt-0.5 m-0 font-medium">{dateStr}</p>
    </div>
  );
}

// Web Audio API chime generator for TV notification
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.15);
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.3);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.7);

    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Audio Context autoplay fallback
  }
}

export default function WaitingRoomDisplay() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Clinic Branch';

  // 🎯 طباعة الـ branchId فقط عند تغير قيمته الفعلية وليس كل ثانية
  useEffect(() => {
    if (branchId) {
      console.log('📺 Active Branch in TV Display:', branchId, branchName);
    }
  }, [branchId, branchName]);

  // Queue Data
  const { data: queueItems = [] } = useLiveQueueQuery(branchId);

  // Active patient & full physical queue items
  const activePatient = useMemo(
    () => queueItems.find((item) => item.status === 'under_examination'),
    [queueItems]
  );

  // Flash state & WebSocket payload
  const [isFlashing, setIsFlashing] = useState(false);
  const [calledData, setCalledData] = useState(null);
  const hasInteracted = useRef(false);

  // Capture user click/keypress to satisfy browser autoplay policy
  useEffect(() => {
    const handler = () => {
      hasInteracted.current = true;
    };
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
    };
  }, []);

  // WebSocket listener
  const onPatientCalled = useCallback((data) => {
    setCalledData(data);
    setIsFlashing(true);
    if (hasInteracted.current) {
      playChime();
    }
    setTimeout(() => setIsFlashing(false), 6000);
  }, []);

  useQueueWebSocket(branchId, onPatientCalled);

  const displayPatient = calledData || (activePatient ? {
    queue_no: activePatient.queue_no,
    patient_name: activePatient.patient?.name || 'Unknown Patient',
    doctor_name: 'Dr. Ahmed',
    room_name: 'Room 1'
  } : null);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col overflow-x-hidden relative font-sans">
      {/* ── VISUAL FLASH OVERLAY ON CALL ── */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-clinic-500/20 animate-pulse" />
        </div>
      )}

      {/* ── TOP DISPLAY HEADER BAR ── */}
      <header className="px-8 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-clinic-600 text-white p-3 rounded-xl shadow-lg shadow-clinic-600/30 shrink-0">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0">Healios SaaS</h1>
            <p className="text-xs text-clinic-400 font-semibold uppercase tracking-wider mt-0.5 m-0">
              {branchName} — Waiting Room TV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* 🎯 استدعاء مكون الساعة هنا */}
          <LiveClock />
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-clinic-400">
            <Volume2 className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT: HERO CALLED BANNER + LIVE QUEUE SECTION ── */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* HERO BANNER */}
        <section>
          {displayPatient ? (
            <Card className={`bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border-clinic-500/40 text-white shadow-2xl transition-all duration-300 ${isFlashing ? 'ring-4 ring-clinic-500 shadow-clinic-500/20 scale-[1.01]' : ''}`}>
              <CardContent className="p-8 lg:p-10 text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-2 bg-clinic-500/20 border border-clinic-500/40 text-clinic-300 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                  <Sparkles className="h-4 w-4 animate-spin text-clinic-400" />
                  <span>Now Calling Patient</span>
                </div>

                <div className="mb-6">
                  <div className="inline-flex items-center justify-center h-32 w-32 lg:h-36 lg:w-36 rounded-3xl bg-clinic-600 text-white text-5xl lg:text-6xl font-black shadow-xl shadow-clinic-600/30">
                    #{String(displayPatient.queue_no).padStart(2, '0')}
                  </div>
                </div>

                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-6 m-0 max-w-3xl truncate">
                  {displayPatient.patient_name}
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                  <div className="bg-slate-800/80 border border-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-clinic-400" />
                    <span className="text-xs text-slate-400">Doctor:</span>
                    <span className="text-sm font-bold text-white">{displayPatient.doctor_name}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-clinic-500 hidden sm:block" />
                  <div className="bg-slate-800/80 border border-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-clinic-400" />
                    <span className="text-xs text-slate-400">Location:</span>
                    <span className="text-sm font-bold text-white">{displayPatient.room_name}</span>
                  </div>
                </div>

                <div className="bg-clinic-600 text-white font-extrabold uppercase tracking-widest text-sm lg:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-clinic-600/20">
                  Please Enter Examination Room
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-850 border-slate-800 text-white shadow-lg">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-400">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 m-0 mb-1">Waiting Room Ready</h3>
                <p className="text-xs text-slate-400 m-0">The next patient called by the doctor will appear here</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* QUEUE LIST VIEW */}
        <section className="flex-1">
          <Card className="bg-slate-850 border-slate-800 text-white shadow-xl flex flex-col">
            <CardHeader className="p-5 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-900/50">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-clinic-400" />
                  Live Physical Waiting Queue
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5 m-0">Patients currently checked-in at {branchName}</p>
              </div>
              <Badge variant="success" className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                {queueItems.length} Active Patients
              </Badge>
            </CardHeader>

            <CardContent className="p-5 overflow-y-auto max-h-[420px]">
              {queueItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-400 m-0">Waiting Room is Empty</p>
                  <p className="text-xs text-slate-550 mt-1 m-0">Checked-in patients will be listed here automatically</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {queueItems.map((item, index) => {
                    const isUnderExam = item.status === 'under_examination';
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all flex items-center gap-3.5 ${isUnderExam
                          ? 'bg-clinic-950/60 border-clinic-500/60 ring-1 ring-clinic-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        <div className={`flex items-center justify-center h-10 w-10 rounded-xl font-black text-sm shrink-0 ${isUnderExam
                          ? 'bg-clinic-600 text-white shadow-md shadow-clinic-600/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                          #{item.queue_no ?? index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm truncate m-0">
                            {item.patient?.name || 'Unknown Patient'}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 m-0 truncate">
                            Arrival: {item.checked_in_at || '—'}
                          </p>
                        </div>

                        <Badge
                          variant={isUnderExam ? 'success' : 'secondary'}
                          className={`text-[10px] font-bold shrink-0 capitalize ${isUnderExam
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                        >
                          {isUnderExam ? 'In Exam' : 'Waiting'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}