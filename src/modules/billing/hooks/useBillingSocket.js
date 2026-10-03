import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import echo from '../../../services/echo';
import { debouncedInvalidate } from '../../../utils/invalidationTracker';

/**
 * useBillingSocket — WebSocket hook for billing updates via Laravel Reverb.
 * Listens to `branch.{branchId}` for new invoices ready for checkout and payments.
 */
export function useBillingSocket(branchId, onInvoiceReady = null) {
  const queryClient = useQueryClient();
  const callbackRef = useRef(onInvoiceReady);
  const channelRef = useRef(null);

  useEffect(() => {
    callbackRef.current = onInvoiceReady;
  }, [onInvoiceReady]);

  useEffect(() => {
    if (!branchId) return;

    if (channelRef.current) {
      channelRef.current.stopListening('.invoice.ready_for_payment');
      channelRef.current.stopListening('InvoiceReadyForPayment');
      channelRef.current.stopListening('.invoice.paid');
      channelRef.current.stopListening('InvoicePaid');
    }

    const channel = echo.private(`branch.${branchId}`);
    channelRef.current = channel;

    const handleInvoiceReady = (data) => {
      debouncedInvalidate(queryClient, [
        ['invoices', 'pending', branchId],
        ['pendingInvoices', branchId],
        ['invoices'],
        ['liveQueue'],
      ], 200);

      callbackRef.current?.(data);
    };

    const handleInvoicePaid = () => {
      debouncedInvalidate(queryClient, [
        ['invoices', 'pending', branchId],
        ['pendingInvoices', branchId],
        ['invoices'],
        ['liveQueue'],
      ], 200);
    };

    channel.listen('.invoice.ready_for_payment', handleInvoiceReady);
    channel.listen('InvoiceReadyForPayment', handleInvoiceReady);
    channel.listen('.invoice.paid', handleInvoicePaid);
    channel.listen('InvoicePaid', handleInvoicePaid);

    return () => {
      channel.stopListening('.invoice.ready_for_payment');
      channel.stopListening('InvoiceReadyForPayment');
      channel.stopListening('.invoice.paid');
      channel.stopListening('InvoicePaid');
      echo.leave(`branch.${branchId}`);
      channelRef.current = null;
    };
  }, [branchId, queryClient]);
}

export default useBillingSocket;
