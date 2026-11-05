import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Settings, Building2 } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import { SETTINGS_NAVIGATION_ITEMS } from '../constants/settingsNavigation';

export default function ClinicSettingsLayout() {
  const { activeBranch } = useBranchContext();
  const branchName = activeBranch?.name || 'الفرع الرئيسي';
  const location = useLocation();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Settings Master Header */}
      <div className="bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2.5">
            <Settings className="h-5 w-5 text-clinic-600" />
            <span>إعدادات العيادة والطباعة (Clinic Settings & Control)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            تخصيص هوية العيادة، قوالب الروشتات الطبية، معايرة مقاسات الورق والهوامش، وقائمة الخدمات والأسعار.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <Building2 className="h-4 w-4 text-clinic-600" />
          <span className="text-slate-500 font-medium">الفرع الحالي:</span>
          <strong className="text-slate-800 font-bold">{branchName}</strong>
        </div>
      </div>

     

      {/* Sub-page Outlet */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
