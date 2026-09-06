import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  Users,
  MapPin,
  CalendarDays,
  UserCheck,
  Power,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Globe,
  Clock,
} from 'lucide-react';
import { useTenantDetails, useTenantUsers } from '../hooks/useTenantDetails';
import { useTenantImpersonate, useToggleTenantStatus } from '../hooks/useTenantImpersonate';
import TenantStatusBadge from '../components/TenantStatusBadge';
import TenantUsersTable from '../components/TenantUsersTable';
import TenantBranchesList from '../components/TenantBranchesList';
import ImpersonateConfirmModal from '../components/ImpersonateConfirmModal';

export default function PlatformTenantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'branches'
  const [usersPage, setUsersPage] = useState(1);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);

  const { data: tenant, isLoading: tenantLoading } = useTenantDetails(id);
  const { data: usersData, isLoading: usersLoading } = useTenantUsers(id, {
    page: usersPage,
    perPage: 10,
  });

  const { mutate: impersonate, isPending: isImpersonating } = useTenantImpersonate();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleTenantStatus();

  if (tenantLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-clinic-500 animate-spin" />
        <span className="text-sm font-medium text-slate-400">جاري تحميل بيانات العيادة...</span>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
        <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">العيادة غير موجودة</h2>
        <p className="text-xs text-slate-400 mb-5">تعذر العثور على العيادة المطلوبة بالمعرف المحدد.</p>
        <Link
          to="/platform/tenants"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لقائمة العيادات
        </Link>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const nextState = !tenant.is_active;
    const confirmMsg = nextState
      ? `هل أنت متأكد من تفعيل العيادة (${tenant.clinic_name || tenant.id})؟`
      : `هل أنت متأكد من إيقاف وتعليق العيادة (${tenant.clinic_name || tenant.id})؟`;

    if (window.confirm(confirmMsg)) {
      toggleStatus({ tenantId: tenant.id, isActive: nextState });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            to="/platform/tenants"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            العودة لدليل العيادات
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {tenant.clinic_name || tenant.id}
            </h1>
            <TenantStatusBadge isActive={tenant.is_active} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>ID: {tenant.id}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-clinic-400">
              <Globe className="h-3.5 w-3.5" />
              {tenant.domain}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              tenant.is_active
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            {tenant.is_active ? 'تعليق العيادة' : 'تفعيل العيادة'}
          </button>

          <button
            type="button"
            onClick={() => setShowImpersonateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold shadow-lg shadow-amber-500/10 transition-all"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            تقمص دور المالك (15 دقيقة)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-clinic-600/20 text-clinic-400 border border-clinic-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          نظرة عامة وإحصائيات
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-clinic-600/20 text-clinic-400 border border-clinic-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          الطاقم الطبي والإداري ({usersData?.meta?.total ?? '...'})
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'branches'
              ? 'bg-clinic-600/20 text-clinic-400 border border-clinic-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          الفروع التابعة ({tenant.branches_count ?? 0})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">إجمالي الفروع</span>
                <MapPin className="h-4 w-4 text-clinic-400" />
              </div>
              <div className="text-2xl font-black text-white">{tenant.branches_count}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                {tenant.active_branches_count} فروع نشطة
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">الأطباء المعتمدون</span>
                <UserCheck className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">{tenant.total_doctors_count}</div>
              <div className="text-[11px] text-slate-500 mt-1">يحملون دور doctor</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">إجمالي المرضى</span>
                <Users className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">{tenant.total_patients_count}</div>
              <div className="text-[11px] text-slate-500 mt-1">ملفات مسجلة بالعيادة</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">إجمالي الحجوزات</span>
                <CalendarDays className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{tenant.total_appointments_count}</div>
              <div className="text-[11px] text-slate-500 mt-1">كشوفات واستشارات</div>
            </div>
          </div>

          {/* Detailed Info Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              بيانات المستأجر والاتصال
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold">رابط بوابة العيادة المباشر:</span>
                <div className="font-mono text-clinic-400 text-sm flex items-center gap-1 mt-1">
                  <a
                    href={`http://${tenant.domain}:5173`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    http://{tenant.domain}:5173
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold">تاريخ إنشاء الاشتراك:</span>
                <div className="text-slate-200 text-sm font-semibold mt-1">
                  {tenant.created_at
                    ? new Date(tenant.created_at).toLocaleString('ar-EG')
                    : 'غير مسجل'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <TenantUsersTable
          users={usersData?.users || []}
          meta={usersData?.meta}
          page={usersPage}
          setPage={setUsersPage}
          isLoading={usersLoading}
        />
      )}

      {/* Tab 3: Branches */}
      {activeTab === 'branches' && (
        <TenantBranchesList branches={tenant.branches || []} />
      )}

      {/* Impersonation Modal */}
      <ImpersonateConfirmModal
        isOpen={showImpersonateModal}
        tenant={tenant}
        onClose={() => setShowImpersonateModal(false)}
        onConfirm={(tenantId) => impersonate(tenantId)}
        isPending={isImpersonating}
      />
    </div>
  );
}
