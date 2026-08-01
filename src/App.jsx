import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import WaitingRoomDisplay from './pages/WaitingRoomDisplay';
import { BranchProvider } from './context/BranchContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchProvider>
        <BrowserRouter>
          <Routes>
            {/* Receptionist & Doctor dashboards share the sidebar layout */}
            <Route path="/" element={<DashboardLayout><ReceptionistDashboard /></DashboardLayout>} />
            <Route path="/doctor" element={<DashboardLayout><DoctorDashboard /></DashboardLayout>} />

            {/* TV display is standalone — no sidebar/header chrome */}
            <Route path="/waiting-room" element={<WaitingRoomDisplay />} />
          </Routes>
        </BrowserRouter>
      </BranchProvider>
    </QueryClientProvider>
  );
}

export default App;
