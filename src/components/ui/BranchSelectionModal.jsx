import React, { useState } from 'react';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import Button from './Button';

export default function BranchSelectionModal({ isOpen, branches = [], onSelectBranch }) {
  const [selectedId, setSelectedId] = useState(branches[0]?.id || '');

  const handleConfirm = () => {
    const targetId = selectedId || branches[0]?.id;
    if (targetId && onSelectBranch) {
      onSelectBranch(targetId);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => {}}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-clinic-50 text-clinic-600 border border-clinic-150">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Select Active Branch
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Your account has access to multiple branches. Select your active branch to continue.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="my-5 space-y-2.5">
        {branches.map((branch) => {
          const isSelected = selectedId === branch.id;
          return (
            <div
              key={branch.id}
              onClick={() => setSelectedId(branch.id)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-clinic-500 bg-clinic-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-clinic-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{branch.name}</h4>
                  {branch.clinicSubdomain && (
                    <p className="text-[11px] font-mono text-slate-450">{branch.clinicSubdomain}</p>
                  )}
                </div>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-clinic-600 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <DialogFooter>
        <Button
          variant="primary"
          className="w-full justify-center gap-2 py-2.5 font-bold shadow-lg shadow-clinic-500/20"
          onClick={handleConfirm}
          disabled={!selectedId && branches.length > 0}
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
