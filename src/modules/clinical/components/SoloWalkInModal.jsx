import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Search,
  UserPlus,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Users,
  User,
  Phone,
  AlertTriangle,
  RotateCcw,
  Stethoscope,
  X,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../../components/ui/Dialog';
import { useSearchPatientsQuery } from '../../patients/hooks/usePatients';

export default function SoloWalkInModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  conflictError = null,
  onClearConflict = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      age: '',
      gender: 'male',
    },
  });

  const watchedPhone = watch('phone');

  // Debounce search query or phone input
  useEffect(() => {
    const timer = setTimeout(() => {
      const active = searchQuery || watchedPhone || '';
      setDebouncedSearch(active);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, watchedPhone]);

  // Server-side search
  const { data: searchedPatients = [], isLoading: isSearching } = useSearchPatientsQuery(debouncedSearch);

  // Filter family members registered under the entered phone number
  const cleanPhone = watchedPhone ? watchedPhone.replace(/[^\d]/g, '') : '';
  const familyMembers =
    cleanPhone.length >= 7 && searchedPatients.length > 0
      ? searchedPatients.filter(
          (p) => p.phone && p.phone.replace(/[^\d]/g, '').includes(cleanPhone)
        )
      : [];

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        phone: '',
        age: '',
        gender: 'male',
      });
      setSearchQuery('');
      setDebouncedSearch('');
      setSelectedPatient(null);
      setShowDropdown(false);
      onClearConflict();
    }
  }, [isOpen, reset]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setValue('name', patient.name);
    setValue('phone', patient.phone || '');
    setValue('age', patient.age || '');
    setValue('gender', patient.gender || 'male');
    setSearchQuery(patient.name);
    setShowDropdown(false);
    onClearConflict();
  };

  const handleClearSelection = () => {
    setSelectedPatient(null);
    setValue('name', '');
    setValue('phone', '');
    setValue('age', '');
    setValue('gender', 'male');
    setSearchQuery('');
    onClearConflict();
  };

  const onFormSubmit = (data) => {
    if (selectedPatient) {
      onSubmit({ patient_id: selectedPatient.id });
    } else {
      onSubmit({
        name: data.name.trim(),
        phone: data.phone.trim(),
        age: data.age ? parseInt(data.age, 10) : null,
        gender: data.gender || 'male',
      });
    }
  };

  const handleResumeActiveEncounter = () => {
    if (selectedPatient) {
      onSubmit({ patient_id: selectedPatient.id, resume_existing: true });
    } else {
      const values = watch();
      onSubmit({
        name: values.name.trim(),
        phone: values.phone.trim(),
        age: values.age ? parseInt(values.age, 10) : null,
        gender: values.gender || 'male',
        resume_existing: true,
      });
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => !isLoading && onClose()}>
      <DialogHeader>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center font-bold">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>بدء كشف طبي (Walk-in)</DialogTitle>
            <DialogDescription>
              ابحث عن مريض سابق بالاسم أو الهاتف، أو سجّل بيانات مريض جديد للبدء فوراً.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <DialogClose onClick={() => !isLoading && onClose()} />

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-2" dir="rtl">
        {/* ========================================================= */}
        {/* 1. 409 ACTIVE ENCOUNTER ALERT                             */}
        {/* ========================================================= */}
        {conflictError && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-2 text-amber-900 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleResumeActiveEncounter}
                disabled={isLoading}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 py-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                استئناف الكشف الحالي فوراً
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SEARCH BAR (NAME, PHONE, OR MRN)                       */}
        {/* ========================================================= */}
        <div className="relative space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            البحث عن مريض سابق (بالاسم، الهاتف، أو الرقم الطبي)
          </label>

          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              disabled={isLoading}
              placeholder="اكتب اسم المريض، الهاتف، أو رقم الملف (مثال: MRN-10001)..."
              className="w-full pr-9 pl-9 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 transition-all disabled:opacity-60"
              value={searchQuery}
              onChange={(e) => {
                setShowDropdown(true);
                setSearchQuery(e.target.value);
                if (selectedPatient) setSelectedPatient(null);
                onClearConflict();
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 1) setShowDropdown(true);
              }}
            />
            {isSearching && (
              <Loader2 className="absolute left-3 top-2.5 h-4.5 w-4.5 text-clinic-600 animate-spin" />
            )}
          </div>

          {/* Live Search Results Dropdown */}
          {showDropdown && debouncedSearch.trim().length >= 1 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
              {searchedPatients.length === 0 && !isSearching ? (
                <div className="p-3 text-xs text-slate-500 text-center space-y-1">
                  <p>لا يوجد مريض مطابق في قاعدة البيانات.</p>
                  <p className="text-[11px] text-slate-400">
                    يمكنك إكمال البيانات بالأسفل لإنشاء ملف جديد وبدء الكشف فوراً.
                  </p>
                </div>
              ) : (
                searchedPatients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectPatient(p)}
                    className="w-full text-right px-4 py-2.5 hover:bg-clinic-50/80 text-sm flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        {p.medical_number && (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {p.medical_number}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {p.phone} • {p.gender === 'male' ? 'ذكر' : 'أنثى'}
                        {p.age ? ` • ${p.age} سنة` : ''}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 rotate-180" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Patient Banner */}
        {selectedPatient && (
          <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    تم تحديد المريض: {selectedPatient.name}
                  </span>
                  {selectedPatient.medical_number && (
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      {selectedPatient.medical_number}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {selectedPatient.phone}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
              title="إلغاء التحديد وكتابة مريض جديد"
            >
              <X className="h-3.5 w-3.5" />
              <span>إلغاء</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. PATIENT DEMOGRAPHICS FORM                              */}
        {/* ========================================================= */}
        <div className="space-y-3.5 pt-1">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم المريض الكامل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                disabled={isLoading}
                placeholder="مثال: أحمد محمد علي"
                className={`w-full pr-9 pl-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 transition-all ${
                  errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                {...register('name', { required: !selectedPatient ? 'اسم المريض مطلوب' : false })}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                disabled={isLoading}
                placeholder="01XXXXXXXXX"
                className={`w-full pr-9 pl-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 transition-all ${
                  errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                {...register('phone', { required: !selectedPatient ? 'رقم الهاتف مطلوب' : false })}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* FAMILY AUTO-SUGGEST CHIPS (BY PHONE) */}
          {familyMembers.length > 0 && !selectedPatient && (
            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1.5 transition-all animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  مرضى مسجلون بنفس رقم الهاتف:
                </span>
                <span className="text-[10px] text-blue-600 font-normal">انقر للاختيار المباشر</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectPatient(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-white text-slate-800 border-blue-200/90 hover:bg-blue-100/70 hover:border-blue-300 shadow-2xs"
                  >
                    <span>👤 {member.name}</span>
                    {member.medical_number && (
                      <span className="text-[10px] font-mono text-slate-500">
                        ({member.medical_number})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">العمر (سنوات)</label>
              <input
                type="number"
                min="0"
                max="120"
                disabled={isLoading}
                placeholder="35"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500"
                {...register('age')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">النوع</label>
              <select
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 bg-white"
                {...register('gender')}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dialog Action Buttons */}
        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            variant={selectedPatient ? 'default' : 'primary'}
            isLoading={isLoading}
            loadingText="جاري بدء الكشف..."
            leftIcon={
              selectedPatient ? (
                <Stethoscope className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )
            }
            className="w-full sm:w-auto flex items-center justify-center font-bold"
          >
            <span>
              {selectedPatient
                ? `بدء الكشف للمريض (${selectedPatient.name})`
                : 'تسجيل المريض وبدء الكشف فوراً'}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
