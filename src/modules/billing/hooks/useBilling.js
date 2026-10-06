import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import echo from '../../../services/echo';
import financialApi from '../../../services/financialApi';
import {
  markQueryInvalidated,
  shouldSkipWebSocketInvalidate,
  debouncedInvalidate,
} from '../../../utils/invalidationTracker';

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
 * billing, live queue, and appointment queries via debounced tracker.
 */
export function useProcessPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, payments }) => {
      return await financialApi.processPayment(invoiceId, payments);
    },
    onMutate: () => {
      markQueryInvalidated();
    },
    onSuccess: () => {
      markQueryInvalidated();
      // Debounce and invalidate all relevant query keys together in ONE shot
      debouncedInvalidate(
        queryClient,
        [billingKeys.all, ['liveQueue'], ['appointments']],
        150
      );
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
  const channelRef = useRef(null);

  const pendingQuery = usePendingInvoicesQuery(branchId);
  const servicesQuery = useBranchServicesQuery(branchId);

  // WebSocket real-time listener on private-branch.{branchId}
  useEffect(() => {
    if (!branchId) return;

    if (channelRef.current) {
      channelRef.current.stopListening('.invoice.ready_for_payment');
      channelRef.current.stopListening('.invoice.paid');
    }

    const channelName = `branch.${branchId}`;
    const channel = echo.private(channelName);
    channelRef.current = channel;

    // 1. Listener for new invoice ready for payment
    channel.listen('.invoice.ready_for_payment', (e) => {
      setNewInvoiceAlert(e);
      try {
        const audio = new Audio('/sounds/chime.mp3');
        audio.play().catch(() => {});
      } catch (_) {}

      // Suppress WebSocket refetch flood if mutation already ran locally
      if (!shouldSkipWebSocketInvalidate(3500)) {
        debouncedInvalidate(queryClient, [billingKeys.all, ['liveQueue'], ['appointments']], 300);
      }
    });

    // 2. Listener for paid invoice
    channel.listen('.invoice.paid', (e) => {
      // Suppress WebSocket refetch flood if payment was done locally by this user
      if (!shouldSkipWebSocketInvalidate(3500)) {
        debouncedInvalidate(queryClient, [billingKeys.all, ['liveQueue'], ['appointments']], 300);
      }
    });

    return () => {
      channel.stopListening('.invoice.ready_for_payment');
      channel.stopListening('.invoice.paid');
      channelRef.current = null;
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
