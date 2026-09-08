import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, PlusCircle, ArrowRight, Edit2, Loader2, UserPlus, RefreshCw, UserCheck, ShieldCheck, Info, Users, User } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../../components/ui/Dialog';
import Select from '../../../components/ui/Select';
import { useSearchPatientsQuery } from '../../patients/hooks/usePatients';
import { useBranchDoctorsQuery } from '../hooks/useAppointments';
import { useBranchContext } from '../../../context/BranchContext';

export default function AppointmentModal({
  isOpen,
  onClose,
  mode = 'create',
  defaultValues,
  onSubmit,
  isLoading = false,
}) {
  const { selectedBranchId, activeBranch } = useBranchContext();
  const branchId = selectedBranchId || activeBranch?.id;
  const { data: branchDoctors = [] } = useBranchDoctorsQuery(branchId);

  const [strategy, setStrategy] = useState('UPDATE_CURRENT'); // 'UPDATE_CURRENT' | 'REASSIGN_EXISTING'
  const [isInlineAddingNew, setIsInlineAddingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      patientName: '',
      patientPhone: '',
      patientAge: '',
      patientGender: 'male',
      patientMedicalNumber: '',
      doctorId: '',
      apptType: 'check_up',
      apptTime: ''
    }
  });

  const watchedPhone = watch('patientPhone');

  // Debounce main search query or phone input for family auto-suggest
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeSearch = searchQuery || watchedPhone || '';
      setDebouncedSearch(activeSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, watchedPhone]);

  // Server-side search query
  const { data: searchedPatients = [], isLoading: isSearching } = useSearchPatientsQuery(debouncedSearch);

  // Filter family members registered under the entered phone number
  const cleanWatchedPhone = watchedPhone ? watchedPhone.replace(/[^\d]/g, '') : '';
  const familyMembers = (cleanWatchedPhone.length >= 7 && searchedPatients.length > 0)
    ? searchedPatients.filter(p => p.phone && p.phone.replace(/[^\d]/g, '').includes(cleanWatchedPhone))
    : [];

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStrategy('UPDATE_CURRENT');
      setIsInlineAddingNew(false);
      reset(defaultValues || {
        patientName: '',
        patientPhone: '',
        patientAge: '',
        patientGender: 'male',
        patientMedicalNumber: '',
        doctorId: '',
        apptType: 'check_up',
        apptTime: ''
      });
      setSearchQuery('');
      setDebouncedSearch('');
      setSelectedPatient(null);
      setShowDropdown(false);
    }
  }, [isOpen, defaultValues, reset]);

  const handleSelectPatientFromSearch = (patient) => {
    setSelectedPatient(patient);
    setIsInlineAddingNew(false);
    setValue('patientName', patient.name);
    setValue('patientPhone', patient.phone);
    if (patient.age) setValue('patientAge', patient.age);
    if (patient.gender) setValue('patientGender', patient.gender);
    if (patient.medical_number) setValue('patientMedicalNumber', patient.medical_number);
    setSearchQuery(patient.name);
    setShowDropdown(false);
  };

  const handleFormSubmit = (data) => {
    let effectiveStrategy = mode === 'update' ? strategy : undefined;
    let selectedPatientId = null;

    if (mode === 'update') {
      if (strategy === 'REASSIGN_EXISTING') {
        if (selectedPatient && !isInlineAddingNew) {
          selectedPatientId = selectedPatient.id;
        } else {
          effectiveStrategy = 'CREATE_AND_ASSIGN';
        }
      }
    } else {
      if (selectedPatient) {
        selectedPatientId = selectedPatient.id;
      }
    }

    onSubmit(data, selectedPatientId, effectiveStrategy);
  };

  const getModalTitle = () => {
    if (mode === 'walk_in') return 'Direct Walk-In Check-In';
    if (mode === 'create') return 'Book New Appointment';
    return 'Reschedule & Patient Identity Manager';
  };

  const getModalDescription = () => {
    if (mode === 'walk_in')
      return 'Search for an existing patient or enter details for a direct walk-in check-in.';
    if (mode === 'create')
      return 'Search by Name, Phone, or MRN to book an existing patient or create a new profile.';
    return 'Select whether to correct current patient info or reassign this appointment to another patient.';
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => !isLoading && onClose()}>
      <DialogHeader>
        <DialogTitle>{getModalTitle()}</DialogTitle>
        <DialogDescription>{getModalDescription()}</DialogDescription>
      </DialogHeader>
      <DialogClose onClick={() => !isLoading && onClose()} />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
        {/* ========================================================= */}
        {/* 1. PATIENT CONTEXT HEADER (UPDATE MODE)                   */}
        {/* ========================================================= */}
        {mode === 'update' && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{defaultValues?.patientName || 'Current Patient'}</span>
                {defaultValues?.patientMedicalNumber && (
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200/60">
                    {defaultValues.patientMedicalNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{defaultValues?.patientPhone || 'No Phone'}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <UserCheck className="h-3 w-3" />
                {defaultValues?.totalCompletedCount || 0} Visits Completed
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. TWO-OPTION TAB SELECTOR (UPDATE MODE)                  */}
        {/* ========================================================= */}
        {mode === 'update' && (
          <div className="bg-slate-100/80 p-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setStrategy('UPDATE_CURRENT');
                setIsInlineAddingNew(false);
                setSelectedPatient(null);
                setValue('patientName', defaultValues?.patientName || '');
                setValue('patientPhone', defaultValues?.patientPhone || '');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                strategy === 'UPDATE_CURRENT'
                  ? 'bg-white text-clinic-700 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Edit2 className="h-4 w-4" />
              <span>Correct Current Patient</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setStrategy('REASSIGN_EXISTING');
                setIsInlineAddingNew(false);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                strategy === 'REASSIGN_EXISTING'
                  ? 'bg-white text-clinic-700 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reassign Appointment</span>
            </button>
          </div>
        )}

        {/* Subtext info pill for UPDATE_CURRENT */}
        {mode === 'update' && strategy === 'UPDATE_CURRENT' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100">
            <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>Corrects typos or updates demographics for this patient's permanent record.</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. SEARCH BAR (CREATE / WALK-IN / REASSIGN_EXISTING)      */}
        {/* ========================================================= */}
        {(mode === 'create' || mode === 'walk_in' || (mode === 'update' && strategy === 'REASSIGN_EXISTING')) && (
          <div className="relative space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Search Target Patient (Name, Phone, or MRN)
              </label>
              {mode === 'update' && strategy === 'REASSIGN_EXISTING' && !isInlineAddingNew && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setIsInlineAddingNew(true);
                    setSelectedPatient(null);
                    setValue('patientName', '');
                    setValue('patientPhone', '');
                    setValue('patientAge', '');
                  }}
                  className="text-xs font-bold text-clinic-600 hover:text-clinic-700 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ Add New Patient</span>
                </button>
              )}
            </div>

            {!isInlineAddingNew && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder="Type name, phone number, or MRN (e.g. MRN-10001)..."
                  className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  value={searchQuery}
                  onChange={(e) => {
                    setShowDropdown(true);
                    setSearchQuery(e.target.value);
                    if (selectedPatient) setSelectedPatient(null);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 1) setShowDropdown(true);
                  }}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-2.5 h-4.5 w-4.5 text-clinic-600 animate-spin" />
                )}
              </div>
            )}

            {/* Live Search Results Dropdown */}
            {!isInlineAddingNew && showDropdown && debouncedSearch.trim().length >= 1 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {searchedPatients.length === 0 && !isSearching ? (
                  <div className="p-3 text-xs text-slate-500 text-center space-y-2">
                    <p>No matching patient found.</p>
                    {mode === 'update' && strategy === 'REASSIGN_EXISTING' && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          setIsInlineAddingNew(true);
                          setShowDropdown(false);
                          setValue('patientName', searchQuery);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-clinic-50 text-clinic-700 font-bold text-xs rounded-md border border-clinic-200 hover:bg-clinic-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Add "{searchQuery}" as New Patient</span>
                      </button>
                    )}
                  </div>
                ) : (
                  searchedPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectPatientFromSearch(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-clinic-50 text-sm flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{p.name}</p>
                          {p.medical_number && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              {p.medical_number}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{p.phone}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected target patient badge preview */}
        {selectedPatient && !isInlineAddingNew && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs">Target Selected: {selectedPatient.name}</span>
                {selectedPatient.medical_number && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    {selectedPatient.medical_number}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{selectedPatient.phone}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. FORM INPUT FIELDS                                      */}
        {/* ========================================================= */}
        {(mode !== 'update' || strategy === 'UPDATE_CURRENT' || isInlineAddingNew) && (
          <div className="space-y-4 pt-1">
            {isInlineAddingNew && (
              <div className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-lg text-xs flex items-center justify-between font-semibold">
                <span>Adding new patient profile (e.g. family member/sibling)</span>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsInlineAddingNew(false)}
                  className="text-[11px] underline hover:text-amber-900 cursor-pointer disabled:opacity-50"
                >
                  Cancel Inline Add
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder="Enter full patient name"
                  className={`w-full px-3 py-2 border ${errors.patientName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-clinic-500'} rounded-lg text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  {...register('patientName', { required: 'Name is required' })}
                />
                {errors.patientName && <span className="text-[10px] text-red-500 mt-1">{errors.patientName.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder="e.g. 01000000000"
                  className={`w-full px-3 py-2 border ${errors.patientPhone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-clinic-500'} rounded-lg text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  {...register('patientPhone', { required: 'Phone is required' })}
                />
                {errors.patientPhone && <span className="text-[10px] text-red-500 mt-1">{errors.patientPhone.message}</span>}
              </div>
            </div>

            {/* PHONE AUTO-SUGGEST FAMILY CHIPS */}
            {familyMembers.length > 0 && (
              <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-2 transition-all animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    Existing family members registered under this phone:
                  </span>
                  <span className="text-[10px] text-blue-600 font-normal">Click chip to auto-select</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectPatientFromSearch(member)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedPatient?.id === member.id
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-slate-800 border-blue-200/90 hover:bg-blue-100/70 hover:border-blue-300'
                      }`}
                    >
                      <span>👤 {member.name}</span>
                      {member.medical_number && (
                        <span className={`text-[10px] font-mono px-1 rounded ${selectedPatient?.id === member.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          ({member.medical_number})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  disabled={isLoading}
                  placeholder="e.g. 28"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-clinic-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  {...register('patientAge')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Gender
                </label>
                <Select disabled={isLoading} {...register('patientGender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* APPOINTMENT & DOCTOR SPECS                                */}
        {/* ========================================================= */}
        <div className="border-t border-slate-100 pt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-clinic-600" />
                Attending Doctor <span className="text-red-500">*</span>
              </label>
              <Select
                disabled={isLoading}
                error={!!errors.doctorId}
                {...register('doctorId', { required: 'Attending doctor is required' })}
              >
                <option value="">-- Select Doctor --</option>
                {branchDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.email})
                  </option>
                ))}
              </Select>
              {errors.doctorId && (
                <span className="text-[10px] text-red-500 mt-1 block">
                  {errors.doctorId.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Appointment Type
              </label>
              <Select disabled={isLoading} {...register('apptType')}>
                <option value="check_up">Check-up (Kashf)</option>
                <option value="consultation">Consultation (Istishara)</option>
              </Select>
            </div>
          </div>

          {mode !== 'walk_in' && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Scheduled Time Slot
              </label>
              <input
                type="text"
                disabled={isLoading}
                placeholder="YYYY-MM-DD HH:MM:SS"
                className={`w-full px-3 py-2 border ${errors.apptTime ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-clinic-500'} rounded-lg text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                {...register('apptTime', { required: mode !== 'walk_in' ? 'Time is required' : false })}
              />
              {errors.apptTime && <span className="text-[10px] text-red-500 mt-1">{errors.apptTime.message}</span>}
            </div>
          )}
        </div>

        {/* Dialog Action buttons */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant={mode === 'walk_in' ? 'default' : 'success'}
            isLoading={isLoading}
            loadingText={
              mode === 'walk_in'
                ? 'Checking In...'
                : mode === 'create'
                ? 'Booking Appointment...'
                : 'Saving Details...'
            }
            leftIcon={
              mode === 'walk_in' ? (
                <UserPlus className="h-4 w-4" />
              ) : mode === 'create' ? (
                <PlusCircle className="h-4 w-4" />
              ) : (
                <Edit2 className="h-4 w-4" />
              )
            }
            className={`w-full sm:w-auto flex items-center justify-center font-bold ${mode === 'walk_in' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          >
            <span>
              {mode === 'walk_in'
                ? 'Confirm Walk-In Check-In'
                : mode === 'create'
                ? 'Book Appointment'
                : strategy === 'UPDATE_CURRENT'
                ? 'Save Corrected Details'
                : isInlineAddingNew
                ? 'Create & Reassign to New Patient'
                : 'Reassign to Selected Patient'}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}