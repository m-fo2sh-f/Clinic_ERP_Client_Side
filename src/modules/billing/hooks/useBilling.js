import { useState, useEffect, useCallback } from 'react';
import echo from '../../../services/echo';
import financialApi from '../../../services/financialApi';

export function useBilling(branchId) {
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [newInvoiceAlert, setNewInvoiceAlert] = useState(null);

  // Fetch pending invoices for the branch
  const fetchPending = useCallback(async () => {
    if (!branchId) return;
    try {
      setIsLoading(true);
      const data = await financialApi.getPendingInvoices(branchId);
      setPendingInvoices(data);
    } catch (err) {
      console.error('Failed to fetch pending invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  // Fetch available services catalog
  const fetchServices = useCallback(async () => {
    if (!branchId) return;
    try {
      setServicesLoading(true);
      const data = await financialApi.getBranchServices(branchId);
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch branch services:', err);
    } finally {
      setServicesLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchPending();
    fetchServices();
  }, [fetchPending, fetchServices]);

  // WebSocket real-time listener on private-branch.{branchId}
  useEffect(() => {
    if (!branchId) return;

    const channelName = `branch.${branchId}`;
    const channel = echo.private(channelName);

    // 1. Listener for new invoice ready for payment
    channel.listen('.invoice.ready_for_payment', (e) => {
      console.log('🔔 [WebSocket] New Invoice Ready for Payment received:', e);
      setNewInvoiceAlert(e);
      // Play subtle chime sound if possible
      try {
        const audio = new Audio('/sounds/chime.mp3');
        audio.play().catch(() => {});
      } catch (_) {}

      // Add or update in list
      setPendingInvoices((prev) => {
        const exists = prev.some((inv) => String(inv.id) === String(e.invoice_id));
        if (exists) {
          return prev.map((inv) =>
            String(inv.id) === String(e.invoice_id)
              ? {
                  ...inv,
                  total: e.total,
                  subtotal: e.subtotal,
                  items: e.items,
                }
              : inv
          );
        }
        return [
          {
            id: e.invoice_id,
            invoice_number: e.invoice_number,
            appointment_id: e.appointment_id,
            patient: { name: e.patient_name, id: e.patient_id },
            appointment: { doctor: { name: e.doctor_name } },
            total: e.total,
            subtotal: e.subtotal,
            items: e.items,
            created_at: e.created_at,
          },
          ...prev,
        ];
      });
    });

    // 2. Listener for paid invoice
    channel.listen('.invoice.paid', (e) => {
      console.log('✅ [WebSocket] Invoice Paid event received:', e);
      setPendingInvoices((prev) =>
        prev.filter((inv) => String(inv.id) !== String(e.invoice_id))
      );
    });

    return () => {
      channel.stopListening('.invoice.ready_for_payment');
      channel.stopListening('.invoice.paid');
    };
  }, [branchId]);

  return {
    pendingInvoices,
    pendingCount: pendingInvoices.length,
    isLoading,
    services,
    servicesLoading,
    refetchPending: fetchPending,
    refetchServices: fetchServices,
    newInvoiceAlert,
    clearAlert: () => setNewInvoiceAlert(null),
  };
}

export default useBilling;
