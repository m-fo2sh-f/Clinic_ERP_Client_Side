import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  Activity,
  Globe,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { usePlatformMetrics } from '../hooks/usePlatformMetrics';
import { usePlatformTenants } from '../hooks/usePlatformTenants';
import { useTenantImpersonate } from '../hooks/useTenantImpersonate';
import MetricsGrid from '../components/MetricsGrid';
import TenantStatusBadge from '../components/TenantStatusBadge';
import ImpersonateConfirmModal from '../components/ImpersonateConfirmModal';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function PlatformDashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = usePlatformMetrics();
  const { data: tenantsData, isLoading: tenantsLoading } = usePlatformTenants({ page: 1, perPage: 5 });
  const { mutate: impersonate, isPending: isImpersonating } = useTenantImpersonate();

  const [impersonateTenant, setImpersonateTenant] = useState(null);

  const handleConfirmImpersonate = (tenantId) => {
    impersonate(tenantId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="bg-white px-6 py-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
            <Activity className="h-6 w-6 text-clinic-600 shrink-0" />
            Central Platform Overview & Analytics
          </h2>
          <p className="text-xs text-slate-550 mt-1 flex items-center gap-2 font-medium">
            <span>Global SaaS Context:</span>
            <strong className="text-clinic-700 bg-clinic-50 border border-clinic-150 px-2.5 py-0.5 rounded text-[11px] font-bold">
              Multi-Tenant Root
            </strong>
            {metricsLoading && <Loader2 className="h-3.5 w-3.5 text-clinic-600 animate-spin ml-1" />}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/platform/tenants">
            <Button
              variant="default"
              size="sm"
              className="text-xs font-semibold"
              leftIcon={<Building2 className="h-4 w-4" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View All Clinics
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Metrics Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-clinic-600" />
            Global Platform Real-Time Metrics
          </h3>
          <span className="text-xs text-slate-400 font-medium">Auto-synced live stats</span>
        </div>
        <MetricsGrid metrics={metrics} isLoading={metricsLoading} />
      </div>

      {/* Recent Tenants Section */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-clinic-600 shrink-0" />
            Recently Registered Clinics
          </CardTitle>
          <Link
            to="/platform/tenants"
            className="text-xs font-semibold text-clinic-600 hover:text-clinic-700 transition-colors flex items-center gap-1"
          >
            <span>View Full Directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Clinic & Tenant ID</th>
                  <th className="py-3.5 px-6">Assigned Subdomain</th>
                  <th className="py-3.5 px-6">Branches</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {tenantsLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-xs text-slate-400">
                      <Loader2 className="h-6 w-6 text-clinic-600 animate-spin mx-auto mb-2" />
                      Loading registered clinics...
                    </td>
                  </tr>
                ) : tenantsData?.tenants?.length ? (
                  tenantsData.tenants.map((t) => (
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
                          <span>{t.domain}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {t.branches_count} {t.branches_count === 1 ? 'Branch' : 'Branches'}
                      </td>

                      <td className="py-4 px-6">
                        <TenantStatusBadge isActive={t.is_active} />
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
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
                    <td colSpan={5} className="text-center py-12 text-xs text-slate-400">
                      No clinics registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
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
