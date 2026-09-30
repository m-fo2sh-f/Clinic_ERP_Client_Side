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

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0] || { name: 'No Branch Selected', id: '', clinic_mode: 'solo' };
  const clinicMode = activeBranch?.clinic_mode || 'solo';
  const vitalsConfig = Array.isArray(activeBranch?.vitals_config) && activeBranch.vitals_config.length > 0
    ? activeBranch.vitals_config
    : [
        { key: 'bp_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', type: 'number' },
        { key: 'bp_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', type: 'number' },
        { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', type: 'number' },
        { key: 'temperature', label: 'Body Temperature', unit: '°C', type: 'number', step: '0.1' },
        { key: 'respiratory_rate', label: 'Respiratory Rate', unit: 'bpm', type: 'number' },
        { key: 'spo2', label: 'Oxygen Saturation (SpO2)', unit: '%', type: 'number' },
        { key: 'weight', label: 'Weight', unit: 'kg', type: 'number', step: '0.1' },
        { key: 'height', label: 'Height', unit: 'cm', type: 'number' },
      ];

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
      clinicMode,
      clinic_mode: clinicMode,
      vitalsConfig,
      vitals_config: vitalsConfig,
      processLoginData,
      logout
    }}>
      {children}
    </BranchContext.Provider>
  );
};