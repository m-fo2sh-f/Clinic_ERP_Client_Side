import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import { BranchProvider } from './context/BranchContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Optional: customize to your liking
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchProvider>
        <DashboardLayout>
          <ReceptionistDashboard />
        </DashboardLayout>
      </BranchProvider>
    </QueryClientProvider>
  );
}

export default App;
