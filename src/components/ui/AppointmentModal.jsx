import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, PlusCircle, ArrowRight, Edit2, Loader2, UserPlus } from 'lucide-react';
import Button from './Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './Dialog';
import Select from './Select';
import { useSearchPatientsQuery } from '../../hooks/usePatients';

export default function AppointmentModal({
  isOpen,
  onClose,
  mode = 'create',
  defaultValues,
  onSubmit,
  isLoading = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // 1. Debounce Logic: انتظار 300ms بعد توقف المستخدم عن الكتابة للبحث في السيرفر
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. البحث السيرفري باستخدام TanStack Query
  const { data: searchedPatients = [], isLoading: isSearching } = useSearchPatientsQuery(debouncedSearch);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      patientName: '',
      patientPhone: '',
      apptType: 'check_up',
      apptTime: ''
    }
  });

  // إعادة ضبط المودال والحقول عند الفتح
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues || {
        patientName: '',
        patientPhone: '',
        apptType: 'check_up',
        apptTime: ''
      });
      setSearchQuery('');
      setDebouncedSearch('');
      setSelectedPatientId(null);
      setShowDropdown(false);
    }
  }, [isOpen, defaultValues, reset]);

  // اختيار مريض من نتائج البحث
  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id);
    setValue('patientName', patient.name);
    setValue('patientPhone', patient.phone);
    setSearchQuery(patient.name);
    setShowDropdown(false);
  };

  const handleFormSubmit = (data) => {
    onSubmit(data, selectedPatientId);
  };

  const getModalTitle = () => {
    if (mode === 'walk_in') return 'Direct Walk-In Check-In';
    if (mode === 'create') return 'Book New Appointment';
    return 'Update Appointment';
  };

  const getModalDescription = () => {
    if (mode === 'walk_in')
      return 'Search for an existing patient or enter patient details to check in directly into the waiting room.';
    if (mode === 'create')
      return 'Search for an existing patient or create a quick temporary profile to assign a booking slot.';
    return 'Update details for this scheduled appointment.';
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{getModalTitle()}</DialogTitle>
        <DialogDescription>{getModalDescription()}</DialogDescription>
      </DialogHeader>
      <DialogClose onClick={onClose} />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
        {(mode === 'create' || mode === 'walk_in') && (
          <>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Search Existing Patient
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone number..."
                  className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinic-500 focus:border-clinic-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setShowDropdown(true);
                    setSearchQuery(e.target.value);
                    if (selectedPatientId) setSelectedPatientId(null);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setShowDropdown(true);
                  }}
                />
                {/* 🎯 مؤشر التحميل أثناء البحث من السيرفر */}
                {isSearching && (
                  <Loader2 className="absolute right-3 top-2.5 h-4.5 w-4.5 text-clinic-600 animate-spin" />
                )}
              </div>

              {/* 🎯 قائمة نتائج البحث المباشرة من السيرفر */}
              {showDropdown && debouncedSearch.trim().length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {searchedPatients.length === 0 && !isSearching ? (
                    <div className="p-3 text-xs text-slate-500 text-center">
                      No matching patients found. Fill in details below to create a new profile.
                    </div>
                  ) : (
                    searchedPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-clinic-50 text-sm flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.phone}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 my-4" />
          </>
        )}

        {/* Quick Profile fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              className={`w-full px-3 py-2 border ${errors.patientName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-clinic-500 focus:border-clinic-500'} rounded-lg text-sm focus:outline-none focus:ring-1 transition-all`}
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
              placeholder="e.g. 01012345678"
              className={`w-full px-3 py-2 border ${errors.patientPhone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-clinic-500 focus:border-clinic-500'} rounded-lg text-sm focus:outline-none focus:ring-1 transition-all`}
              {...register('patientPhone', { required: 'Phone is required' })}
            />
            {errors.patientPhone && <span className="text-[10px] text-red-500 mt-1">{errors.patientPhone.message}</span>}
          </div>
        </div>

        {/* Appointment Specs */}
        <div className={`grid grid-cols-1 gap-4 ${mode !== 'walk_in' ? 'sm:grid-cols-2' : ''}`}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Appointment Type
            </label>
            <Select {...register('apptType')}>
              <option value="check_up">Check-up (Kashf)</option>
              <option value="consultation">Consultation (Istishara)</option>
            </Select>
          </div>
          {mode !== 'walk_in' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Scheduled Time Slot
              </label>
              <input
                type="text"
                placeholder="YYYY-MM-DD HH:MM:SS"
                className={`w-full px-3 py-2 border ${errors.apptTime ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-clinic-500 focus:border-clinic-500'} rounded-lg text-sm focus:outline-none focus:ring-1 transition-all`}
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
            disabled={isLoading}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 ${mode === 'walk_in' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'walk_in' ? (
              <UserPlus className="h-4 w-4" />
            ) : mode === 'create' ? (
              <PlusCircle className="h-4 w-4" />
            ) : (
              <Edit2 className="h-4 w-4" />
            )}
            <span>
              {mode === 'walk_in'
                ? 'Confirm Walk-In Check-In'
                : mode === 'create'
                ? 'Book Appointment'
                : 'Update Appointment'}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}