import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, ArrowUpRight, ShieldCheck, Activity, Search } from 'lucide-react';
import { usePlatformMetrics } from '../hooks/usePlatformMetrics';
import { usePlatformTenants } from '../hooks/usePlatformTenants';
import { useTenantImpersonate } from '../hooks/useTenantImpersonate';
import MetricsGrid from '../components/MetricsGrid';
import TenantStatusBadge from '../components/TenantStatusBadge';
import ImpersonateConfirmModal from '../components/ImpersonateConfirmModal';

export default function PlatformDashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = usePlatformMetrics();
  const { data: tenantsData, isLoading: tenantsLoading } = usePlatformTenants({ page: 1, perPage: 5 });
  const { mutate: impersonate, isPending: isImpersonating } = useTenantImpersonate();

  const [impersonateTenant, setImpersonateTenant] = useState(null);

  const handleConfirmImpersonate = (tenantId) => {
    impersonate(tenantId);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Platform Indicator */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Central SaaS Platform Context
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            لوحة الإدارة المركزية الشاملة للمنصة
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            مراقبة شاملة لكافة العيادات المشتركة، الفروع، الطواقم الطبية، ومؤشرات الأداء اللحظية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/platform/tenants"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-clinic-600 hover:bg-clinic-500 text-white font-bold text-xs shadow-lg shadow-clinic-600/20 transition-all"
          >
            <Building2 className="h-4 w-4" />
            دليل العيادات الكامل
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Global Metrics Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Activity className="h-4 w-4 text-clinic-400" />
            المؤشرات التجميعية اللحظية (Global Platform Metrics)
          </h2>
          <span className="text-[11px] text-slate-500">تحديث تلقائي كل 30 ثانية</span>
        </div>
        <MetricsGrid metrics={metrics} isLoading={metricsLoading} />
      </section>

      {/* Recent Tenants Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">أحدث العيادات المسجلة بالمنصة</h3>
          </div>
          <Link
            to="/platform/tenants"
            className="text-xs font-semibold text-clinic-400 hover:text-clinic-300 transition-colors flex items-center gap-1"
          >
            عرض الكل
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase">
                <th className="py-3.5 px-4">معرف العيادة (Tenant)</th>
                <th className="py-3.5 px-4">الدومين المعين</th>
                <th className="py-3.5 px-4">الفروع</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tenantsLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-slate-500">
                    جاري تحميل العيادات...
                  </td>
                </tr>
              ) : tenantsData?.tenants?.length ? (
                tenantsData.tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{t.clinic_name || t.id}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{t.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-clinic-400">
                      {t.domain}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium text-xs">
                      {t.branches_count} فروع
                    </td>
                    <td className="py-3.5 px-4">
                      <TenantStatusBadge isActive={t.is_active} />
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setImpersonateTenant(t)}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                        >
                          تقمص المالك
                        </button>
                        <Link
                          to={`/platform/tenants/${t.id}`}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          التفاصيل
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-slate-500">
                    لا توجد عيادات مسجلة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
