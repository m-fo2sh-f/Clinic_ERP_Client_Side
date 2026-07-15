import React, { useState, useEffect } from 'react';
import { getLocalState, saveLocalState } from '../services/api';
import QuickActions from '../components/queue/QuickActions';
import BookingList from '../components/queue/BookingList';
import LiveQueue from '../components/queue/LiveQueue';
import Badge from '../components/ui/Badge';

import { Network, Wifi, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ReceptionistDashboard({ selectedBranchId, branches }) {
  const [state, setState] = useState(getLocalState());
  const [wsStatus, setWsStatus] = useState('connected'); // Mock websocket status

  // Synchronize state changes to localStorage for demonstration
  useEffect(() => {
    saveLocalState(state);
  }, [state]);

  // --- LARAVEL ECHO / WEBSOCKET SYNC PLACEHOLDER ---
  // This effect simulates listening to websocket updates via Pusher/Echo
  useEffect(() => {
    console.log(`[Echo] Subscribing to private-branch.${selectedBranchId} channels`);
    
    // Example of Laravel Echo instantiation logic:
    /*
    import Echo from 'laravel-echo';
    import Pusher from 'pusher-js';

    window.Pusher = Pusher;
    const echoInstance = new Echo({
        broadcaster: 'reverb', // or 'pusher'
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
    });

    const channel = echoInstance.private(`branch.${selectedBranchId}`)
      .listen('.AppointmentCreated', (e) => {
         // Realtime append booking
         setState(prev => ({ ...prev, bookings: [...prev.bookings, e.booking] }));
      })
      .listen('.QueueReordered', (e) => {
         // Realtime update live waiting room
         setState(prev => ({ ...prev, liveQueue: e.newQueue }));
      });

    return () => {
      echoInstance.leave(`branch.${selectedBranchId}`);
    };
    */

    // Simulated network reconnection blinker
    const timer = setInterval(() => {
      setWsStatus(prev => prev === 'connected' ? 'syncing' : 'connected');
      setTimeout(() => setWsStatus('connected'), 600);
    }, 15000);

    return () => clearInterval(timer);
  }, [selectedBranchId]);

  // Get active branch details
  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const branchName = activeBranch ? activeBranch.name : 'Unknown Branch';

  // Filter bookings and live queue list for the selected branch
  const branchBookings = state.bookings.filter(b => b.branchId === selectedBranchId);
  const branchQueue = state.liveQueue.filter(q => q.branchId === selectedBranchId);

  // Compute stats dynamically
  const confirmedCount = branchBookings.filter(b => b.status === 'Confirmed').length;
  const liveCount = branchQueue.filter(q => q.status === 'Waiting' || q.status === 'Under Examination').length;
  
  // Total stats = remaining bookings + active queue + completed patients (mock logic)
  const stats = {
    total: branchBookings.length + branchQueue.length,
    checkedIn: liveCount,
    remaining: confirmedCount
  };

  // --- ACTIONS HANDLERS ---

  /**
   * Action: Book a new appointment
   * Simulates POST `/api/v1/appointments`
   */
  const handleBookAppointment = (newAppt) => {
    // If it's a new patient (patientId is null), we register them in patients list
    let patientId = newAppt.patientId;
    let updatedPatients = [...state.patients];

    if (!patientId) {
      patientId = Date.now(); // Generate unique mock patient ID
      updatedPatients.push({
        id: patientId,
        name: newAppt.patientName,
        phone: newAppt.patientPhone
      });
    }

    const bookingId = `b_${Date.now()}`;
    const bookingRecord = {
      id: bookingId,
      patientId,
      patientName: newAppt.patientName,
      patientPhone: newAppt.patientPhone,
      time: newAppt.time,
      type: newAppt.type,
      status: 'Confirmed',
      branchId: selectedBranchId
    };

    setState(prev => ({
      ...prev,
      patients: updatedPatients,
      bookings: [...prev.bookings, bookingRecord]
    }));

    console.log('[API POST] Created Booking Record:', bookingRecord);
    // In production:
    // api.post('/appointments', bookingRecord).then(res => setState(prev => ...))
  };

  /**
   * Action: Check-in a scheduled patient on physical arrival
   * Simulates POST `/api/v1/appointments/{id}/check-in`
   */
  const handleCheckIn = (bookingId) => {
    // Locate the booking
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Calculate next queue number for this branch
    const maxQueueNo = branchQueue.reduce((max, item) => item.queueNo > max ? item.queueNo : max, 0);
    
    // Format current time
    const now = new Date();
    const checkedInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create queue record
    const queueRecord = {
      id: `q_${Date.now()}`,
      patientId: booking.patientId,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      checkedInTime,
      status: 'Waiting', // Default state on check-in
      queueNo: maxQueueNo + 1,
      branchId: selectedBranchId
    };

    // Update bookings status and append queue record
    setState(prev => {
      const updatedBookings = prev.bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Checked-in' } : b
      );

      return {
        ...prev,
        bookings: updatedBookings,
        liveQueue: [...prev.liveQueue, queueRecord]
      };
    });

    console.log('[API POST] Checked-In Booking to Queue:', queueRecord);
    // In production, Laravel backend fires dynamic BroadcastEvent to update other monitors
  };

  /**
   * Action: Update status of checked-in patient (e.g. Call to Doctor, Complete visit)
   * Simulates PATCH `/api/v1/queue/{id}/status`
   */
  const handleStatusChange = (queueId, newStatus) => {
    setState(prev => {
      let updatedQueue = [...prev.liveQueue];

      if (newStatus === 'Under Examination') {
        // Business Rule: Only one patient can be "Under Examination" in the doctor's room at a time.
        // Downgrade any other patient currently "Under Examination" for this branch back to "Waiting"
        updatedQueue = updatedQueue.map(item => {
          if (item.branchId === selectedBranchId && item.status === 'Under Examination') {
            return { ...item, status: 'Waiting' };
          }
          return item;
        });
      }

      if (newStatus === 'Completed' || newStatus === 'No-Show') {
        // Discharge or remove from physical waiting list
        updatedQueue = updatedQueue.filter(item => item.id !== queueId);
        
        // Re-index remaining queue numbers for the branch sequentially
        let currentIdx = 1;
        updatedQueue = updatedQueue.map(item => {
          if (item.branchId === selectedBranchId) {
            const reindexed = { ...item, queueNo: currentIdx };
            currentIdx++;
            return reindexed;
          }
          return item;
        });
      } else {
        // Standard status transition (Waiting -> Under Examination)
        updatedQueue = updatedQueue.map(item => 
          item.id === queueId ? { ...item, status: newStatus } : item
        );
      }

      return {
        ...prev,
        liveQueue: updatedQueue
      };
    });

    console.log(`[API PATCH] Transitioned queue id ${queueId} status to: ${newStatus}`);
  };

  /**
   * Action: Reorder patients manually (simulate Drag and Drop)
   * Simulates PUT `/api/v1/queue/reorder`
   */
  const handleReorderQueue = (updatedBranchQueue) => {
    setState(prev => {
      // Keep other branch queues intact
      const otherBranchesQueue = prev.liveQueue.filter(q => q.branchId !== selectedBranchId);
      return {
        ...prev,
        liveQueue: [...otherBranchesQueue, ...updatedBranchQueue]
      };
    });

    console.log('[API PUT] Dispatch Reordered Queue for Branch:', updatedBranchQueue);
    // In production, triggers Reverb websocket broadcast to refresh Doctors and Wall TVs
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Receptionist Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span>Active branch: </span>
            <strong className="text-clinic-600 bg-clinic-50 px-2 py-0.5 rounded text-[11px] font-semibold">{branchName}</strong>
          </p>
        </div>

        {/* Live sync details */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-550 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            {wsStatus === 'connected' ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="text-slate-650">Laravel Echo Live Sync</span>
              </>
            ) : (
              <>
                <Network className="h-4 w-4 text-clinic-550 animate-spin" />
                <span className="text-slate-650">Syncing states...</span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-550 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <ShieldCheck className="h-4 w-4 text-clinic-600" />
            <span className="text-slate-600">Production-Ready (v4)</span>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: CONTROL DESK & STATS (Span 3) */}
        <div className="lg:col-span-3 space-y-6">
          <QuickActions 
            stats={stats}
            patients={state.patients}
            onBookAppointment={handleBookAppointment}
          />
        </div>

        {/* COLUMN 2: BOOKINGS LIST (Span 4) */}
        <div className="lg:col-span-4">
          <BookingList 
            bookings={branchBookings}
            onCheckIn={handleCheckIn}
            branchName={branchName}
          />
        </div>

        {/* COLUMN 3: LIVE WAITING QUEUE (Span 5) */}
        <div className="lg:col-span-5">
          <LiveQueue 
            queue={branchQueue}
            onStatusChange={handleStatusChange}
            onReorderQueue={handleReorderQueue}
            branchName={branchName}
          />
        </div>
      </div>
    </div>
  );
}
