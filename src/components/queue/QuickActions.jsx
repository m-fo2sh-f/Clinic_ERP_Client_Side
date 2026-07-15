import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Search, Calendar, UserCheck, Clock, Users, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/Dialog';
import Select from '../ui/Select';

export default function QuickActions({ stats, patients, onBookAppointment }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Form fields
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [apptType, setApptType] = useState('Check-up');
  const [apptTime, setApptTime] = useState('06:30 PM');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const dropdownRef = useRef(null);

  // Filter patients based on search query (name or phone)
  const filteredPatients = searchQuery.trim() === '' ? [] : patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id);
    setPatientName(patient.name);
    setPatientPhone(patient.phone);
    setSearchQuery(`${patient.name} (${patient.phone})`);
    setShowDropdown(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Reset form
    setSearchQuery('');
    setPatientName('');
    setPatientPhone('');
    setApptType('Check-up');
    // Set default time dynamically (next round hour or fixed placeholder)
    setApptTime('06:30 PM');
    setSelectedPatientId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) return;

    onBookAppointment({
      patientId: selectedPatientId, // Will be null if it's a new quick profile patient
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      type: apptType,
      time: apptTime,
    });

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Action Trigger */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Clinic Control Desk</h3>
        <Button
          variant="default"
          onClick={handleOpenModal}
          className="w-full flex items-center justify-center gap-2 text-sm py-5 font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[0px] hover:shadow-md cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Appointment Book</span>
        </Button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 gap-4">
        {/* Total Appts Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-clinic-300 transition-all">
          <div className="absolute top-0 right-0 p-3 bg-clinic-50 rounded-bl-xl text-clinic-600 transition-colors group-hover:bg-clinic-100">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings Today</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
            <span>Overall scheduled patients today</span>
          </div>
        </div>

        {/* Checked-In Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 right-0 p-3 bg-emerald-50 rounded-bl-xl text-emerald-600 transition-colors group-hover:bg-emerald-100">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Physically Checked-In</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.checkedIn}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live in waiting room</span>
          </div>
        </div>

        {/* Remaining Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 right-0 p-3 bg-amber-50 rounded-bl-xl text-amber-600 transition-colors group-hover:bg-amber-100">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Arrivals</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.remaining}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
            <span>Awaiting check-in action</span>
          </div>
        </div>
      </div>

      {/* Appointment Booking Dialog */}
      <Dialog isOpen={isModalOpen} onClose={handleCloseModal}>
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogDescription>
            Search for an existing patient or create a quick temporary profile to assign a booking slot.
          </DialogDescription>
        </DialogHeader>
        <DialogClose onClick={handleCloseModal} />

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Patient Search Field */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Search Existing Patient
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or phone number..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  // Clear filled values if query changes and doesn't match selected patient
                  if (selectedPatientId) {
                    setSelectedPatientId(null);
                    setPatientName('');
                    setPatientPhone('');
                  }
                }}
              // onFocus={() => setShowDropdown(true)}
              />
            </div>

            {/* Auto-Complete Dropdown list */}
            {showDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer"
                    onClick={() => handleSelectPatient(p)}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.phone}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {showDropdown && searchQuery.trim() !== '' && filteredPatients.length === 0 && !selectedPatientId && (
              <div className="absolute z-50 w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-xs text-slate-500">
                No patient records match. Fill the fields below to create a quick profile.
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 my-4" />

          {/* Quick Profile fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 01012345678"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Appointment Specs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Appointment Type
              </label>
              <Select value={apptType} onChange={(e) => setApptType(e.target.value)}>
                <option value="Check-up">Check-up (Re-evaluation)</option>
                <option value="Consultation">Consultation (First Visit)</option>
                <option value="Procedure">Procedure (Minor Surgery/Lab)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Scheduled Time Slot
              </label>
              <input
                type="text"
                placeholder="e.g. 06:30 PM"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
                value={apptTime}
                onChange={(e) => setApptTime(e.target.value)}
              />
            </div>
          </div>

          {/* Dialog Action buttons */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              className="w-full sm:w-auto flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Book Appointment</span>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
