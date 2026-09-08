import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Globe, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../../components/ui/Dialog';
import Button from '../../../components/ui/Button';

export default function ImpersonateConfirmModal({ isOpen, onClose, onConfirm, tenant, isPending }) {
  if (!tenant) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogClose onClick={onClose} />

      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-slate-900">
              Confirm Clinic Owner Impersonation
            </DialogTitle>
            <DialogDescription className="text-slate-550 mt-0.5">
              Authorized Super Admin administrative access
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 my-2">
        {/* Security Warning Box */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950 mb-1">
              Security Notice & Immutable Audit Log:
            </p>
            You are about to initiate an impersonated session as the owner of clinic{' '}
            <span className="font-mono font-bold text-amber-950">[{tenant.id}]</span>.
            A temporary session token will be generated, tagged with your IP address, and recorded in the central platform audit trail.
          </div>
        </div>

        {/* Tenant Details Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              Clinic Name:
            </span>
            <span className="font-bold text-slate-900">{tenant.clinic_name || tenant.id}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              Tenant Domain:
            </span>
            <span className="font-mono font-semibold text-clinic-700">{tenant.domain}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Session Duration:
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
              15 Minutes (Auto-Expires)
            </span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => onConfirm(tenant.id)}
          isLoading={isPending}
          loadingText="Authorizing Session..."
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
          leftIcon={<ShieldAlert className="h-4 w-4 shrink-0" />}
        >
          Confirm & Impersonate
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
