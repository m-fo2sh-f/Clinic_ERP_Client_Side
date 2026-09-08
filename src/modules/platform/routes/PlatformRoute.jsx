import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, Loader2, Home, LogOut } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import { getRoleDefaultRoute } from '../../../utils/roleUtils';
import Button from '../../../components/ui/Button';

export default function PlatformRoute({ children }) {
  const { user, loading, isLoading, logout } = useBranchContext();
  const location = useLocation();

  const isAuthLoading = loading || isLoading;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl px-6 py-4 shadow-xl">
          <Loader2 className="h-6 w-6 text-clinic-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-700">Verifying Super Admin Authorization...</span>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied (403)</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            This console is strictly restricted to Central Platform Super Administrators.
            Your account (<span className="text-clinic-700 font-semibold">{user.name}</span>) does not possess platform management privileges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={defaultRoute} className="w-full sm:w-auto">
              <Button
                variant="default"
                size="sm"
                className="w-full text-xs font-semibold"
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go to My Dashboard
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full sm:w-auto text-xs font-semibold"
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Logout Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
