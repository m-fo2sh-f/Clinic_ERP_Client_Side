import React, { useState, useMemo } from 'react';
import { X, CreditCard, Banknote, Split, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  onConfirmPayment,
  isProcessing = false,
  services = [],
  availableServices = [],
  consultationFee = 150,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'visa' | 'split'
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [visaReference, setVisaReference] = useState('');
  const [splitCash, setSplitCash] = useState('');
  const [splitVisa, setSplitVisa] = useState('');
  const [splitRef, setSplitRef] = useState('');

  if (!isOpen) return null;

  // Calculate items total
  const { itemsList, subtotal } = useMemo(() => {
    let sum = Number(consultationFee) || 0;
    const items = [
      {
        id: 'consultation',
        name: 'كشف استشاري (Consultation)',
        price: Number(consultationFee) || 0,
        quantity: 1,
      },
    ];

    services.forEach((s) => {
      const match = availableServices.find((as) => as.id === s.service_id);
      const price = Number(match?.price ?? match?.default_price ?? 0);
      const qty = Number(s.quantity) || 1;
      const total = price * qty;
      sum += total;
      items.push({
        id: s.service_id,
        name: match?.name || 'خدمة إضافية',
        price,
        quantity: qty,
        total,
      });
    });

    return { itemsList: items, subtotal: sum };
  }, [consultationFee, services, availableServices]);

  const discountAmount = Math.max(0, Math.min(Number(discount) || 0, subtotal));
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Change calculation for cash payment
  const changeDue = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    const received = Number(cashReceived) || 0;
    return Math.max(0, received - finalTotal);
  }, [cashReceived, finalTotal, paymentMethod]);

  // Validation
  const validationError = useMemo(() => {
    if (paymentMethod === 'cash') {
      const received = Number(cashReceived) || 0;
      if (cashReceived !== '' && received < finalTotal) {
        return 'المبلغ المستلم أقل من إجمالي الفاتورة المطلوب';
      }
    } else if (paymentMethod === 'split') {
      const c = Number(splitCash) || 0;
      const v = Number(splitVisa) || 0;
      const sum = Math.round((c + v) * 100) / 100;
      if (sum !== Math.round(finalTotal * 100) / 100) {
        return `مجموع التقسيم (${sum} ج.م) يجب أن يساوي إجمالي الفاتورة (${finalTotal} ج.م)`;
      }
    }
    return null;
  }, [paymentMethod, cashReceived, finalTotal, splitCash, splitVisa]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validationError) return;

    let paymentsPayload = [];
    if (paymentMethod === 'cash') {
      paymentsPayload = [{ method: 'cash', amount: finalTotal }];
    } else if (paymentMethod === 'visa') {
      paymentsPayload = [
        {
          method: 'visa',
          amount: finalTotal,
          transaction_reference: visaReference.trim() || null,
        },
      ];
    } else if (paymentMethod === 'split') {
      paymentsPayload = [
        { method: 'cash', amount: Number(splitCash) },
        {
          method: 'visa',
          amount: Number(splitVisa),
          transaction_reference: splitRef.trim() || null,
        },
      ];
    }

    onConfirmPayment({
      discount: discountAmount,
      payments: paymentsPayload,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">تحصيل الفاتورة والدفع الفوري</h2>
            <p className="text-xs text-slate-500">اختر طريقة السداد لإنهاء الكشف وطباعة الإيصال</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Invoice Breakdown */}
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                بنود الفاتورة والخدمات
              </h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {itemsList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">
                      {item.name} {item.quantity > 1 && `(×${item.quantity})`}
                    </span>
                    <span className="text-slate-900 font-bold font-mono">
                      {(item.price * item.quantity).toFixed(2)} ج.م
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">المجموع الفرعي:</span>
                <span className="text-slate-700 font-bold font-mono">{subtotal.toFixed(2)} ج.م</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="text-slate-500 font-semibold">الخصم (إن وجد):</label>
                <div className="w-28 flex items-center">
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-left font-mono font-bold focus:ring-1 focus:ring-clinic-500 outline-none"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-400 mr-1.5">ج.م</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="text-slate-800 font-extrabold">المبلغ الإجمالي النهائي:</span>
                <span className="text-clinic-600 font-extrabold text-base font-mono">
                  {finalTotal.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">طريقة الدفع</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-clinic-50/70 border-clinic-600 text-clinic-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="h-5 w-5" />
                  <span>نقدي (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('visa')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'visa'
                      ? 'bg-clinic-50/70 border-clinic-600 text-clinic-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>بطاقة (Visa)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('split');
                    setSplitCash(String(Math.floor(finalTotal / 2)));
                    setSplitVisa(String(finalTotal - Math.floor(finalTotal / 2)));
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'split'
                      ? 'bg-clinic-50/70 border-clinic-600 text-clinic-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Split className="h-5 w-5" />
                  <span>تقسيم (Split)</span>
                </button>
              </div>
            </div>

            {/* Dynamic Inputs according to Payment Method */}
            {paymentMethod === 'cash' && (
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-600 font-semibold">المبلغ المستلم من المريض:</label>
                  <div className="w-32 flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder={finalTotal.toFixed(2)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mr-1.5">ج.م</span>
                  </div>
                </div>

                {changeDue > 0 && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-emerald-700 font-bold">
                    <span>المبلغ المتبقي للمريض (الباقي):</span>
                    <span className="font-mono text-sm">{changeDue.toFixed(2)} ج.م</span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'visa' && (
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <label className="block text-xs font-semibold text-slate-600">
                  رقم العملية / مرجع إيصال الفيزا (اختياري):
                </label>
                <input
                  type="text"
                  value={visaReference}
                  onChange={(e) => setVisaReference(e.target.value)}
                  placeholder="TXN-XXXXXX"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                />
              </div>
            )}

            {paymentMethod === 'split' && (
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">المبلغ النقدي:</label>
                    <input
                      type="number"
                      value={splitCash}
                      onChange={(e) => setSplitCash(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">مبلغ الفيزا:</label>
                    <input
                      type="number"
                      value={splitVisa}
                      onChange={(e) => setSplitVisa(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={splitRef}
                    onChange={(e) => setSplitRef(e.target.value)}
                    placeholder="رقم مرجع الفيزا (اختياري)..."
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-xl focus:ring-1 focus:ring-clinic-500 outline-none"
                  />
                </div>
              </div>
            )}

            {validationError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
              رجوع للتعديل
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isProcessing}
              disabled={Boolean(validationError)}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              تأكيد الدفع وإنهاء الكشف ({finalTotal.toFixed(2)} ج.م)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
