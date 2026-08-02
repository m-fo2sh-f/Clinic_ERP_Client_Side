import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMeApi, logoutApi } from '../services/authService';

const BranchContext = createContext();

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchIdState] = useState(() => {
    return localStorage.getItem('active_branch_id') || '';
  });

  const selectBranch = (branchId) => {
    if (branchId) {
      localStorage.setItem('active_branch_id', branchId);
      setSelectedBranchIdState(branchId);
    }
  };

  const processLoginData = (data) => {
    const userBranches = data?.branches?.length ? data.branches : [];
    const userData = data?.user || null;

    setBranches(userBranches);
    setUser(userData);

    const storedBranchId = localStorage.getItem('active_branch_id');
    const hasValidStored = userBranches.some(b => b.id === storedBranchId);

    if (userBranches.length === 1) {
      const singleBranchId = userBranches[0].id;
      selectBranch(singleBranchId);
      return { needsBranchSelection: false, activeBranchId: singleBranchId };
    } else if (userBranches.length > 1) {
      if (hasValidStored && storedBranchId) {
        setSelectedBranchIdState(storedBranchId);
        return { needsBranchSelection: false, activeBranchId: storedBranchId };
      }
      return { needsBranchSelection: true, branches: userBranches };
    } else {
      return { needsBranchSelection: false, activeBranchId: null };
    }
  };

  useEffect(() => {
    setLoading(true);
    getMeApi()
      .then((data) => {
        if (data?.branches?.length || data?.user) {
          processLoginData(data);
        }
      })
      .catch(() => {
        // Unauthenticated or fresh session
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setBranches([]);
      localStorage.removeItem('active_branch_id');
      setSelectedBranchIdState('');
    }
  };

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0] || { name: 'No Branch Selected', id: '' };

  return (
    <BranchContext.Provider value={{
      branches,
      setBranches,
      user,
      setUser,
      loading,
      isLoading: loading,
      selectedBranchId,
      setSelectedBranchId: selectBranch,
      selectBranch,
      activeBranch,
      processLoginData,
      logout
    }}>
      {children}
    </BranchContext.Provider>
  );
};
