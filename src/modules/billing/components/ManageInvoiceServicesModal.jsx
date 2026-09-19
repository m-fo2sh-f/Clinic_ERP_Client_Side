import React, { useState, useEffect } from 'react';
import {
  Receipt,
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle2,
} from 'lucide-react';
import financialApi from '../../../services/financialApi';
import useInvoiceItems from '../hooks/useInvoiceItems';

export default function ManageInvoiceServicesModal({
  isOpen,
  onClose,
  appointmentId,
  branchId,
  onUpdated,
}) {
  const [invoice, setInvoice] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    selectedServiceId,
    setSelectedServiceId,
    isAddingItem,
    deletingItemId,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    handleAddService,
    handleRemoveItem,
    clearMessages,
  } = useInvoiceItems({
    invoice,
    setInvoice,
    onUpdated,
  });

  // Fetch invoice & branch services catalog on open
  useEffect(() => {
    if (!isOpen || !appointmentId) {
      setInvoice(null);
      clearMessages();
      setSelectedServiceId('');
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      clearMessages();

      try {
        const inv = await financialApi.getInvoiceForAppointment(appointmentId);
        if (isMounted) {
          setInvoice(inv);
        }

        const effectiveBranchId = branchId || inv?.branch_id;
        if (effectiveBranchId) {
          const services = await financialApi.getBranchServices(effectiveBranchId);
          if (isMounted) {
            setAvailableServices(services || []);
          }
        }
      } catch (err) {
        console.error('Error loading invoice services:', err);
        if (isMounted) {
          setErrorMessage(
            err?.response?.data?.message || 'Failed to load invoice or services catalog.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, appointmentId, branchId]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onUpdated) {
      onUpdated(invoice);
    }
    onClose();
  };

  const invoiceTotal = Number(invoice?.total || 0);
  const items = invoice?.items || [];
  const patientName = invoice?.patient?.name || 'Patient';
  const doctorName = invoice?.appointment?.doctor?.name;
  const invoiceNumber = invoice?.invoice_number || '---';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="ltr"
      >
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base m-0 flex items-center gap-2">
                Manage Invoice Services
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
                  #{invoiceNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 m-0 flex items-center gap-2">
                <span>Patient: <strong className="text-white">{patientName}</strong></span>
                {doctorName && (
                  <span className="text-slate-400 text-[11px]">• Dr. {doctorName}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-800"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-xs text-slate-500 font-medium">Loading invoice & services catalog...</p>
            </div>
          ) : (
            <>
              {/* 1. ADD EXTRA SERVICE FORM */}
              <form onSubmit={handleAddService} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">
                  Add Service or Procedure
                </label>

                <div className="flex items-center gap-2.5">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select a service from catalog --</option>
                    {availableServices.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} — ({Number(svc.price).toFixed(2)} EGP)
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={!selectedServiceId || isAddingItem}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs whitespace-nowrap"
                  >
                    {isAddingItem ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>Add Service</span>
                  </button>
                </div>
              </form>

              {/* 2. CURRENT BILLED ITEMS LIST */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-clinic-600" />
                    <span>Billed Items ({items.length})</span>
                  </span>
                  <span className="text-slate-400 font-normal font-mono text-[11px]">
                    Invoice #{invoiceNumber}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No services or items added to this invoice yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      const isBaseConsultation =
                        !item.service_id ||
                        item.item_name?.toLowerCase().includes('consultation') ||
                        item.item_name?.toLowerCase().includes('check_up') ||
                        item.name?.toLowerCase().includes('consultation') ||
                        item.name?.toLowerCase().includes('checkup') ||
                        item.code === 'CONSULTATION';
                      const isDeleting = deletingItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isBaseConsultation ? 'bg-clinic-500' : 'bg-emerald-500'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate m-0">
                                {item.item_name || item.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span>Price: {Number(item.unit_price || item.price || 0).toFixed(2)} EGP</span>
                                {isBaseConsultation && (
                                  <span className="bg-clinic-50 text-clinic-700 border border-clinic-200/60 px-1.5 py-0.2 rounded font-semibold text-[9px]">
                                    Consultation
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold font-mono text-xs text-slate-900">
                              {Number(item.total).toFixed(2)} EGP
                            </span>

                            {/* Allow deleting extra procedure items */}
                            {!isBaseConsultation ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isDeleting}
                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                                title="Remove this item from invoice"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            ) : (
                              <span className="w-7" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Total:</span>
            <span className="text-emerald-700 font-mono text-sm font-bold bg-emerald-100/70 px-3 py-1 rounded-lg">
              {invoiceTotal.toFixed(2)} EGP
            </span>
            <span className="text-amber-700 font-semibold bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded text-[10px]">
              Unpaid (Draft)
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
