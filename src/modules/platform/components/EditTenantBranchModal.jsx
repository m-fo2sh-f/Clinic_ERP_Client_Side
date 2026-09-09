import React, { useState, useEffect } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../../components/ui/Dialog';
import Button from '../../../components/ui/Button';
import { useUpdateBranch } from '../hooks/useTenantBranchMutations';

export default function EditTenantBranchModal({ isOpen, onClose, branch, tenantId }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);

  const { mutate: updateBranch, isPending } = useUpdateBranch(tenantId);

  useEffect(() => {
    if (branch) {
      setName(branch.name || '');
      setAddress(branch.address || '');
      setPhone(branch.phone || '');
      setIsActive(branch.is_active !== undefined ? Boolean(branch.is_active) : true);
      setError(null);
    }
  }, [branch]);

  if (!branch) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى إدخال اسم الفرع.');
      return;
    }

    updateBranch(
      {
        branchId: branch.id,
        data: {
          name: name.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
          is_active: Boolean(isActive),
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'فشل تحديث بيانات الفرع.';
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
          <div className="h-10 w-10 rounded-xl bg-clinic-50 border border-clinic-200 text-clinic-600 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-slate-900">تعديل بيانات الفرع</DialogTitle>
            <DialogDescription className="text-slate-500 mt-0.5">
              تحديث بيانات الاتصال والعنوان وحالة نشاط الفرع
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
            اسم الفرع <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all"
            placeholder="مثال: الفرع الرئيسي - القاهرة"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            العنوان
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all"
            placeholder="مثال: 12 شارع التحرير، الدقي"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all"
            placeholder="مثال: 01012345678"
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <div>
              <span className="block text-xs font-bold text-slate-900">حالة الفرع</span>
              <span className="block text-[11px] text-slate-500">
                {isActive ? 'الفرع نشط ويستقبل حجوزات ومرضى' : 'الفرع معطل وموقوف عن الخدمة مؤقتاً'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-clinic-600 focus:ring-clinic-500 cursor-pointer"
            />
          </label>
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
            حفظ بيانات الفرع
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
