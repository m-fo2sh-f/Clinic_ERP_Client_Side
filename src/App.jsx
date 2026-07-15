import React, { useState } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import ReceptionistDashboard from './pages/ReceptionistDashboard';

function App() {
  // Shared state for multi-branch selector in header
  const [selectedBranchId, setSelectedBranchId] = useState('maadi');

  const branches = [
    { id: 'maadi', name: 'Maadi Branch', clinicSubdomain: 'maadi.my-saas.test' },
    { id: 'tagamoa', name: 'Tagamoa Branch', clinicSubdomain: 'tagamoa.my-saas.test' },
    { id: 'heliopolis', name: 'Heliopolis Branch', clinicSubdomain: 'heliopolis.my-saas.test' }
  ];

  return (
    <DashboardLayout
      branches={branches}
      selectedBranchId={selectedBranchId}
      setSelectedBranchId={setSelectedBranchId}
    >
      <ReceptionistDashboard
        selectedBranchId={selectedBranchId}
        branches={branches}
      />
    </DashboardLayout>
  );
}

export default App;
