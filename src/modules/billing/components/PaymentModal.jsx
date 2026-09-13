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
  Split,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import financialApi from '../../../services/financialApi';

export default function PaymentModal({
  invoice: initialInvoice,
  branchId,
  onClose,
  onPaymentSuccess,
}) {
  const [currentInvoice, setCurrentInvoice] = useState(initialInvoice);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isRemovingItemId, setIsRemovingItemId] = useState(null);

  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'visa' | 'split'
  const [cashAmount, setCashAmount] = useState('');
  const [visaAmount, setVisaAmount] = useState('');
  const [visaRef, setVisaRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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

  // Add extra service directly inside the modal
  const handleAddService = async () => {
    if (!selectedServiceId || !currentInvoice?.id) return;
    try {
      setIsAddingItem(true);
      setErrorMessage('');
      const updated = await financialApi.addInvoiceItem(currentInvoice.id, selectedServiceId, 1);
      setCurrentInvoice(updated);
      setSelectedServiceId('');
    } catch (err) {
      console.error('Failed to add service:', err);
      setErrorMessage(err?.response?.data?.message || 'فشلت إضافة الخدمة.');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Remove item from invoice directly inside the modal
  const handleRemoveItem = async (itemId) => {
    if (!itemId || !currentInvoice?.id) return;
    try {
      setIsRemovingItemId(itemId);
      setErrorMessage('');
      const updated = await financialApi.removeInvoiceItem(currentInvoice.id, itemId);
      setCurrentInvoice(updated);
    } catch (err) {
      console.error('Failed to remove item:', err);
      setErrorMessage(err?.response?.data?.message || 'فشل حذف البند.');
    } finally {
      setIsRemovingItemId(null);
    }
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
      setErrorMessage('لا يمكن تحصيل الفاتورة قبل انتهاء الطبيب من الكشف وتحويل الحالة إلى انتظار الدفع.');
      return;
    }

    if (!isExactMatch) {
      setErrorMessage(
        balanceDiff > 0
          ? `المبلغ المدفوع أقل من إجمالي الفاتورة بمقدار ${balanceDiff.toFixed(2)} ج.م`
          : `المبلغ المدفوع أكبر من إجمالي الفاتورة بمقدار ${Math.abs(balanceDiff).toFixed(2)} ج.م`
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
        err?.response?.data?.message || err.message || 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.'
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
        dir="rtl"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-l from-slate-900 via-slate-850 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base m-0 flex items-center gap-2">
                تحصيل فاتورة مريض
                <span className="text-xs bg-slate-700/80 px-2 py-0.5 rounded text-slate-300 font-mono">
                  {currentInvoice?.invoice_number}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 m-0">
                المريض: <strong className="text-white">{currentInvoice?.patient?.name || 'مريض العيادة'}</strong>
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

        {/* COMPLETED SUCCESS & THERMAL RECEIPT VIEW */}
        {completedInvoice ? (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 m-0">تم تحصيل الفاتورة بنجاح!</h4>
              <p className="text-xs text-slate-550">
                تم تحديث حالة الموعد إلى مكتمل وتسجيل الإيراد في الخزينة.
              </p>
            </div>

            {/* Thermal Receipt Preview */}
            <div
              id="thermal-receipt"
              className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 space-y-4 font-mono text-xs text-slate-800 select-text"
            >
              <div className="text-center pb-3 border-b border-slate-200">
                <h5 className="font-bold text-sm text-slate-900 tracking-wider">عيادة النور التخصصية</h5>
                <p className="text-[11px] text-slate-500">إيصال سداد نقدي / إلكتروني</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  رقم الفاتورة: {completedInvoice?.invoice_number}
                </p>
                <p className="text-[10px] text-slate-400">
                  التاريخ: {new Date().toLocaleString('ar-EG')}
                </p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">اسم المريض:</span>
                  <span className="font-bold">{completedInvoice?.patient?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الطبيب المعالج:</span>
                  <span className="font-bold">{completedInvoice?.appointment?.doctor?.name || 'طبيب الفرع'}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between font-bold text-slate-700 pb-1 border-b border-slate-200 text-[11px]">
                  <span>البند / الخدمة</span>
                  <span>السعر</span>
                </div>
                {(completedInvoice?.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-[11px]">
                    <span>{item.item_name || item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                    <span className="font-semibold">{Number(item.total).toFixed(2)} ج.م</span>
                  </div>
                ))}
              </div>

              {/* Totals & Breakdown */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                  <span>الإجمالي المسدد:</span>
                  <span>{invoiceTotal.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>طريقة السداد:</span>
                  <span className="font-semibold">
                    {paymentMode === 'cash' && 'نقداً بالكامل (Cash)'}
                    {paymentMode === 'visa' && 'بطاقة إلكترونية (Visa)'}
                    {paymentMode === 'split' && `مقسم: نقدي ${cashNum} ج.م | فيزا ${visaNum} ج.م`}
                  </span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-slate-200 text-[10px] text-slate-400">
                نتمنى لكم دوام الصحة والعافية
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <Printer className="h-4 w-4" />
                طباعة إيصال السداد
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                إغلاق
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
                  <p className="font-bold m-0">تنبيه: الكشف الطبي لم ينته بعد</p>
                  <p className="text-[11px] text-amber-800 m-0">
                    لا يمكن تحصيل الفاتورة قبل انتهاء الطبيب من الكشف وتحويل الحالة إلى انتظار الدفع.
                  </p>
                </div>
              </div>
            )}

            {/* 1. CURRENT SERVICES LIST WITH DELETE OPTION */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 pb-1.5 border-b border-slate-200 font-bold">
                <span>الخدمات والإجراءات في هذه الفاتورة:</span>
                <span className="text-slate-400 font-normal">{(currentInvoice?.items || []).length} بنود</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(currentInvoice?.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-clinic-500 inline-block"></span>
                      {item.item_name || item.name}
                      {item.quantity > 1 && <span className="text-slate-400">×{item.quantity}</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-800">
                        {Number(item.total).toFixed(2)} ج.م
                      </span>
                      {item.service_id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemovingItemId === item.id}
                          className="text-slate-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                          title="حذف هذا البند"
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

              {/* 2. OPTION TO ADD EXTRA SERVICES RIGHT INSIDE PAYMENT MODAL */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-clinic-500"
                >
                  <option value="">+ إضافة خدمة أخرى للفاتورة...</option>
                  {availableServices.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} — ({Number(svc.price).toFixed(0)} ج.م)
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
                  <span>إضافة</span>
                </button>
              </div>

              {/* Running Total */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-sm text-slate-900">
                <span>المبلغ الإجمالي المطلوب:</span>
                <span className="text-emerald-600 font-mono text-base">{invoiceTotal.toFixed(2)} ج.م</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">طريقة التحصيل:</label>
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
                  <span>نقدي (Cash)</span>
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
                  <span>فيزا (Visa)</span>
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
                  <span>مقسم (Split)</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC PAYMENT INPUTS */}
            <div className="space-y-3 pt-1">
              {(paymentMode === 'cash' || paymentMode === 'split') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    المبلغ نقداً (Cash Amount):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      required
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ج.م</span>
                  </div>
                </div>
              )}

              {(paymentMode === 'visa' || paymentMode === 'split') && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      المبلغ بالفيزا (Visa Amount):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={visaAmount}
                        onChange={(e) => setVisaAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:bg-white"
                        required
                      />
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ج.م</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      رقم العملية / المرجع (اختياري):
                    </label>
                    <input
                      type="text"
                      value={visaRef}
                      onChange={(e) => setVisaRef(e.target.value)}
                      placeholder="مثال: TXN-889922 أو آخر 4 أرقام"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* LIVE RECONCILIATION SUMMARY BOX */}
            <div className="p-3.5 rounded-xl border bg-slate-50/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المبلغ المطلوب:</span>
                <strong className="font-mono">{invoiceTotal.toFixed(2)} ج.م</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>إجمالي المدخل:</span>
                <strong className="font-mono">{totalEntered.toFixed(2)} ج.م</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                <span>حالة المطابقة:</span>
                {isExactMatch ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    مطابق تماماً (100%)
                  </span>
                ) : balanceDiff > 0 ? (
                  <span className="text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full text-[11px]">
                    متبقي: {balanceDiff.toFixed(2)} ج.م
                  </span>
                ) : (
                  <span className="text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-[11px]">
                    فائض: {Math.abs(balanceDiff).toFixed(2)} ج.م
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
                    <span>جاري تسجيل الدفع...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>تأكيد التحصيل ({totalEntered.toFixed(2)} ج.م)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                إغلاق
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
