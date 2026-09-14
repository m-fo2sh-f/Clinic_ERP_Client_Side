import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Loader2,
  CheckCircle2,
  Trash2,
  Sparkles,
  Receipt,
} from 'lucide-react';
import financialApi from '../../../services/financialApi';

export default function DoctorBillableServices({
  appointmentId,
  branchId,
}) {
  const [invoice, setInvoice] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingServiceId, setAddingServiceId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  const loadData = useCallback(async () => {
    if (!branchId || !appointmentId) return;
    try {
      setLoading(true);
      const [servicesData, invoiceData] = await Promise.all([
        financialApi.getBranchServices(branchId),
        financialApi.getInvoiceForAppointment(appointmentId),
      ]);

      setServices((servicesData || []).filter((s) => s.code !== 'CONSULTATION'));
      setInvoice(invoiceData);
    } catch (err) {
      console.error('Failed to load billable services or invoice for doctor:', err);
    } finally {
      setLoading(false);
    }
  }, [branchId, appointmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddService = async (serviceId) => {
    if (!invoice?.id || !serviceId) return;
    try {
      setAddingServiceId(serviceId);
      const updated = await financialApi.addInvoiceItem(invoice.id, serviceId, 1);
      setInvoice(updated);
    } catch (err) {
      console.error('Failed to add service item:', err);
      alert(err?.response?.data?.message || 'Failed to add service to invoice.');
    } finally {
      setAddingServiceId(null);
    }
  };

  const handleRemoveService = async (itemId) => {
    if (!invoice?.id || !itemId) return;
    try {
      setRemovingItemId(itemId);
      const updated = await financialApi.removeInvoiceItem(invoice.id, itemId);
      setInvoice(updated);
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert(err?.response?.data?.message || 'Failed to remove item.');
    } finally {
      setRemovingItemId(null);
    }
  };

  if (!appointmentId) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-clinic-50 text-clinic-600 rounded-xl border border-clinic-100">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 m-0">
              Extra Billable Services & Procedures
            </h4>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Add attached procedures (e.g. ECG, Ultrasound) to be billed automatically on the patient invoice
            </p>
          </div>
        </div>

        {invoice && (
          <div className="text-right bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] text-emerald-700 font-semibold block">Current Invoice Total</span>
            <span className="font-bold font-mono text-base text-emerald-800">
              {Number(invoice.total || 0).toFixed(2)} EGP
            </span>
          </div>
        )}
      </div>

      {loading && !invoice ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-clinic-600" />
          <span>Loading invoice details...</span>
        </div>
      ) : (
        <>
          {/* Current Attached Items */}
          {invoice?.items && invoice.items.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Currently billed services for this patient:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {invoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">
                        {item.item_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold font-mono text-emerald-700">
                        {Number(item.total).toFixed(2)} EGP
                      </span>
                      {item.service_id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(item.id)}
                          disabled={removingItemId === item.id}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          {removingItemId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Available Procedures */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              + Quick add procedure from clinic catalog:
            </span>
            <div className="flex flex-wrap gap-2">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => handleAddService(svc.id)}
                  disabled={addingServiceId === svc.id}
                  className="inline-flex items-center gap-2 bg-slate-50 hover:bg-clinic-50 border border-slate-200 hover:border-clinic-400 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-clinic-700 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  {addingServiceId === svc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-clinic-600" />
                  ) : (
                    <Plus className="h-4 w-4 text-clinic-600" />
                  )}
                  <span>{svc.name}</span>
                  <span className="font-mono text-clinic-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                    {Number(svc.price).toFixed(0)} EGP
                  </span>
                </button>
              ))}
            </div>
          </div>


        </>
      )}
    </div>
  );
}
