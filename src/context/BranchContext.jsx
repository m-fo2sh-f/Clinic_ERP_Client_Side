import React, { createContext, useState, useContext } from 'react';

const BranchContext = createContext();

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }) => {
  const branches = [
    { id: '019f7c1e-bdf9-72ee-908c-cc55d9a81afc', name: 'Maadi Branch', clinicSubdomain: 'maadi.my-saas.test' },
    { id: '019f7c1e-be18-726c-aafb-3457151e6038', name: 'Tagamoa Branch', clinicSubdomain: 'tagamoa.my-saas.test' },
  ];

  const [selectedBranchId, setSelectedBranchId] = useState(branches[0].id);

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <BranchContext.Provider value={{
      branches,
      selectedBranchId,
      setSelectedBranchId,
      activeBranch
    }}>
      {children}
    </BranchContext.Provider>
  );
};
