import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Loader2, Home, LogOut } from 'lucide-react';
import { useBranchContext } from '../context/BranchContext';

export const getRoleDefaultRoute = (user) => {
  if (!user) return '/login';
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.includes('doctor')) return '/doctor';
  return '/dashboard';
};

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isLoading, logout } = useBranchContext();
  const location = useLocation();

  const isAuthLoading = loading || isLoading;

  // 1. Show clean loading indicator while authenticating
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl px-6 py-4 shadow-xl backdrop-blur-md">
          <Loader2 className="h-6 w-6 text-clinic-600 animate-spin" />
          <span className="text-sm font-medium text-slate-200">جاري التحقق من صلاحيات الدخول...</span>
        </div>
      </div>
    );
  }

  // 2. Redirect to /login if user is not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check role-based permissions if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || (user.role ? [user.role] : []);
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      const defaultRoute = getRoleDefaultRoute(user);

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 text-center text-white shadow-2xl backdrop-blur-lg">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100 mb-2">غير مصرح بالوصول (403)</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              حسابك الحالي (<span className="text-clinic-400 font-semibold">{user.name}</span> - {userRoles.join(', ')}) لا يمتلك الصلاحية لعرض هذه الشاشة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={defaultRoute}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-clinic-600 hover:bg-clinic-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-clinic-600/25"
              >
                <Home className="h-4 w-4" />
                الذهاب للوحتك الخاصة
              </a>

              <button
                onClick={logout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. Authorized -> Render requested page
  return children;
};

export default ProtectedRoute;
