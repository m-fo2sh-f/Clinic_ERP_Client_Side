import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Loader2, Home, LogOut } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import { getRoleDefaultRoute } from '../../../utils/roleUtils';

export default function PlatformRoute({ children }) {
  const { user, loading, isLoading, logout } = useBranchContext();
  const location = useLocation();

  const isAuthLoading = loading || isLoading;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 shadow-xl">
          <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          <span className="text-sm font-medium text-slate-200">جاري التحقق من صلاحيات مدير المنصة...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strictly verify Super Admin flag
  if (!user.is_super_admin) {
    const defaultRoute = getRoleDefaultRoute(user);

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">غير مصرح بالوصول (403)</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            هذه المنطقة مخصصة حصرياً لمديري المنصة المركزية (<span className="text-indigo-400 font-semibold">Super Admins</span>).
            حسابك الحالي (<span className="text-clinic-400 font-semibold">{user.name}</span>) لا يمتلك صلاحيات إدارة المنصة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={defaultRoute}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-clinic-600 hover:bg-clinic-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-clinic-600/25"
            >
              <Home className="h-4 w-4" />
              الذهاب للوحتك الخاصة
            </a>

            <button
              onClick={logout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
