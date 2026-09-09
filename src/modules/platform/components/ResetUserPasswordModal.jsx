import React, { useState } from 'react';
import { KeyRound, AlertTriangle, ShieldAlert, Check } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../../components/ui/Dialog';
import Button from '../../../components/ui/Button';
import { useResetPassword } from '../hooks/useTenantStaffMutations';

export default function ResetUserPasswordModal({ isOpen, onClose, user, tenantId }) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { mutate: resetPassword, isPending } = useResetPassword(tenantId);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password.length < 8) {
      setError('يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
      return;
    }

    resetPassword(
      {
        userId: user.id,
        data: {
          password,
          password_confirmation: passwordConfirmation,
        },
      },
      {
        onSuccess: (res) => {
          setSuccessMsg(res?.message || 'تم إعادة تعيين كلمة المرور بنجاح.');
          setPassword('');
          setPasswordConfirmation('');
          setTimeout(() => {
            onClose();
            setSuccessMsg(null);
          }, 1500);
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'فشل إعادة تعيين كلمة المرور.';
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
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-slate-900">إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription className="text-slate-500 mt-0.5">
              تغيير كلمة المرور للمستخدم: <strong className="text-slate-800">{user.name}</strong> ({user.email})
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs leading-relaxed my-2">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950 mb-1">تنبيه أمني وإجراء إلزامي:</p>
          <span>سيتم إنهاء كافة جلسات المستخدم الحالية تلقائياً وتسجيل العملية في سجل التدقيق الأمني.</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 my-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 my-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 my-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            كلمة المرور الجديدة (8 أحرف كحد أدنى) <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            تأكيد كلمة المرور الجديدة <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            placeholder="••••••••"
          />
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
            loadingText="جاري التحديث وإنهاء الجلسات..."
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
          >
            إعادة تعيين كلمة المرور
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
