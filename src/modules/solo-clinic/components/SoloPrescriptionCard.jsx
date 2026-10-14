import React from 'react';
import { Pill, Plus, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';

/**
 * SoloPrescriptionCard — Single Responsibility Component
 * Manages the digital prescription (Rx) medication line items.
 */
export default function SoloPrescriptionCard({
  medications = [],
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
  disabled = false,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Title & Add Action */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Pill className="h-4 w-4 text-clinic-600" />
          الروشتة الإلكترونية (Rx Prescription)
        </h3>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onAddMedication}
          className="text-xs gap-1 py-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة دواء
        </Button>
      </div>

      {/* Empty State */}
      {medications.length === 0 ? (
        <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
          لم تتم إضافة أي أدوية حتى الآن. اضغط على زر "إضافة دواء" لبدء كتابة الروشتة.
        </div>
      ) : (
        /* Medications Line Items */
        <div className="space-y-3">
          {medications.map((med, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-3 relative hover:border-clinic-200 transition-all"
            >
              {/* Drug Name & Remove */}
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  disabled={disabled}
                  value={med.drug_name}
                  onChange={(e) => onUpdateMedication(idx, 'drug_name', e.target.value)}
                  placeholder="اسم الدواء والشكل الصيدلي (مثال: Augmentin 1g tab)"
                  className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemoveMedication(idx)}
                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors disabled:opacity-50"
                  title="حذف الدواء"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Posology Fields: Dose, Frequency, Duration, Instructions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  disabled={disabled}
                  value={med.dose}
                  onChange={(e) => onUpdateMedication(idx, 'dose', e.target.value)}
                  placeholder="الجرعة (1 قرص)"
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-60"
                />
                <input
                  type="text"
                  disabled={disabled}
                  value={med.frequency}
                  onChange={(e) => onUpdateMedication(idx, 'frequency', e.target.value)}
                  placeholder="التكرار (كل 12 ساعة)"
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-60"
                />
                <input
                  type="text"
                  disabled={disabled}
                  value={med.duration}
                  onChange={(e) => onUpdateMedication(idx, 'duration', e.target.value)}
                  placeholder="المدة (5 أيام)"
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-60"
                />
                <input
                  type="text"
                  disabled={disabled}
                  value={med.instruction}
                  onChange={(e) => onUpdateMedication(idx, 'instruction', e.target.value)}
                  placeholder="تعليمات (بعد الأكل)"
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-60"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
