import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  ShieldAlert,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Power,
  Globe,
  X,
} from 'lucide-react';
import { usePlatformTenants } from '../hooks/usePlatformTenants';
import { useTenantImpersonate, useToggleTenantStatus } from '../hooks/useTenantImpersonate';
import TenantStatusBadge from '../components/TenantStatusBadge';
import ImpersonateConfirmModal from '../components/ImpersonateConfirmModal';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function PlatformTenantsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [impersonateTenant, setImpersonateTenant] = useState(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = usePlatformTenants({
    page,
    search: debouncedSearch,
    status,
    perPage: 10,
  });

  const { mutate: impersonate, isPending: isImpersonating } = useTenantImpersonate();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleTenantStatus();

  const handleToggleStatus = (tenant) => {
    const nextState = !tenant.is_active;
    const confirmMsg = nextState
      ? `Are you sure you want to activate clinic "${tenant.clinic_name || tenant.id}"?`
      : `Are you sure you want to suspend and disable clinic "${tenant.clinic_name || tenant.id}"?`;

    if (window.confirm(confirmMsg)) {
      toggleStatus({ tenantId: tenant.id, isActive: nextState });
    }
  };

  const handleConfirmImpersonate = (tenantId) => {
    impersonate(tenantId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="bg-white px-6 py-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-clinic-600 shrink-0" />
            Clinics & Tenants Directory
          </h2>
          <p className="text-xs text-slate-550 mt-1 flex items-center gap-2 font-medium">
            <span>Provisioned Tenants:</span>
            <strong className="text-clinic-700 bg-clinic-50 border border-clinic-150 px-2.5 py-0.5 rounded text-[11px] font-bold">
              {data?.meta?.total ?? '...'} Clinics Registered
            </strong>
            {isLoading && <Loader2 className="h-3.5 w-3.5 text-clinic-600 animate-spin ml-1" />}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by clinic name, ID, or domain..."
            className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 bg-white text-xs font-medium text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinic-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="true">Active Clinics Only</option>
            <option value="false">Suspended Clinics Only</option>
          </select>
        </div>
      </div>

      {/* Tenants Table Card */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Clinic Name & ID</th>
                  <th className="py-3.5 px-6">Assigned Subdomain</th>
                  <th className="py-3.5 px-6">Branches</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Registered Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-xs text-slate-400">
                      <Loader2 className="h-6 w-6 text-clinic-600 animate-spin mx-auto mb-2" />
                      Loading clinics directory...
                    </td>
                  </tr>
                ) : data?.tenants?.length ? (
                  data.tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-clinic-50 border border-clinic-200 text-clinic-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                            {t.clinic_name ? t.clinic_name.slice(0, 2) : 'CL'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              {t.clinic_name || t.id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Tenant ID: {t.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono text-xs text-clinic-700">
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-slate-400" />
                          <a
                            href={`http://${t.domain}:5173`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline font-semibold"
                          >
                            {t.domain}
                          </a>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {t.branches_count} {t.branches_count === 1 ? 'Branch' : 'Branches'}
                      </td>

                      <td className="py-4 px-6">
                        <TenantStatusBadge isActive={t.is_active} />
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(t)}
                            disabled={isToggling}
                            title={t.is_active ? 'Suspend Clinic' : 'Activate Clinic'}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              t.is_active
                                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImpersonateTenant(t)}
                            className="text-xs font-semibold border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-100"
                            leftIcon={<ShieldAlert className="h-3.5 w-3.5 text-amber-600" />}
                          >
                            Impersonate
                          </Button>

                          <Link to={`/platform/tenants/${t.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold"
                            >
                              Details
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-xs text-slate-400">
                      No clinics found matching the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination Controls */}
        {data?.meta && data.meta.last_page > 1 && (
          <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            <div>
              Page <strong className="text-slate-800">{data.meta.current_page}</strong> of{' '}
              <strong className="text-slate-800">{data.meta.last_page}</strong> ({data.meta.total} total clinics)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
                disabled={page >= data.meta.last_page}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Impersonation Confirmation Modal */}
      <ImpersonateConfirmModal
        isOpen={Boolean(impersonateTenant)}
        tenant={impersonateTenant}
        onClose={() => setImpersonateTenant(null)}
        onConfirm={handleConfirmImpersonate}
        isPending={isImpersonating}
      />
    </div>
  );
}
