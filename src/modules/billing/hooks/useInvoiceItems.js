import { useState, useCallback } from 'react';
import financialApi from '../../../services/financialApi';

/**
 * useInvoiceItems — reusable hook to manage adding and removing items/services
 * from an invoice in billing modals (ManageInvoiceServicesModal, PaymentModal, etc.)
 *
 * @param {Object} options
 * @param {Object} options.invoice       – The current active invoice object
 * @param {Function} options.setInvoice  – State setter to update the invoice in parent
 * @param {Function} options.onUpdated   – Optional callback triggered when invoice changes
 */
export function useInvoiceItems({ invoice, setInvoice, onUpdated } = {}) {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add extra service procedure (quantity fixed to 1)
  const handleAddService = useCallback(
    async (eOrServiceId) => {
      if (eOrServiceId && typeof eOrServiceId.preventDefault === 'function') {
        eOrServiceId.preventDefault();
      }

      const serviceIdToUse =
        typeof eOrServiceId === 'string' || typeof eOrServiceId === 'number'
          ? eOrServiceId
          : selectedServiceId;

      if (!serviceIdToUse || !invoice?.id) return;

      try {
        setIsAddingItem(true);
        setErrorMessage('');
        setSuccessMessage('');

        const updated = await financialApi.addInvoiceItem(invoice.id, serviceIdToUse, 1);

        if (setInvoice) {
          setInvoice(updated || invoice);
        }
        setSelectedServiceId('');
        setSuccessMessage('Service added to invoice successfully.');

        if (onUpdated) {
          onUpdated(updated || invoice);
        }
        return updated;
      } catch (err) {
        console.error('Failed to add service item:', err);
        const msg = err?.response?.data?.message || 'Failed to add service to invoice.';
        setErrorMessage(msg);
      } finally {
        setIsAddingItem(false);
      }
    },
    [invoice, selectedServiceId, setInvoice, onUpdated]
  );

  // Remove service item
  const handleRemoveItem = useCallback(
    async (itemId) => {
      if (!itemId || !invoice?.id) return;

      try {
        setDeletingItemId(itemId);
        setErrorMessage('');
        setSuccessMessage('');

        const updated = await financialApi.removeInvoiceItem(invoice.id, itemId);

        if (setInvoice) {
          setInvoice(updated || invoice);
        }
        setSuccessMessage('Item removed successfully.');

        if (onUpdated) {
          onUpdated(updated || invoice);
        }
        return updated;
      } catch (err) {
        console.error('Failed to remove invoice item:', err);
        const msg = err?.response?.data?.message || 'Failed to remove this item.';
        setErrorMessage(msg);
      } finally {
        setDeletingItemId(null);
      }
    },
    [invoice, setInvoice, onUpdated]
  );

  return {
    selectedServiceId,
    setSelectedServiceId,
    isAddingItem,
    deletingItemId,
    isRemovingItemId: deletingItemId, // Alias for PaymentModal
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    handleAddService,
    handleRemoveItem,
    clearMessages: () => {
      setErrorMessage('');
      setSuccessMessage('');
    },
  };
}

export default useInvoiceItems;
