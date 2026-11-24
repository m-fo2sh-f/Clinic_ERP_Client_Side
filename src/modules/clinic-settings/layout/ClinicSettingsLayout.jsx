import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Settings, UserCircle2, Stethoscope, Receipt, Activity, FileText } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import { getUserRoles } from '../../../utils/roleUtils';
import usePrescriptionTemplate from '../hooks/usePrescriptionTemplate';

const PAGE_HEADERS = {
  '/settings/prescription': {
    title: 'استوديو وقوالب الروشتة (Prescription Template Studio)',
    description: 'تخصيص هوية العيادة، الهيدر والفوتر، الهوامش والطباعة، وتخطيط الفحص الطبي.',
    icon: FileText,
  },
  '/settings/vitals': {
    title: 'تخصيص القياسات الحيوية (Dynamic Vitals Configuration)',
    description: 'تفعيل وتعطيل العلامات الحيوية، قياسات النظر وكروت الانكسار، وإضافة قياسات مخصصة.',
    icon: Activity,
  },
  '/settings/services': {
    title: 'دليل الخدمات الطبية والأسعار (Services & Pricing Catalog)',
    description: 'إدارة قائمة الخدمات الطبية، التسعير، والرموز الكودية المتاحة في هذا الفرع.',
    icon: Receipt,
  },
};

export default function ClinicSettingsLayout() {
  const { activeBranch, user } = useBranchContext();
  const location = useLocation();

  const userRoles = getUserRoles(user);
  const isOwnerOrAdmin = userRoles.includes('clinic_owner') || userRoles.includes('tenant_admin');
  const isDoctorOnly = userRoles.includes('doctor') && !isOwnerOrAdmin;

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    isDoctorOnly ? user?.id : null
  );

  const { settings } = usePrescriptionTemplate(activeBranch?.id, selectedDoctorId);
  const branchDoctors = settings?.branch_doctors || [];

  const currentHeader = PAGE_HEADERS[location.pathname] || {
    title: 'إعدادات العيادة والطباعة (Clinic Settings & Control)',
    description: 'تخصيص هوية العيادة، قوالب واستوديو الروشتات، قياسات الفحص الحيوي، وقائمة الخدمات والأسعار.',
    icon: Settings,
  };
  const HeaderIcon = currentHeader.icon;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Settings Master Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
            <HeaderIcon className="h-5 w-5 text-clinic-600 shrink-0" />
            <span>{currentHeader.title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            {currentHeader.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Doctor Switcher for Clinic Owner */}
          {isOwnerOrAdmin ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs w-full sm:w-auto">
              <UserCircle2 className="h-4 w-4 text-clinic-600 shrink-0" />
              <label htmlFor="doctor-settings-select" className="text-slate-500 font-medium whitespace-nowrap shrink-0">
                النطاق:
              </label>
              <select
                id="doctor-settings-select"
                value={selectedDoctorId || ''}
                onChange={(e) => setSelectedDoctorId(e.target.value ? Number(e.target.value) : null)}
                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer w-full sm:max-w-[240px] truncate"
              >
                <option value="">إعدادات الفرع الافتراضية (العامة)</option>
                {branchDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    إعدادات الطبيب: {doc.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-clinic-50 border border-clinic-200 px-3 py-1.5 rounded-xl text-xs text-clinic-800">
              <Stethoscope className="h-4 w-4 text-clinic-600 shrink-0" />
              <span>إعدادات الطبيب: <strong>{user?.name}</strong></span>
            </div>
          )}
        </div>
      </div>
      {/* Sub-page Outlet */}
      <div>
        <Outlet context={{ selectedDoctorId, setSelectedDoctorId, branchDoctors }} />
      </div>
    </div>
  );
}
