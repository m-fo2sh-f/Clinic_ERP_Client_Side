import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import echo from '../../../services/echo';
import financialApi from '../../../services/financialApi';

export const serviceKeys = {
  all: ['branchServices'],
  branch: (branchId) => [...serviceKeys.all, branchId],
};

export const billingKeys = {
  all: ['pendingInvoices'],
  pending: (branchId) => [...billingKeys.all, branchId],
};

/**
 * TanStack Query hook to fetch pending invoices for a branch.
 */
export function usePendingInvoicesQuery(branchId) {
  return useQuery({
    queryKey: billingKeys.pending(branchId),
    queryFn: async () => {
      if (!branchId) return [];
      const data = await financialApi.getPendingInvoices(branchId);
      return data || [];
    },
    enabled: !!branchId,
    staleTime: 1000 * 5, // 5s stale time
  });
}

/**
 * TanStack Query hook to fetch available branch services.
 * Master catalog rarely changes — cached for 30 minutes with no refetch on focus or mount.
 */
export function useBranchServicesQuery(branchId) {
  return useQuery({
    queryKey: serviceKeys.branch(branchId),
    queryFn: async () => {
      if (!branchId) return [];
      const data = await financialApi.getBranchServices(branchId);
      return data || [];
    },
    enabled: !!branchId,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection retention
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * TanStack Query mutation to process payment and automatically invalidate
 * billing, live queue, and appointment queries.
 */
export function useProcessPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, payments }) => {
      return await financialApi.processPayment(invoiceId, payments);
    },
    onSuccess: () => {
      // 1. Invalidate pending invoices drawer
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      // 2. Invalidate live queue so patient is immediately updated or removed
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
      // 3. Invalidate appointments list
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Combined useBilling hook for ReceptionistDashboard and billing drawers.
 * Upgraded to TanStack Query v5 with automatic WebSocket cache synchronization.
 */
export function useBilling(branchId) {
  const queryClient = useQueryClient();
  const [newInvoiceAlert, setNewInvoiceAlert] = useState(null);

  const pendingQuery = usePendingInvoicesQuery(branchId);
  const servicesQuery = useBranchServicesQuery(branchId);

  // WebSocket real-time listener on private-branch.{branchId}
  useEffect(() => {
    if (!branchId) return;

    const channelName = `branch.${branchId}`;
    const channel = echo.private(channelName);

    // 1. Listener for new invoice ready for payment
    channel.listen('.invoice.ready_for_payment', (e) => {
      console.log('🔔 [WebSocket] New Invoice Ready for Payment received:', e);
      setNewInvoiceAlert(e);
      try {
        const audio = new Audio('/sounds/chime.mp3');
        audio.play().catch(() => {});
      } catch (_) {}

      // Immediately invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    });

    // 2. Listener for paid invoice
    channel.listen('.invoice.paid', (e) => {
      console.log('✅ [WebSocket] Invoice Paid event received:', e);
      // Immediately invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    });

    return () => {
      channel.stopListening('.invoice.ready_for_payment');
      channel.stopListening('.invoice.paid');
    };
  }, [branchId, queryClient]);

  const pendingInvoices = pendingQuery.data || [];

  return {
    pendingInvoices,
    pendingCount: pendingInvoices.length,
    isLoading: pendingQuery.isLoading,
    services: servicesQuery.data || [],
    servicesLoading: servicesQuery.isLoading,
    refetchPending: pendingQuery.refetch,
    refetchServices: servicesQuery.refetch,
    newInvoiceAlert,
    clearAlert: () => setNewInvoiceAlert(null),
  };
}

export default useBilling;
