import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, MapPin, AlertCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../../components/ui/Dialog';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useUpdateStaff } from '../hooks/useTenantStaffMutations';

const AVAILABLE_ROLES = [
  { id: 'clinic_owner', label: 'Clinic Owner (مالك العيادة)', variant: 'warning' },
  { id: 'doctor', label: 'Doctor (طبيب)', variant: 'default' },
  { id: 'receptionist', label: 'Receptionist (موظف استقبال)', variant: 'secondary' },
];

export default function EditTenantUserModal({ isOpen, onClose, user, tenantId, branches = [] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [error, setError] = useState(null);

  const { mutate: updateStaff, isPending } = useUpdateStaff(tenantId);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setSelectedRoles(user.roles || []);
      
      if (user.branch_ids && user.branch_ids.length > 0) {
        setSelectedBranches(user.branch_ids);
      } else if (user.branches && user.branches.length > 0) {
        const matched = branches
          .filter((b) => user.branches.includes(b.name))
          .map((b) => b.id);
        setSelectedBranches(matched);
      } else {
        setSelectedBranches([]);
      }
      setError(null);
    }
  }, [user, branches]);

  if (!user) return null;

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const toggleBranch = (branchId) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId) ? prev.filter((b) => b !== branchId) : [...prev, branchId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى إدخال اسم الموظف.');
      return;
    }
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (selectedRoles.length === 0) {
      setError('يجب تحديد دور واحد على الأقل للموظف.');
      return;
    }
    if (selectedBranches.length === 0) {
      setError('يجب تعيين فرع واحد على الأقل للموظف.');
      return;
    }

    updateStaff(
      {
        userId: user.id,
        data: {
          name: name.trim(),
          email: email.trim(),
          roles: selectedRoles,
          branch_ids: selectedBranches,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات الموظف.';
          setError(msg);
        },
      }
    );
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogClose onClick={onClose} />

      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-clinic-50 border border-clinic-200 text-clinic-700 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-slate-900">تعديل بيانات الموظف</DialogTitle>
            <DialogDescription className="text-slate-500 mt-0.5">
              تعديل الصلاحيات والأدوار والفروع المسندة للمستخدم في العيادة
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {error && (
        <div className="my-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 my-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all"
            placeholder="مثال: د. محمد أحمد"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            البريد الإلكتروني <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all"
            placeholder="name@clinic.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-clinic-600" />
            الأدوار والصلاحيات (Spatie Scoped) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {AVAILABLE_ROLES.map((role) => {
              const isChecked = selectedRoles.includes(role.id);
              return (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-clinic-50/80 border-clinic-300 text-clinic-800 ring-1 ring-clinic-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                        isChecked
                          ? 'bg-clinic-600 border-clinic-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span>{role.label}</span>
                  </div>
                  <Badge variant={role.variant} className="text-[10px] uppercase font-mono">
                    {role.id}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-clinic-600" />
            الفروع المسندة للموظف (Anti-IDOR) <span className="text-red-500">*</span>
          </label>
          {branches.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
              لا توجد فروع مسجلة لهذه العيادة حالياً.
            </p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
              {branches.map((b) => {
                const isSelected = selectedBranches.includes(b.id);
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => toggleBranch(b.id)}
                    className={`w-full text-right px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-clinic-400 text-clinic-900 shadow-xs ring-1 ring-clinic-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-clinic-600 border-clinic-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="font-semibold">{b.name}</span>
                    </div>
                    {b.address && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {b.address}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-xs font-semibold"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={isPending}
            loadingText="جاري الحفظ..."
            className="text-xs font-bold"
          >
            حفظ التعديلات
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
