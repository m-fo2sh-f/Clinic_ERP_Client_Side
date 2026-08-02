import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import DashboardLayout from './layouts/DashboardLayout';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import WaitingRoomDisplay from './pages/WaitingRoomDisplay';
import LoginPage from './pages/LoginPage';
import { BranchProvider, useBranchContext } from './context/BranchContext';
import { ProtectedRoute, getRoleDefaultRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Smart Root Redirect Component
 * Redirects authenticated users to their role-specific dashboard (/doctor or /dashboard),
 * or redirects unauthenticated visitors to /login.
 */
const RootRedirect = () => {
  const { user, loading } = useBranchContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl px-6 py-4 shadow-xl backdrop-blur-md">
          <Loader2 className="h-6 w-6 text-clinic-600 animate-spin" />
          <span className="text-sm font-medium text-slate-200">جاري تحميل التطبيق...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleDefaultRoute(user)} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              {/* Smart Root Landing Redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public authentication route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Receptionist Dashboard - Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['receptionist', 'tenant_admin']}>
                    <DashboardLayout><ReceptionistDashboard /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Doctor Dashboard - Protected */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'tenant_admin']}>
                    <DashboardLayout><DoctorDashboard /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Standalone TV display */}
              <Route path="/waiting-room" element={<WaitingRoomDisplay />} />
            </Routes>
          </ErrorBoundary>

        </BrowserRouter>
      </BranchProvider>
    </QueryClientProvider>
  );
}

export default App;
