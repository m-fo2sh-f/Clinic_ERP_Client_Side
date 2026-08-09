import React from 'react'
import { Route, Routes } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard'
import DoctorDashboard from '../pages/doctor/DoctorDashboard'
import PatientsPage from '../pages/patients/PatientsPage'
import WaitingRoomDisplay from '../pages/waiting_room/WaitingRoomDisplay'
import DashboardLayout from '../layouts/DashboardLayout'
import { ProtectedRoute, getRoleDefaultRoute } from './ProtectedRoute'
import { useBranchContext } from '../context/BranchContext'
import { Loader2 } from 'lucide-react'
import { Navigate } from 'react-router-dom';


function AppRoutes() {
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
    return (
        <div>

            <Routes>
                {/* Smart Root Landing Redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Public authentication route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Receptionist Dashboard - Protected */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['receptionist', 'tenant_admin', 'clinic_owner']}>
                            <DashboardLayout><ReceptionistDashboard /></DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Doctor Dashboard - Protected */}
                <Route
                    path="/doctor"
                    element={
                        <ProtectedRoute allowedRoles={['doctor', 'tenant_admin', 'clinic_owner']}>
                            <DashboardLayout><DoctorDashboard /></DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Patients Directory & Medical Profiles - Protected */}
                <Route
                    path="/patients"
                    element={
                        <ProtectedRoute allowedRoles={['receptionist', 'doctor', 'tenant_admin', 'clinic_owner']}>
                            <DashboardLayout><PatientsPage /></DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Standalone TV display */}
                <Route path="/waiting-room" element={<WaitingRoomDisplay />} />
            </Routes>
        </div>
    )
}

export default AppRoutes