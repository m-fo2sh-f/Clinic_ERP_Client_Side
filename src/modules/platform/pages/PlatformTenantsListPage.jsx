import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Filter, ShieldAlert, ArrowLeft, Loader2, ChevronRight, ChevronLeft, Power } from 'lucide-react';
import { usePlatformTenants } from '../hooks/usePlatformTenants';
import { useTenantImpersonate, useToggleTenantStatus } from '../hooks/useTenantImpersonate';
import TenantStatusBadge from '../components/TenantStatusBadge';
import ImpersonateConfirmModal from '../components/ImpersonateConfirmModal';

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
      ? `هل أنت متأكد من تفعيل العيادة (${tenant.clinic_name || tenant.id})؟`
      : `هل أنت متأكد من إيقاف وتعليق العيادة (${tenant.clinic_name || tenant.id})؟`;

    if (window.confirm(confirmMsg)) {
      toggleStatus({ tenantId: tenant.id, isActive: nextState });
    }
  };

  const handleConfirmImpersonate = (tenantId) => {
    impersonate(tenantId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-clinic-400" />
            دليل وإدارة العيادات (Tenants Directory)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            إدارة كافة العيادات والمراكز الطبية المشتركة بالمنصة وتفاصيل نطاقاتها وحالات التفعيل.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم العيادة، المعرف، أو الدومين..."
            className="w-full pr-10 pl-4 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all"
          />
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
            className="bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-clinic-500 cursor-pointer"
          >
            <option value="all">كافة الحالات</option>
            <option value="true">العيادات النشطة فقط</option>
            <option value="false">العيادات المعلقة فقط</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase">
              <th className="py-3.5 px-4">اسم ومعرف العيادة</th>
              <th className="py-3.5 px-4">النطاق المخصص (Subdomain)</th>
              <th className="py-3.5 px-4">الفروع</th>
              <th className="py-3.5 px-4">الحالة</th>
              <th className="py-3.5 px-4">تاريخ التسجيل</th>
              <th className="py-3.5 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-xs text-slate-400">
                  <Loader2 className="h-6 w-6 text-clinic-500 animate-spin mx-auto mb-2" />
                  جاري تحميل العيادات...
                </td>
              </tr>
            ) : data?.tenants?.length ? (
              data.tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white group-hover:text-clinic-400 transition-colors">
                      {t.clinic_name || t.id}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">Tenant ID: {t.id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-clinic-400">
                    <a
                      href={`http://${t.domain}:5173`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {t.domain}
                    </a>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium text-xs">
                    {t.branches_count} فروع
                  </td>
                  <td className="py-3.5 px-4">
                    <TenantStatusBadge isActive={t.is_active} />
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-left">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(t)}
                        disabled={isToggling}
                        title={t.is_active ? 'تعليق العيادة' : 'تفعيل العيادة'}
                        className={`p-1.5 rounded-xl border transition-all ${
                          t.is_active
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setImpersonateTenant(t)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                      >
                        تقمص المالك
                      </button>

                      <Link
                        to={`/platform/tenants/${t.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-xs text-slate-500">
                  لم يتم العثور على عيادات مطابقة لمعايير البحث.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div>
            صفحة <span className="font-bold text-white">{data.meta.current_page}</span> من{' '}
            <span className="font-bold text-white">{data.meta.last_page}</span> (إجمالي {data.meta.total} عيادة)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-all"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
              disabled={page >= data.meta.last_page}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-all"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
