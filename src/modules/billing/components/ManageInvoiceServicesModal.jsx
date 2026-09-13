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
  Info,
} from 'lucide-react';
import financialApi from '../../../services/financialApi';

export default function ManageInvoiceServicesModal({
  isOpen,
  onClose,
  appointmentId,
  branchId,
  onUpdated,
}) {
  const [invoice, setInvoice] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch invoice & branch services catalog on open
  useEffect(() => {
    if (!isOpen || !appointmentId) {
      setInvoice(null);
      setErrorMessage('');
      setSuccessMessage('');
      setSelectedServiceId('');
      setQuantity(1);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

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
            err?.response?.data?.message || 'فشل تحميل بيانات فاتورة المريض أو قائمة الخدمات.'
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

  // Add extra service procedure
  const handleAddService = async (e) => {
    e?.preventDefault();
    if (!selectedServiceId || !invoice?.id) return;

    try {
      setIsAddingItem(true);
      setErrorMessage('');
      setSuccessMessage('');

      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      const updated = await financialApi.addInvoiceItem(invoice.id, selectedServiceId, qty);
      
      setInvoice(updated || invoice);
      setSelectedServiceId('');
      setQuantity(1);
      setSuccessMessage('تمت إضافة الخدمة إلى الفاتورة بنجاح.');
      
      if (onUpdated) {
        onUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to add service item:', err);
      setErrorMessage(err?.response?.data?.message || 'تعذر إضافة الخدمة للفاتورة.');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Remove service item
  const handleRemoveItem = async (itemId) => {
    if (!itemId || !invoice?.id) return;

    try {
      setDeletingItemId(itemId);
      setErrorMessage('');
      setSuccessMessage('');

      const updated = await financialApi.removeInvoiceItem(invoice.id, itemId);
      setInvoice(updated || invoice);
      setSuccessMessage('تم حذف البند بنجاح.');

      if (onUpdated) {
        onUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to remove invoice item:', err);
      setErrorMessage(err?.response?.data?.message || 'تعذر حذف هذا البند.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleClose = () => {
    if (onUpdated) {
      onUpdated(invoice);
    }
    onClose();
  };

  const invoiceTotal = Number(invoice?.total || 0);
  const items = invoice?.items || [];
  const patientName = invoice?.patient?.name || 'المريض';
  const doctorName = invoice?.appointment?.doctor?.name;
  const invoiceNumber = invoice?.invoice_number || '---';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-l from-slate-900 via-slate-850 to-slate-800 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base m-0 flex items-center gap-2">
                إدارة خدمات وفحوصات الفاتورة
                <span className="text-[11px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md font-mono">
                  {invoiceNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-350 mt-1 m-0 flex items-center gap-2">
                <span>المريض: <strong className="text-white">{patientName}</strong></span>
                {doctorName && (
                  <span className="text-slate-400 text-[11px]">| د. {doctorName}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-800"
            title="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informative Workflow Guidance Note */}
        <div className="bg-emerald-50/70 border-b border-emerald-150 px-5 py-2.5 flex items-center gap-2.5 text-xs text-emerald-850">
          <Info className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="leading-snug">
            هذه الشاشة مخصصة لإضافة أو حذف الفحوصات والإجراءات الطبية للمريض أثناء الانتظار أو الكشف، دون تحصيل دفعات.
          </span>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
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
              <p className="text-xs text-slate-500 font-medium">جاري تحميل بيانات الفاتورة والخدمات...</p>
            </div>
          ) : (
            <>
              {/* 1. CURRENT ITEMS LIST */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-slate-700 pb-2 border-b border-slate-200/80 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-clinic-600" />
                    <span>البنود والفحوصات المسجلة بالفاتورة:</span>
                  </span>
                  <span className="text-slate-400 font-normal font-mono">
                    {items.length} {items.length === 1 ? 'بند' : 'بنود'}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    لا توجد بنود مسجلة بالفاتورة حالياً.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                    {items.map((item) => {
                      const isBaseConsultation = !item.service_id || item.item_name?.includes('كشف') || item.name?.includes('كشف');
                      const isDeleting = deletingItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isBaseConsultation ? 'bg-clinic-500' : 'bg-amber-500'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate m-0">
                                {item.item_name || item.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>
                                  سعر الوحدة: {Number(item.unit_price || item.price || 0).toFixed(2)} ج.م
                                </span>
                                {item.quantity > 1 && (
                                  <span className="font-semibold text-slate-600 font-mono">
                                    × {item.quantity}
                                  </span>
                                )}
                                {isBaseConsultation && (
                                  <span className="bg-clinic-50 text-clinic-700 px-1.5 py-0.2 rounded font-semibold text-[9px]">
                                    كشف أساسي
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold font-mono text-xs text-slate-900">
                              {Number(item.total).toFixed(2)} ج.م
                            </span>

                            {/* Allow deleting extra procedure items */}
                            {!isBaseConsultation ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isDeleting}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                                title="حذف هذا البند من الفاتورة"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            ) : (
                              <span className="w-6" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Live Running Total */}
                <div className="pt-2.5 border-t border-slate-200/90 flex justify-between items-center font-bold text-xs">
                  <span className="text-slate-700">إجمالي الفاتورة الحالي:</span>
                  <span className="text-emerald-700 font-mono text-sm bg-emerald-100/70 px-2.5 py-0.5 rounded-lg">
                    {invoiceTotal.toFixed(2)} ج.م
                  </span>
                </div>
              </div>

              {/* 2. ADD EXTRA SERVICE FORM */}
              <form onSubmit={handleAddService} className="bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">
                  إضافة خدمة أو فحص إضافي:
                </label>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-750 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- اختر الخدمة أو الفحص من القائمة --</option>
                    {availableServices.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} — ({Number(svc.price).toFixed(2)} ج.م)
                      </option>
                    ))}
                  </select>

                  <div className="w-18 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      title="الكمية"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-center font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedServiceId || isAddingItem}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    {isAddingItem ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>إضافة</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            الحالة: <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded text-[10px]">غير مسددة (Draft)</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
