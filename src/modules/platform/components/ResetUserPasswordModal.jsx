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
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Password and confirmation do not match.');
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
          setSuccessMsg(res?.message || 'Password reset successfully.');
          setPassword('');
          setPasswordConfirmation('');
          setTimeout(() => {
            onClose();
            setSuccessMsg(null);
          }, 1500);
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'Failed to reset password.';
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
            <DialogTitle className="text-slate-900">Reset User Password</DialogTitle>
            <DialogDescription className="text-slate-500 mt-0.5">
              Change password for: <strong className="text-slate-800">{user.name}</strong> ({user.email})
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs leading-relaxed my-2">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950 mb-1">Security Notice:</p>
          <span>All active sessions for this user will be terminated immediately and logged in audit trails.</span>
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
            New Password (Min 8 characters) <span className="text-red-500">*</span>
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
            Confirm New Password <span className="text-red-500">*</span>
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
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={isPending}
            loadingText="Resetting password..."
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
          >
            Reset Password
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
