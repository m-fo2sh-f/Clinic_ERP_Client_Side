import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Users,
  MapPin,
  CalendarDays,
  UserCheck,
  Power,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useTenantDetails, useTenantUsers } from '../hooks/useTenantDetails';
import { useTenantImpersonate, useToggleTenantStatus } from '../hooks/useTenantImpersonate';
import TenantStatusBadge from '../components/TenantStatusBadge';
import TenantUsersTable from '../components/TenantUsersTable';
import TenantBranchesList from '../components/TenantBranchesList';
import ImpersonateConfirmModal from '../components/ImpersonateConfirmModal';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function PlatformTenantDetailsPage() {
  const { id } = useParams();

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
        <Loader2 className="h-8 w-8 text-clinic-600 animate-spin" />
        <span className="text-sm font-medium text-slate-500">Loading clinic profile details...</span>
      </div>
    );
  }

  if (!tenant) {
    return (
      <Card className="text-center py-16 shadow-sm">
        <CardContent>
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">Clinic Not Found</h2>
          <p className="text-xs text-slate-500 mb-5">
            Unable to locate the specified clinic tenant ID in the platform registry.
          </p>
          <Link to="/platform/tenants">
            <Button
              variant="default"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Clinics Directory
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleToggleStatus = () => {
    const nextState = !tenant.is_active;
    const confirmMsg = nextState
      ? `Are you sure you want to activate clinic "${tenant.clinic_name || tenant.id}"?`
      : `Are you sure you want to suspend and disable clinic "${tenant.clinic_name || tenant.id}"?`;

    if (window.confirm(confirmMsg)) {
      toggleStatus({ tenantId: tenant.id, isActive: nextState });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="bg-white px-6 py-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/platform/tenants"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-1 font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Clinics Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight m-0">
              {tenant.clinic_name || tenant.id}
            </h1>
            <TenantStatusBadge isActive={tenant.is_active} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Tenant ID: {tenant.id}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-clinic-700 font-semibold">
              <Globe className="h-3.5 w-3.5 text-clinic-600" />
              {tenant.domain}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant={tenant.is_active ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
            disabled={isToggling}
            leftIcon={<Power className="h-4 w-4" />}
            className="text-xs font-semibold"
          >
            {tenant.is_active ? 'Suspend Clinic' : 'Activate Clinic'}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowImpersonateModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
            leftIcon={<ShieldAlert className="h-4 w-4" />}
          >
            Impersonate Owner (15m)
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-clinic-50 text-clinic-700 border border-clinic-200'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-clinic-50 text-clinic-700 border border-clinic-200'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          Staff Directory ({usersData?.meta?.total ?? '...'})
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-clinic-50 text-clinic-700 border border-clinic-200'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Branches ({tenant.branches_count ?? 0})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-clinic-300 transition-all">
              <div className="absolute top-0 right-0 p-3.5 bg-clinic-50 text-clinic-600 rounded-bl-xl">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Branches
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {tenant.branches_count ?? 0}
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-semibold">
                <span>{tenant.active_branches_count ?? 0} active branches</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-clinic-300 transition-all">
              <div className="absolute top-0 right-0 p-3.5 bg-clinic-50 text-clinic-600 rounded-bl-xl">
                <UserCheck className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Verified Doctors
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {tenant.total_doctors_count ?? 0}
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
                <span>Assigned doctor role</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-clinic-300 transition-all">
              <div className="absolute top-0 right-0 p-3.5 bg-indigo-50 text-indigo-600 rounded-bl-xl">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Patients
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {tenant.total_patients_count ?? 0}
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
                <span>Medical records on file</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-clinic-300 transition-all">
              <div className="absolute top-0 right-0 p-3.5 bg-amber-50 text-amber-600 rounded-bl-xl">
                <CalendarDays className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Bookings
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {tenant.total_appointments_count ?? 0}
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
                <span>Examinations & check-ups</span>
              </div>
            </div>
          </div>

          {/* Detailed Info Card */}
          <Card className="shadow-sm">
            <CardHeader className="p-5 bg-slate-50/50 border-b border-slate-200/80">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Tenant Connection & Domain Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-semibold">Direct Clinic Portal URL:</span>
                  <div className="font-mono text-clinic-700 text-sm font-bold flex items-center gap-1 mt-1">
                    <a
                      href={`http://${tenant.domain}:5173`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      http://{tenant.domain}:5173
                      <ExternalLink className="h-3.5 w-3.5 text-clinic-500" />
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-semibold">Registration Date:</span>
                  <div className="text-slate-800 text-sm font-bold mt-1">
                    {tenant.created_at
                      ? new Date(tenant.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Not recorded'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
