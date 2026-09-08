import React, { useState } from 'react';
import {
  UserRound,
  HeartPulse,
  Loader2,
  Tag,
  ShieldAlert,
  Droplets,
  AlertTriangle,
  Phone,
  Calendar,
  UserCheck,
  CreditCard,
  History,
  Edit3,
  Plus,
  X,
  Save,
  Activity,
  Lock,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { useUpdatePatientMutation } from '../../patients/hooks/usePatients';

/**
 * Helper to calculate or format patient age
 */
const formatAge = (patient, history) => {
  if (patient?.age) return `${patient.age} سنة`;
  if (history?.age) return `${history.age} سنة`;
  const dob = patient?.dob || patient?.date_of_birth || history?.date_of_birth;
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return dob;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} سنة`;
};

/**
 * Helper to format patient gender label
 */
const formatGender = (patient, history) => {
  const gender = patient?.gender || patient?.sex || history?.gender;
  if (!gender) return null;
  const g = String(gender).toLowerCase();
  if (g === 'male' || g === 'm' || g === 'ذكر') return 'ذكر (Male)';
  if (g === 'female' || g === 'f' || g === 'أنثى') return 'أنثى (Female)';
  return gender;
};

/**
 * ActivePatientCard — detailed patient demographics banner, info grid,
 * chronic diseases/allergies/surgeries tag editor, and trigger for full medical history.
 */
export default function ActivePatientCard({
  activeQueueItem,
  historyLoading,
  patientHistory,
  chronicDiseases = [],
  onOpenHistory,
}) {
  const patient = activeQueueItem?.patient || patientHistory;
  const patientId = patient?.id;

  const allergies = patientHistory?.allergies || patient?.allergies || '';
  const surgeries = patientHistory?.surgeries || patient?.surgeries || '';
  const bloodGroup = patientHistory?.blood_group || patient?.blood_group || '';
  const medicalNumber = patientHistory?.medical_number || patient?.code || patient?.mrn || '';
  const phone = patient?.phone || patientHistory?.phone || '';
  const nationalId = patient?.national_id || patientHistory?.national_id || '';
  const ageStr = formatAge(patient, patientHistory);
  const genderStr = formatGender(patient, patientHistory);

  // Edit patient demographics modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    gender: 'male',
    age: '',
    phone: '',
    blood_group: '',
    allergies: '',
    surgeries: '',
    chronicList: [],
    newChronicTag: '',
  });

  const updatePatientMutation = useUpdatePatientMutation();

  const handleOpenEdit = () => {
    const rawDiseases = chronicDiseases.length > 0
      ? chronicDiseases
      : (patientHistory?.chronic_diseases ? patientHistory.chronic_diseases.split(',').map((d) => d.trim()).filter(Boolean) : []);

    setEditData({
      name: patient?.name || '',
      gender: patientHistory?.gender || patient?.gender || 'male',
      age: patientHistory?.age || patient?.age || '',
      phone: phone || '',
      blood_group: bloodGroup || '',
      allergies: allergies || '',
      surgeries: surgeries || '',
      chronicList: rawDiseases,
      newChronicTag: '',
    });
    setIsEditOpen(true);
  };

  const handleAddChronicTag = () => {
    const tag = editData.newChronicTag.trim();
    if (tag && !editData.chronicList.includes(tag)) {
      setEditData((prev) => ({
        ...prev,
        chronicList: [...prev.chronicList, tag],
        newChronicTag: '',
      }));
    }
  };

  const handleRemoveChronicTag = (tagToRemove) => {
    setEditData((prev) => ({
      ...prev,
      chronicList: prev.chronicList.filter((item) => item !== tagToRemove),
    }));
  };

  const handleSavePatientProfile = () => {
    if (!patientId || updatePatientMutation.isPending) return;

    // Doctor can update gender, age, blood_group, allergies, surgeries, chronic_diseases (Name & Phone are locked)
    const payload = {
      id: patientId,
      gender: editData.gender,
      age: editData.age ? parseInt(editData.age, 10) : undefined,
      blood_group: editData.blood_group,
      allergies: editData.allergies,
      surgeries: editData.surgeries,
      chronic_diseases: editData.chronicList.join(', '),
    };

    updatePatientMutation.mutate(payload, {
      onSuccess: () => {
        setIsEditOpen(false);
      },
      onError: (err) => {
        alert(err?.response?.data?.message || 'فشل تحديث بيانات المريض');
      },
    });
  };

  return (
    <>
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white rounded-2xl">
        {/* Gradient banner with patient primary details */}
        <div className="bg-gradient-to-r from-clinic-700 via-clinic-600 to-clinic-800 p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                <UserRound className="h-8 w-8 text-white shrink-0" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight m-0">
                    {patient?.name || 'Unknown Patient'}
                  </h2>
                  {activeQueueItem?.queue_no && (
                    <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold px-2.5 py-0.5">
                      Ticket #{String(activeQueueItem.queue_no).padStart(2, '0')}
                    </Badge>
                  )}
                  {bloodGroup && (
                    <Badge className="bg-red-500/30 text-white border-red-300/40 text-xs font-bold px-2.5 py-0.5">
                      <Droplets className="h-3 w-3 mr-1" />
                      {bloodGroup}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-clinic-100 mt-1 flex items-center gap-2 font-medium m-0 flex-wrap">
                  <HeartPulse className="h-3.5 w-3.5 animate-pulse text-emerald-300 shrink-0" />
                  <span>Active Medical Session</span>
                  {medicalNumber && (
                    <span className="opacity-90 bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono">
                      MRN: {medicalNumber}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Action buttons on banner */}
            <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
              {/* Medical History Trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenHistory}
                className="bg-white/15 hover:bg-white/25 border-white/30 text-white font-bold gap-1.5 text-xs backdrop-blur-md shadow-xs cursor-pointer"
              >
                <History className="h-4 w-4" />
                <span>سجل الكشوفات والروشتات السابقة</span>
              </Button>

              {/* Edit Demographics Trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEdit}
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold gap-1.5 text-xs backdrop-blur-md cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>تعديل الملف الطبي</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Full Patient Demographics Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200/80 px-6 py-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {/* Age */}
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="h-4 w-4 text-clinic-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 block">العمر (Age):</span>
                <strong className="font-bold text-slate-900">{ageStr || 'غير محدد'}</strong>
              </div>
            </div>

            {/* Gender */}
            <div className="flex items-center gap-2 text-slate-700">
              <UserCheck className="h-4 w-4 text-clinic-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 block">النوع (Gender):</span>
                <strong className="font-bold text-slate-900">{genderStr || 'غير محدد'}</strong>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="h-4 w-4 text-clinic-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 block">الهاتف (Phone):</span>
                <strong className="font-bold text-slate-900 dir-ltr">{phone || 'غير مسجل'}</strong>
              </div>
            </div>

            {/* National ID / MRN */}
            <div className="flex items-center gap-2 text-slate-700">
              <CreditCard className="h-4 w-4 text-clinic-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-500 block">الرقم القومي / الهوية:</span>
                <strong className="font-bold text-slate-900 font-mono">
                  {nationalId || medicalNumber || 'غير مسجل'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Chronic diseases, allergies & surgeries section */}
        <CardContent className="p-6 bg-white space-y-4">
          {historyLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 text-clinic-600 animate-spin mr-2 shrink-0" />
              <span className="text-xs text-slate-500 font-medium">
                جاري تحميل بيانات السجل الطبي للمريض...
              </span>
            </div>
          ) : (
            <>
              {/* Chronic Diseases */}
              {chronicDiseases.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 m-0 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                      الأمراض المزمنة (Chronic Diseases)
                    </h4>
                    <button
                      onClick={handleOpenEdit}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> تعديل القائمة
                    </button>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    {chronicDiseases.map((disease, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200/80"
                      >
                        <Tag className="h-3 w-3 text-amber-700" />
                        <span>{disease}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {allergies && (
                <div className="p-4 rounded-xl border border-red-200/80 bg-red-50/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 m-0 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                      الحساسية الطبية (Known Allergies)
                    </h4>
                    <button
                      onClick={handleOpenEdit}
                      className="text-[11px] font-bold text-red-800 hover:text-red-950 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> تعديل
                    </button>
                  </div>
                  <p className="text-xs text-red-800 font-medium m-0">
                    {allergies}
                  </p>
                </div>
              )}

              {/* Past Surgeries */}
              {surgeries && (
                <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 m-0 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-indigo-600 shrink-0" />
                      العمليات الجراحية السابقة (Past Surgeries)
                    </h4>
                    <button
                      onClick={handleOpenEdit}
                      className="text-[11px] font-bold text-indigo-800 hover:text-indigo-950 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" /> تعديل
                    </button>
                  </div>
                  <p className="text-xs text-indigo-900 font-medium m-0">
                    {surgeries}
                  </p>
                </div>
              )}

              {/* No known conditions */}
              {chronicDiseases.length === 0 && !allergies && !surgeries && (
                <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-emerald-800 font-medium m-0 flex items-center gap-1.5">
                    <HeartPulse className="h-4 w-4 text-emerald-600 shrink-0" />
                    لا توجد أمراض مزمنة أو حساسية أو عمليات سابقة مسجلة في ملف المريض.
                  </p>
                  <button
                    onClick={handleOpenEdit}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    + إضافة بيانات الملف الطبي
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* EDIT PATIENT DEMOGRAPHICS MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsEditOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm m-0 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-clinic-600" />
                تعديل الملف الطبي للمريض
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Read-only Locked Patient Name & Phone */}
              <div className="p-3 bg-slate-100/90 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-between gap-3">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    اسم المريض ورقم الهاتف
                  </span>
                  <strong className="text-slate-900 text-xs font-bold block mt-0.5">
                    {editData.name} — <span className="dir-ltr inline-block">{editData.phone}</span>
                  </strong>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md shrink-0">
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>تعديل الاستقبال فقط</span>
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    النوع (Gender)
                  </label>
                  <select
                    value={editData.gender}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, gender: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-clinic-500"
                  >
                    <option value="male">ذكر (Male)</option>
                    <option value="female">أنثى (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    العمر (سنوات)
                  </label>
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, age: e.target.value }))
                    }
                    placeholder="مثال: 34"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-clinic-500"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  فصيلة الدم (Blood Group)
                </label>
                <select
                  value={editData.blood_group}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, blood_group: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-clinic-500"
                >
                  <option value="">اختر الفصيلة...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Chronic Diseases Tags Editor */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الأمراض المزمنة (إضافة / حذف)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editData.newChronicTag}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, newChronicTag: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChronicTag();
                      }
                    }}
                    placeholder="اكتب اسم المرض واضغط إضافة..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddChronicTag}
                    className="gap-1 text-xs shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> إضافة
                  </Button>
                </div>

                <div className="flex items-center flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 border rounded-lg">
                  {editData.chronicList.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px]">
                      لا توجد أمراض مزمنة مضافة.
                    </span>
                  ) : (
                    editData.chronicList.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[11px]"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveChronicTag(tag)}
                          className="hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Allergies Text */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الحساسية الطبية (Known Allergies)
                </label>
                <textarea
                  rows={2}
                  value={editData.allergies}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, allergies: e.target.value }))
                  }
                  placeholder="مثال: حساسية البنسلين، حساسية السلفا..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-clinic-500"
                />
              </div>

              {/* Surgeries Text */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  العمليات الجراحية السابقة (Past Surgeries)
                </label>
                <textarea
                  rows={2}
                  value={editData.surgeries}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, surgeries: e.target.value }))
                  }
                  placeholder="مثال: استئصال الزائدة الدودية 2018، جراحة ركبة 2021..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-clinic-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSavePatientProfile}
                disabled={updatePatientMutation.isPending}
                className="bg-clinic-600 hover:bg-clinic-700 text-white font-bold gap-1.5"
              >
                {updatePatientMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>حفظ التعديلات</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
