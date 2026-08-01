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
    { id: '019f9f77-355d-7094-b223-dc822a2bc79f', name: 'Maadi Branch', clinicSubdomain: 'maadi.my-saas.test' },
    { id: '019f9f77-3569-72f3-a596-2ddc8ded0be5', name: 'Tagamoa Branch', clinicSubdomain: 'tagamoa.my-saas.test' },
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
