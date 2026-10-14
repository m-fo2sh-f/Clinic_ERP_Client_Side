import React from 'react';
import { CreditCard, CheckCircle2, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { isConsultationService } from '../utils/serviceUtils';

/**
 * SoloBillingCard — Single Responsibility Component
 * Manages consultation services, pricing snapshot, private notes, and triggers final checkout.
 */
export default function SoloBillingCard({
  consultationFee = 150,
  availableServices = [],
  selectedServices = [],
  onAddService,
  onRemoveService,
  privateNotes,
  onPrivateNotesChange,
  onOpenCheckout,
  disabled = false,
}) {
  return (
    <div className="space-y-6">
      {/* Financial Snapshot Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-clinic-600" />
          الخدمات والتحصيل الفوري
        </h3>

        {/* Base Consultation Fee */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 block">رسوم الكشف الأساسية</span>
            <span className="text-[10px] text-slate-400">كشف العيادة المعتمد</span>
          </div>
          <span className="font-bold text-emerald-600 text-sm">{consultationFee} ج.م</span>
        </div>

        {/* Additional Services Dropdown Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600">
            إضافة خدمات إضافية أجريت أثناء الكشف:
          </label>
          <select
            disabled={disabled}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              const service = availableServices.find((item) => item.id === id);
              if (service) {
                onAddService(service);
              }
              e.target.value = '';
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none bg-white disabled:opacity-60"
          >
            <option value="">+ اختر خدمة إضافية (سونار، غيار، خياطة...)</option>
            {availableServices
              .filter((s) => !isConsultationService(s))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.price ?? s.default_price} ج.م)
                </option>
              ))}
          </select>
        </div>

        {/* Selected Services Tags */}
        {selectedServices.length > 0 && (
          <div className="space-y-1.5">
            {selectedServices.map((sel) => {
              const matched = availableServices.find((s) => s.id === sel.service_id);
              return (
                <div
                  key={sel.service_id}
                  className="flex items-center justify-between p-2 bg-clinic-50/50 border border-clinic-100 rounded-xl text-xs"
                >
                  <span className="text-slate-800 font-semibold">{matched?.name || 'خدمة'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-clinic-700">
                      {matched?.price ?? matched?.default_price} ج.م
                    </span>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onRemoveService(sel.service_id)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Primary Checkout Button */}
        <div className="pt-3 border-t border-slate-100">
          <Button
            variant="primary"
            disabled={disabled}
            onClick={onOpenCheckout}
            className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-clinic-600/20 gap-2 cursor-pointer"
          >
            <CheckCircle2 className="h-5 w-5" />
            إنهاء الكشف والتحصيل الفوري
          </Button>
        </div>
      </div>

      {/* Private Notes */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
        <label className="block text-xs font-semibold text-slate-700">
          ملاحظات الطبيب السرية (خاصة بك فقط)
        </label>
        <textarea
          rows={4}
          disabled={disabled}
          value={privateNotes}
          onChange={(e) => onPrivateNotesChange(e.target.value)}
          placeholder="ملاحظات شخصية لا تظهر للمريض ولا تطبع في الروشتة..."
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none disabled:opacity-60"
        />
      </div>
    </div>
  );
}
