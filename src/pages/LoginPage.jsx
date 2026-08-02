import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { loginApi } from '../services/authService';
import { useBranchContext } from '../context/BranchContext';
import BranchSelectionModal from '../components/ui/BranchSelectionModal';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('doctor@healios.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingBranches, setPendingBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loggedInUserRoles, setLoggedInUserRoles] = useState([]);

  const navigate = useNavigate();
  const { user, loading, processLoginData, selectBranch } = useBranchContext();

  // If user is already authenticated on mount, redirect to their role dashboard
  useEffect(() => {
    if (user && !loading) {
      const userRoles = user.roles || (user.role ? [user.role] : []);
      const targetRoute = userRoles.includes('doctor') ? '/doctor' : '/dashboard';
      navigate(targetRoute, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleRedirectByRoles = (roles = []) => {
    if (roles.includes('doctor')) {
      navigate('/doctor', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginApi(email, password);
      const userRoles = data?.user?.roles || [];
      setLoggedInUserRoles(userRoles);

      const result = processLoginData(data);

      if (result.needsBranchSelection) {
        setPendingBranches(result.branches);
        setShowModal(true);
      } else {
        handleRedirectByRoles(userRoles);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchSelect = (branchId) => {
    selectBranch(branchId);
    setShowModal(false);
    handleRedirectByRoles(loggedInUserRoles);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        {/* Header Branding */}
        <div className="bg-slate-950 p-8 text-center border-b border-slate-800">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-clinic-600/10 text-clinic-400 border border-clinic-500/20 mb-3">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Healios SaaS</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Multi-Tenant Clinic ERP Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinic.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full justify-center py-3 font-bold text-sm shadow-lg shadow-clinic-600/20"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        </form>
      </div>

      {/* Branch Selection Modal for Case B (>1 branch) */}
      <BranchSelectionModal
        isOpen={showModal}
        branches={pendingBranches}
        onSelectBranch={handleBranchSelect}
      />
    </div>
  );
}
