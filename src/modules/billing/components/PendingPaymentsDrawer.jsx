import React, { useState } from 'react';
import {
  CreditCard,
  Receipt,
  X,
  Clock,
  User,
  Stethoscope,
  ChevronLeft,
  Banknote,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import PaymentModal from './PaymentModal';

export default function PendingPaymentsDrawer({
  isOpen,
  onClose,
  pendingInvoices = [],
  onPaymentSuccess,
}) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      {/* Slide-over Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out"
        dir="ltr"
      >
        {/* DRAWER HEADER */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-clinic-500/20 text-clinic-400 rounded-xl border border-clinic-500/30">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm m-0 flex items-center gap-2">
                Pending Invoices
                <span className="text-xs bg-clinic-600 text-white font-mono px-2 py-0.5 rounded-full">
                  {pendingInvoices.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 m-0">
                Patients who completed examination and awaiting billing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* INVOICES LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pendingInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm m-0">No Pending Invoices</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                All patients have settled their invoices. You will be notified here once an examination finishes.
              </p>
            </div>
          ) : (
            pendingInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border border-slate-200 hover:border-clinic-300 rounded-xl p-4 shadow-xs hover:shadow-md transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm m-0 group-hover:text-clinic-600 transition-colors">
                      {inv.patient?.name || 'Patient'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Invoice #{inv.invoice_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <strong className="text-base font-bold text-emerald-600 font-mono">
                      {Number(inv.total).toFixed(2)} EGP
                    </strong>
                  </div>
                </div>

                {/* Doctor & Services Breakdown */}
                <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Stethoscope className="h-3.5 w-3.5 text-clinic-600 shrink-0" />
                    <span className="font-medium">
                      Doctor: {inv.appointment?.doctor?.name || 'Clinic Doctor'}
                    </span>
                  </div>

                  {inv.items && inv.items.length > 0 && (
                    <div className="pt-1 border-t border-slate-200/60 flex flex-wrap gap-1">
                      {inv.items.map((item, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700"
                        >
                          {item.item_name || item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Banknote className="h-4 w-4" />
                  <span>Collect Payment Now</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Processing Modal */}
      {selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPaymentSuccess={(paidInvoice) => {
            setSelectedInvoice(null);
            if (onPaymentSuccess) {
              onPaymentSuccess(paidInvoice);
            }
          }}
        />
      )}
    </>
  );
}
