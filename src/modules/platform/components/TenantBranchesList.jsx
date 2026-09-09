import React, { useState } from 'react';
import { Building2, MapPin, Phone, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EditTenantBranchModal from './EditTenantBranchModal';

export default function TenantBranchesList({ branches, tenantId }) {
  const [selectedBranchForEdit, setSelectedBranchForEdit] = useState(null);

  if (!branches || branches.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700 m-0">No Branches Registered</p>
        <p className="text-xs text-slate-400 mt-1 m-0">
          This clinic has not provisioned any branches yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white border border-slate-200/80 hover:border-clinic-300 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-clinic-50 border border-clinic-100 text-clinic-600 group-hover:scale-105 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
                {branch.is_active ? (
                  <Badge variant="success" className="gap-1 font-semibold text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 font-semibold text-xs">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-clinic-600 transition-colors">
                {branch.name}
              </h4>

              <div className="space-y-2 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{branch.address || 'Address not specified'}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2 font-mono text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Branch ID</span>
                <span className="truncate max-w-[130px] block">{branch.id}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedBranchForEdit(branch)}
                leftIcon={<Edit3 className="h-3.5 w-3.5 text-clinic-600" />}
                className="text-xs font-semibold px-3 py-1.5 h-auto hover:bg-clinic-50 hover:text-clinic-700 hover:border-clinic-300 transition-all cursor-pointer"
              >
                تعديل الفرع
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedBranchForEdit && (
        <EditTenantBranchModal
          isOpen={Boolean(selectedBranchForEdit)}
          onClose={() => setSelectedBranchForEdit(null)}
          branch={selectedBranchForEdit}
          tenantId={tenantId}
        />
      )}
    </>
  );
}
