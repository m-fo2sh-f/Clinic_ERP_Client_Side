import React from 'react';
import { Receipt, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import { getUserRoles } from '../../../utils/roleUtils';
import useClinicServicesManager from '../hooks/useClinicServicesManager';
import ServiceCatalogTable from '../components/services/ServiceCatalogTable';
import ServiceFormModal from '../components/services/ServiceFormModal';

export default function ClinicServicesPage() {
  const { activeBranch, user } = useBranchContext();
  const branchId = activeBranch?.id;

  const roles = getUserRoles(user);
  const isClinicOwner = roles.includes('clinic_owner') || roles.includes('tenant_admin');
  const isReadOnly = !isClinicOwner;

  const {
    services,
    allServicesCount,
    isLoading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    editingService,
    openAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    isSaving,
    isDeleting,
    feedbackMsg,
  } = useClinicServicesManager(branchId, isReadOnly);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-clinic-600" />
        <span>جاري تحميل قائمة الخدمات الطبية والأسعار...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Page Header */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-clinic-600" />
            <span>قائمة الخدمات الطبية والتسعير (Clinic Services & Fees)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            إجمالي الخدمات المسجلة بالفرع: <strong className="text-slate-800">{allServicesCount} خدمة</strong>
          </p>
        </div>
      </div>

      {/* RBAC Read-Only Notice for Doctors */}
      {isReadOnly && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-2xl text-xs flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>وضع العرض فقط:</strong> تعديل أسعار وإضافة خدمات العيادة متاح حصرياً لمدير العيادة (Clinic Owner).
          </span>
        </div>
      )}

      {/* Status Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Service Table */}
      <ServiceCatalogTable
        services={services}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={openAddModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        isReadOnly={isReadOnly}
        isDeleting={isDeleting}
      />

      {/* Add / Edit Modal */}
      {!isReadOnly && (
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          editingService={editingService}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
