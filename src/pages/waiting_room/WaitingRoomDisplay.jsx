import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  Clock,
  Users,
  Volume2,
  ChevronRight,
  Sparkles,
  Stethoscope,
  MapPin,
  UserCheck,
  BellRing,
  CheckCircle2,
  Tv,
  Copy,
  Check
} from 'lucide-react';
import { useBranchContext } from '../../context/BranchContext';
import { usePublicLiveQueueQuery } from '../../hooks/useQueue';
import { useQueueWebSocket } from '../../hooks/useQueueWebSocket';
import Badge from '../../components/ui/Badge';

// 🎯 1. Independent Live Clock component preventing main-page re-renders
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="text-right">
      <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-widest font-mono m-0 leading-none">{timeStr}</p>
      <p className="text-[11px] text-slate-500 mt-1 m-0 font-bold uppercase tracking-wider">{dateStr}</p>
    </div>
  );
}

// Web Audio API chime generator for TV notification sound
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

// 🎯 2. Cinematic Full-Screen Overlay Animation for "Next Patient" Call (Light Theme Glass & Smooth Transitions)
function CinematicCallOverlay({ isOpen, isFadingOut, data }) {
  if (!isOpen && !isFadingOut) return null;
  console.log('data from waiting room', data)

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-3xl text-slate-900 border border-slate-200/80 shadow-2xl transition-all duration-700 ease-in-out ${isFadingOut
        ? 'opacity-0 scale-95 pointer-events-none'
        : 'opacity-100 scale-100 animate-in fade-in duration-500'
        }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] bg-clinic-400/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        {/* Previous Patient Examination Completed Notice */}
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-xs">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
          <span>Previous Patient Examination Completed</span>
        </div>

        {/* Animated Category Header */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-clinic-50 border border-clinic-200 text-clinic-700 text-xs sm:text-sm font-black uppercase tracking-[0.3em] mb-8 shadow-xs">
          <BellRing className="h-4 w-4 animate-bounce text-clinic-600" />
          <span>Now Calling Next Patient</span>
        </div>

        {/* Ticket Badge */}
        <div className="mb-8 relative">
          <div className="h-32 w-32 sm:h-44 sm:w-44 rounded-3xl bg-gradient-to-br from-clinic-600 via-clinic-700 to-clinic-800 text-white text-6xl sm:text-7xl font-black shadow-2xl shadow-clinic-600/30 flex items-center justify-center border-4 border-white tracking-tight ring-8 ring-clinic-500/20">
            #{String(data?.queue_no || 1).padStart(2, '0')}
          </div>
          <span className="absolute -top-2 -right-2 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500"></span>
          </span>
        </div>

        {/* Patient Name */}
        <h2 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-tight max-w-3xl truncate">
          {data?.patient_name || 'Unknown Patient'}
        </h2>

        {/* Doctor & Location Info Pill */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base font-bold text-slate-700 bg-slate-50 border border-slate-200 px-6 sm:px-8 py-3.5 rounded-2xl mb-8 shadow-xs">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-clinic-600 shrink-0" />
            <span className="text-slate-500 font-normal">Doctor:</span>
            <span className="text-slate-900 font-extrabold">{data?.doctor_name || 'Dr. Ahmed'}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-clinic-600 shrink-0" />
            <span className="text-slate-500 font-normal">Location:</span>
            <span className="text-slate-900 font-extrabold">{data?.room_name || 'Room 1'}</span>
          </div>
        </div>

        {/* Action Instruction CTA */}
        <div className="bg-gradient-to-r from-clinic-600 to-emerald-600 text-white font-black uppercase tracking-[0.2em] text-sm sm:text-base px-10 py-4 rounded-2xl shadow-xl shadow-clinic-600/30 border border-white/20 flex items-center gap-3 animate-pulse">
          <span>Please Enter Examination Room Now</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function WaitingRoomDisplay() {
  const [searchParams] = useSearchParams();
  const urlBranchId = searchParams.get('branch_id');
  const { activeBranch } = useBranchContext();

  const branchId = urlBranchId || activeBranch?.id;
  const branchName = activeBranch?.name || (urlBranchId ? `Branch (${urlBranchId.substring(0, 8)}...)` : 'Main Clinic Branch');

  // Unauthenticated Public Queue Data & Public WebSocket Listener
  const { data: queueItems = [] } = usePublicLiveQueueQuery(branchId);
  // Active patient under examination
  const activePatient = useMemo(
    () => queueItems.find((item) => item.status === 'under_examination'),
    [queueItems]
  );

  // Overlay state & called payload
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isBannerGlowing, setIsBannerGlowing] = useState(false);
  const [calledData, setCalledData] = useState(null);
  const [copied, setCopied] = useState(false);
  const hasInteracted = useRef(false);
  const prevActivePatientIdRef = useRef(null);

  // Capture user click/keypress to satisfy browser autoplay audio policy
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

  // Helper to trigger full cinematic call animation with smooth fade-in and 700ms fade-out
  const triggerCallAnimation = useCallback((payload) => {
    if (!payload) return;
    setCalledData(payload);
    setIsOverlayOpen(true);
    setIsFadingOut(false);
    setIsBannerGlowing(true);

    if (hasInteracted.current) {
      playChime();
    }

    // Initiate smooth 700ms fade out after 3.5 seconds
    setTimeout(() => {
      setIsFadingOut(true);
    }, 3500);

    // Complete overlay teardown after fade out finishes (3.5s + 0.7s = 4.2s)
    setTimeout(() => {
      setIsOverlayOpen(false);
      setIsFadingOut(false);
    }, 4200);

    // Keep banner glowing for 8 seconds
    setTimeout(() => {
      setIsBannerGlowing(false);
    }, 8000);
  }, []);

  // 🎯 Guaranteed animation trigger: Whenever activePatient changes in queue data
  useEffect(() => {
    if (activePatient && activePatient.id !== prevActivePatientIdRef.current) {
      prevActivePatientIdRef.current = activePatient.id;
      triggerCallAnimation({
        queue_no: activePatient.queue_no,
        patient_name: activePatient.patient_name || 'Unknown Patient',
        doctor_name: 'Dr. Ahmed',
        room_name: 'Room 1'
      });
    }
  }, [activePatient, triggerCallAnimation]);

  // WebSocket listener callback for explicit .patient.called event
  const onPatientCalled = useCallback((data) => {
    triggerCallAnimation(data);
  }, [triggerCallAnimation]);

  useQueueWebSocket(branchId, onPatientCalled, true);

  // Current display patient fallback
  const displayPatient = calledData || (activePatient ? {
    queue_no: activePatient.queue_no,
    patient_name: activePatient.patient_name || 'Unknown Patient',
    doctor_name: 'Dr. Ahmed',
    room_name: 'Room 1'
  } : null);

  if (!branchId) {
    return (
      <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-clinic-600/20 border border-clinic-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-clinic-400">
            <Tv className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">شاشة صالة الانتظار (TV Display)</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            يرجى فتح هذه الشاشة بتمرير المعرف الخاص بالفرع (branch_id) في رابط المتصفح:
          </p>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-clinic-300 break-all select-all">
            {window.location.origin}/waiting-room?branch_id=YOUR_BRANCH_UUID
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans select-none relative">
      {/* ── CINEMATIC FULL-SCREEN LIGHT THEME CALL OVERLAY ── */}
      <CinematicCallOverlay isOpen={isOverlayOpen} isFadingOut={isFadingOut} data={displayPatient} />

      {/* ── MAIN CONTENT WRAPPER (With smooth dim, blur, & scale transitions) ── */}
      <div
        className={`h-full w-full flex flex-col transition-all duration-700 ease-in-out ${isOverlayOpen && !isFadingOut
          ? 'opacity-30 filter blur-xs scale-98 pointer-events-none'
          : 'opacity-100 filter blur-none scale-100'
          }`}
      >
        {/* ── TOP DISPLAY HEADER BAR (Light Theme Fixed Height) ── */}
        <header className="h-16 sm:h-20 shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between z-30 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="bg-clinic-600 text-white p-2.5 rounded-xl shadow-md shadow-clinic-600/20 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 m-0">Healios SaaS</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live TV
                </span>
              </div>
              <p className="text-xs text-clinic-600 font-semibold uppercase tracking-wider mt-0.5 m-0">
                {branchName} — Waiting Room Display
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                const fullPublicUrl = `${window.location.origin}/waiting-room?branch_id=${branchId}`;
                navigator.clipboard.writeText(fullPublicUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-clinic-50 hover:text-clinic-700 hover:border-clinic-300 transition-all text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Copy Public TV Link to Clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Copy TV Link'}</span>
            </button>
            <LiveClock />
            <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-clinic-600 shadow-inner">
              <Volume2 className="h-5 w-5 animate-pulse" />
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT (Light Mode Fixed Viewport Container) ── */}
        <main className="flex-1 min-h-0 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-hidden max-w-7xl mx-auto w-full">

          {/* ── UPPER HERO SECTION: NOW SERVING (Vibrant Brand Gradient Banner) ── */}
          <section className="shrink-0">
            {displayPatient ? (
              <div className={`bg-gradient-to-r from-clinic-600 via-clinic-700 to-clinic-800 text-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-clinic-600/20 border border-clinic-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${isBannerGlowing ? 'ring-4 ring-clinic-500 shadow-clinic-600/50 scale-[1.01]' : ''
                }`}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white text-clinic-700 text-2xl sm:text-3xl font-black shadow-md flex items-center justify-center shrink-0 border border-clinic-100">
                    #{String(displayPatient.queue_no).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-clinic-100 mb-1">
                      <Sparkles className="h-3.5 w-3.5 animate-spin text-clinic-200 shrink-0" />
                      <span>Now In Examination Room</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight m-0 truncate">
                      {displayPatient.patient_name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-clinic-100 shrink-0" />
                    <span>{displayPatient.doctor_name}</span>
                    <span className="text-clinic-300">•</span>
                    <span className="text-white font-bold">{displayPatient.room_name}</span>
                  </div>
                  <Badge variant="success" className="bg-white/20 text-white border border-white/30 text-xs font-extrabold px-3 py-1 flex items-center gap-1.5 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    <span>In Exam</span>
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center flex items-center justify-center gap-3 text-slate-500 shadow-xs">
                <Users className="h-5 w-5 text-clinic-600 shrink-0" />
                <span className="text-sm font-bold text-slate-700">Waiting Room Ready</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">Patients called by the doctor will appear here</span>
              </div>
            )}
          </section>

          {/* ── LOWER SECTION: LIVE PHYSICAL QUEUE GRID (Light Mode Dynamic Flex Fill) ── */}
          <section className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-5 w-5 text-clinic-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 m-0">Live Physical Waiting Queue</h3>
                  <p className="text-[11px] text-slate-500 m-0 mt-0.5">Checked-in patients currently inside {branchName}</p>
                </div>
              </div>
              <Badge variant="success" className="px-3 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {queueItems.length} Active Patients
              </Badge>
            </div>

            {/* Grid Content Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 bg-slate-50/30">
              {queueItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Clock className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-base font-bold text-slate-600 m-0">Waiting Room is Empty</p>
                  <p className="text-xs text-slate-400 mt-1 m-0 max-w-xs">Arriving patients checked-in at reception will appear here automatically</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 auto-rows-max">
                  {queueItems.map((item, index) => {
                    const isUnderExam = item.status === 'under_examination';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${isUnderExam
                          ? 'bg-clinic-50/90 border-clinic-500/60 ring-2 ring-clinic-500/40 shadow-md shadow-clinic-600/10'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                          }`}
                      >
                        {/* Ticket Badge */}
                        <div
                          className={`flex items-center justify-center h-11 w-11 rounded-xl font-black text-base shrink-0 ${isUnderExam
                            ? 'bg-clinic-600 text-white shadow-sm border border-clinic-500'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 font-bold'
                            }`}
                        >
                          #{item.queue_no ?? index + 1}
                        </div>

                        {/* Patient Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm truncate m-0 ${isUnderExam ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                            {item.patient_name || 'Unknown Patient'}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 m-0 truncate font-medium">
                            Arrival: {item.checked_in_at || '—'}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant={isUnderExam ? 'success' : 'secondary'}
                          className={`text-[10px] font-extrabold shrink-0 capitalize px-2.5 py-1 ${isUnderExam
                            ? 'bg-emerald-500 text-white border-0 shadow-xs'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          {isUnderExam ? 'In Exam' : 'Waiting'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}