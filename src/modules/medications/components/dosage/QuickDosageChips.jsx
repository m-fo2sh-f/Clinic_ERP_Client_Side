import React, { useMemo } from 'react';
import {
  detectDosageForm,
  getFormDosageChips,
  DURATION_APPEND_CHIPS,
} from '../../utils/dosageFormDetector';

/**
 * Form-Aware Quick Dosage Chips & Duration Append Helpers.
 */
export default function QuickDosageChips({
  selectedDrug,
  currentDosage = '',
  onSelectDosage,
  onAppendDuration,
}) {
  const dosageForm = useMemo(() => {
    return detectDosageForm(selectedDrug);
  }, [selectedDrug]);

  const formChips = useMemo(() => {
    return getFormDosageChips(dosageForm);
  }, [dosageForm]);

  const handleSelectChip = (chipText) => {
    if (typeof onSelectDosage === 'function') {
      onSelectDosage(chipText);
    }
  };

  const handleAppendDuration = (durationText) => {
    if (typeof onAppendDuration === 'function') {
      onAppendDuration(durationText);
      return;
    }

    // Default append logic
    const cleanDuration = durationText.replace(/^\+\s*/, '').trim();
    const existing = (currentDosage || '').trim();

    if (!existing) {
      if (typeof onSelectDosage === 'function') onSelectDosage(cleanDuration);
    } else if (!existing.includes(cleanDuration)) {
      if (typeof onSelectDosage === 'function') onSelectDosage(`${existing} ${cleanDuration}`);
    }
  };

  return (
    <div className="space-y-1.5 pt-1 text-[11px]" dir="rtl">
      {/* Primary Dosage Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-400 font-bold text-[10px] shrink-0">
          جرعات مقترحة:
        </span>
        {formChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectChip(chip)}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-clinic-50 hover:text-clinic-800 hover:border-clinic-300 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer text-[10px]"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Duration Append Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-400 font-bold text-[10px] shrink-0">
          إلحاق المدة:
        </span>
        {DURATION_APPEND_CHIPS.map((dur, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAppendDuration(dur)}
            className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium transition-all cursor-pointer text-[10px]"
          >
            {dur}
          </button>
        ))}
      </div>
    </div>
  );
}
