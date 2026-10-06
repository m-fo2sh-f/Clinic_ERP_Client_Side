import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Loader2,
  CheckCircle2,
  Trash2,
  Receipt,
} from 'lucide-react';
import financialApi from '../../../services/financialApi';

export default function DoctorBillableServices({
  appointmentId,
  queueId,
  encounterId,
  branchId,
  isEncounterLoading = false,
}) {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState(null);

  // If encounter query is currently in flight and we don't have encounterId yet, wait for it to stabilize
  const isResolvingIdentifier = isEncounterLoading && !encounterId;

  // Determine prioritized identifier
  const identifierType = encounterId
    ? 'encounter'
    : queueId
    ? 'queue'
    : appointmentId
    ? 'appointment'
    : null;

  const identifierId = encounterId || queueId || appointmentId;
  const hasIdentifier = Boolean(identifierId) && !isResolvingIdentifier;

  // 1. Branch catalog services query (cached for 30 minutes across renders)
  const { data: services = [] } = useQuery({
    queryKey: ['branchServices', branchId],
    queryFn: async () => {
      const data = await financialApi.getBranchServices(branchId);
      return (data || []).filter((s) => s.code !== 'CONSULTATION');
    },
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    gcTime: 1000 * 60 * 60, // 1 hour memory retention
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 2. Invoice query for this encounter / queue item
  const invoiceQueryKey = ['invoice', identifierType, identifierId];
  const {
    data: invoice = null,
    isLoading: invoiceLoading,
  } = useQuery({
    queryKey: invoiceQueryKey,
    queryFn: async () => {
      if (encounterId) {
        return await financialApi.getInvoiceForEncounter(encounterId);
      }
      if (queueId) {
        return await financialApi.getInvoiceForQueue(queueId);
      }
      if (appointmentId) {
        return await financialApi.getInvoiceForAppointment(appointmentId);
      }
      return null;
    },
    enabled: Boolean(branchId && hasIdentifier),
    staleTime: 1000 * 30, // 30 seconds freshness
    retry: 1,
  });

  // 3. Add Service Item Mutation
  const addServiceMutation = useMutation({
    mutationFn: (serviceId) => financialApi.addInvoiceItem(invoice.id, serviceId, 1),
    onSuccess: (updatedInvoice) => {
      setActionError(null);
      queryClient.setQueryData(invoiceQueryKey, updatedInvoice);
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
    },
    onError: (err) => {
      console.error('Failed to add service item:', err);
      setActionError(err?.response?.data?.message || 'Failed to add service to invoice.');
    },
  });

  // 4. Remove Service Item Mutation
  const removeServiceMutation = useMutation({
    mutationFn: (itemId) => financialApi.removeInvoiceItem(invoice.id, itemId),
    onSuccess: (updatedInvoice) => {
      setActionError(null);
      queryClient.setQueryData(invoiceQueryKey, updatedInvoice);
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
    },
    onError: (err) => {
      console.error('Failed to remove item:', err);
      setActionError(err?.response?.data?.message || 'Failed to remove item.');
    },
  });

  if (!identifierId && !isResolvingIdentifier) return null;

  const loading = invoiceLoading || isResolvingIdentifier;

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

      {actionError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
          {actionError}
        </div>
      )}

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
                          onClick={() => removeServiceMutation.mutate(item.id)}
                          disabled={removeServiceMutation.isPending && removeServiceMutation.variables === item.id}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          title="Remove item"
                        >
                          {removeServiceMutation.isPending && removeServiceMutation.variables === item.id ? (
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
                  onClick={() => addServiceMutation.mutate(svc.id)}
                  disabled={addServiceMutation.isPending && addServiceMutation.variables === svc.id}
                  className="inline-flex items-center gap-2 bg-slate-50 hover:bg-clinic-50 border border-slate-200 hover:border-clinic-400 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-clinic-700 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
                >
                  {addServiceMutation.isPending && addServiceMutation.variables === svc.id ? (
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
