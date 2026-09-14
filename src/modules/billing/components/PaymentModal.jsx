import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle2,
  Printer,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Split,
  Plus,
  Trash2,
} from 'lucide-react';
import financialApi from '../../../services/financialApi';
import useInvoiceItems from '../hooks/useInvoiceItems';

export default function PaymentModal({
  invoice: initialInvoice,
  branchId,
  onClose,
  onPaymentSuccess,
}) {
  const [currentInvoice, setCurrentInvoice] = useState(initialInvoice);
  const [availableServices, setAvailableServices] = useState([]);

  const {
    selectedServiceId,
    setSelectedServiceId,
    isAddingItem,
    isRemovingItemId,
    errorMessage,
    setErrorMessage,
    handleAddService,
    handleRemoveItem,
  } = useInvoiceItems({
    invoice: currentInvoice,
    setInvoice: setCurrentInvoice,
  });

  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'visa' | 'split'
  const [cashAmount, setCashAmount] = useState('');
  const [visaAmount, setVisaAmount] = useState('');
  const [visaRef, setVisaRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);

  const activeBranchId = branchId || currentInvoice?.branch_id;
  const appointmentStatus = currentInvoice?.appointment?.status;
  // Can only process payment if appointment reached pending_payment or completed
  const isAllowedToPay = !appointmentStatus || appointmentStatus === 'pending_payment' || appointmentStatus === 'completed';

  // Fetch branch services catalog for adding extra items
  useEffect(() => {
    if (!activeBranchId) return;
    financialApi.getBranchServices(activeBranchId)
      .then((data) => setAvailableServices(data || []))
      .catch((err) => console.error('Error fetching services:', err));
  }, [activeBranchId]);

  const invoiceTotal = Number(currentInvoice?.total || 0);

  // Sync default amounts when invoice or mode changes
  useEffect(() => {
    if (paymentMode === 'cash') {
      setCashAmount(String(invoiceTotal));
      setVisaAmount('');
    } else if (paymentMode === 'visa') {
      setVisaAmount(String(invoiceTotal));
      setCashAmount('');
    } else if (paymentMode === 'split') {
      const half = (invoiceTotal / 2).toFixed(2);
      setCashAmount(String(half));
      setVisaAmount(String((invoiceTotal - Number(half)).toFixed(2)));
    }
  }, [invoiceTotal, paymentMode]);

  const handleModeChange = (mode) => {
    setPaymentMode(mode);
    setErrorMessage('');
  };

  // Calculations for live balance
  const cashNum = Number(cashAmount) || 0;
  const visaNum = Number(visaAmount) || 0;
  const totalEntered = useMemo(() => {
    if (paymentMode === 'cash') return cashNum;
    if (paymentMode === 'visa') return visaNum;
    return Number((cashNum + visaNum).toFixed(2));
  }, [paymentMode, cashNum, visaNum]);

  const balanceDiff = Number((invoiceTotal - totalEntered).toFixed(2));
  const isExactMatch = Math.abs(balanceDiff) < 0.01 && totalEntered > 0;

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAllowedToPay) {
      setErrorMessage('Invoice cannot be collected before doctor completes the examination and status changes to pending payment.');
      return;
    }

    if (!isExactMatch) {
      setErrorMessage(
        balanceDiff > 0
          ? `Amount paid is less than invoice total by ${balanceDiff.toFixed(2)} EGP`
          : `Amount paid exceeds invoice total by ${Math.abs(balanceDiff).toFixed(2)} EGP`
      );
      return;
    }

    const payments = [];
    if (paymentMode === 'cash' || (paymentMode === 'split' && cashNum > 0)) {
      payments.push({
        method: 'cash',
        amount: cashNum,
      });
    }
    if (paymentMode === 'visa' || (paymentMode === 'split' && visaNum > 0)) {
      payments.push({
        method: 'visa',
        amount: visaNum,
        transaction_reference: visaRef.trim() || null,
      });
    }

    try {
      setIsSubmitting(true);
      const updated = await financialApi.processPayment(currentInvoice.id, payments);
      setCompletedInvoice(updated || currentInvoice);
      if (onPaymentSuccess) {
        onPaymentSuccess(updated || currentInvoice);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setErrorMessage(
        err?.response?.data?.message || err.message || 'Payment processing failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        dir="ltr"
      >
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base m-0 flex items-center gap-2">
                Collect Patient Payment
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono border border-slate-700">
                  #{currentInvoice?.invoice_number}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 m-0">
                Patient: <strong className="text-white">{currentInvoice?.patient?.name || 'Clinic Patient'}</strong>
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

        {/* COMPLETED SUCCESS & RECEIPT VIEW */}
        {completedInvoice ? (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 m-0">Payment Collected Successfully!</h4>
              <p className="text-xs text-slate-500">
                Appointment marked as completed and transaction recorded.
              </p>
            </div>

            {/* Receipt Preview */}
            <div
              id="thermal-receipt"
              className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 space-y-4 font-mono text-xs text-slate-800 select-text"
            >
              <div className="text-center pb-3 border-b border-slate-200">
                <h5 className="font-bold text-sm text-slate-900 tracking-wider">CLINIC PAYMENT RECEIPT</h5>
                <p className="text-[11px] text-slate-500">Official Payment Voucher</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Invoice #: {completedInvoice?.invoice_number}
                </p>
                <p className="text-[10px] text-slate-400">
                  Date: {new Date().toLocaleString('en-US')}
                </p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold">{completedInvoice?.patient?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold">{completedInvoice?.appointment?.doctor?.name || 'Clinic Doctor'}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between font-bold text-slate-700 pb-1 border-b border-slate-200 text-[11px]">
                  <span>Item / Service</span>
                  <span>Price</span>
                </div>
                {(completedInvoice?.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-[11px]">
                    <span>{item.item_name || item.name}</span>
                    <span className="font-semibold">{Number(item.total).toFixed(2)} EGP</span>
                  </div>
                ))}
              </div>

              {/* Totals & Breakdown */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                  <span>Total Paid:</span>
                  <span>{invoiceTotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold">
                    {paymentMode === 'cash' && 'Cash'}
                    {paymentMode === 'visa' && 'Card (Visa/Mastercard)'}
                    {paymentMode === 'split' && `Split: Cash ${cashNum} EGP | Card ${visaNum} EGP`}
                  </span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-slate-200 text-[10px] text-slate-400">
                Thank you for your visit. Wishing you good health!
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT & SERVICES FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!isAllowedToPay && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold m-0">Notice: Examination not finished yet</p>
                  <p className="text-[11px] text-amber-800 m-0">
                    Payment cannot be collected until the doctor finishes the examination and moves status to pending payment.
                  </p>
                </div>
              </div>
            )}

            {/* 1. CURRENT SERVICES LIST */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 pb-1.5 border-b border-slate-200 font-bold">
                <span>Services & Procedures on this Invoice:</span>
                <span className="text-slate-400 font-normal">{(currentInvoice?.items || []).length} items</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(currentInvoice?.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-clinic-500 inline-block"></span>
                      {item.item_name || item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-800">
                        {Number(item.total).toFixed(2)} EGP
                      </span>
                      {item.service_id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemovingItemId === item.id}
                          className="text-slate-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                          title="Remove this item"
                        >
                          {isRemovingItemId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. OPTION TO ADD EXTRA SERVICES */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-clinic-500"
                >
                  <option value="">+ Add service to invoice...</option>
                  {availableServices.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} — ({Number(svc.price).toFixed(0)} EGP)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddService}
                  disabled={!selectedServiceId || isAddingItem}
                  className="bg-clinic-600 hover:bg-clinic-700 disabled:bg-slate-200 text-white disabled:text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isAddingItem ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>Add</span>
                </button>
              </div>

              {/* Running Total */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-sm text-slate-900">
                <span>Total Amount Due:</span>
                <span className="text-emerald-600 font-mono text-base">{invoiceTotal.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Payment Method:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('cash')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMode === 'cash'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('visa')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMode === 'visa'
                      ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-sky-600" />
                  <span>Card (Visa)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('split')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMode === 'split'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Split className="h-4 w-4 text-indigo-600" />
                  <span>Split</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC PAYMENT INPUTS */}
            <div className="space-y-3 pt-1">
              {(paymentMode === 'cash' || paymentMode === 'split') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cash Amount:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pr-12 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">EGP</span>
                  </div>
                </div>
              )}

              {(paymentMode === 'visa' || paymentMode === 'split') && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Card Amount:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={visaAmount}
                        onChange={(e) => setVisaAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pr-12 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:bg-white"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">EGP</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transaction Ref / Auth Code (Optional):
                    </label>
                    <input
                      type="text"
                      value={visaRef}
                      onChange={(e) => setVisaRef(e.target.value)}
                      placeholder="e.g. TXN-889922 or last 4 digits"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* RECONCILIATION SUMMARY BOX */}
            <div className="p-3.5 rounded-xl border bg-slate-50/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Amount Due:</span>
                <strong className="font-mono">{invoiceTotal.toFixed(2)} EGP</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Entered:</span>
                <strong className="font-mono">{totalEntered.toFixed(2)} EGP</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                <span>Match Status:</span>
                {isExactMatch ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Exact Match (100%)
                  </span>
                ) : balanceDiff > 0 ? (
                  <span className="text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full text-[11px]">
                    Remaining: {balanceDiff.toFixed(2)} EGP
                  </span>
                ) : (
                  <span className="text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-[11px]">
                    Overpaid: {Math.abs(balanceDiff).toFixed(2)} EGP
                  </span>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!isExactMatch || isSubmitting || !isAllowedToPay}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isExactMatch && !isSubmitting && isAllowedToPay
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Confirm Payment ({totalEntered.toFixed(2)} EGP)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
