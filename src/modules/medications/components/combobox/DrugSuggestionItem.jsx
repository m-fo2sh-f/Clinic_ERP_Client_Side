import React from 'react';
import { Star, Pill } from 'lucide-react';

/**
 * Individual drug suggestion item rendered inside the Combobox dropdown.
 */
export default function DrugSuggestionItem({
  item,
  isFocused,
  onSelect,
}) {
  const tradeName = item.trade_name || item.name || '';
  const isDoctorFavorite = Boolean(item.is_doctor_favorite ?? item.is_favorite);

  return (
    <div
      role="option"
      aria-selected={isFocused}
      onClick={() => onSelect(item)}
      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between gap-2 border-b border-slate-100 last:border-b-0 transition-colors ${
        isFocused ? 'bg-clinic-50 text-clinic-900 font-medium' : 'hover:bg-slate-50 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isDoctorFavorite ? (
          <span title="من أدويتك الأكثر وصفاً" className="text-amber-500 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
          </span>
        ) : (
          <span className="text-slate-400 shrink-0">
            <Pill className="h-3.5 w-3.5" />
          </span>
        )}

        <div className="min-w-0 truncate">
          <div className="font-bold text-slate-900 truncate" dir="ltr">
            {tradeName}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 truncate">
            {item.strength && (
              <span className="bg-slate-100 px-1.5 py-0.2 rounded font-mono text-slate-700 font-bold" dir="ltr">
                {item.strength}
              </span>
            )}
            {item.form && (
              <span className="bg-clinic-50 px-1.5 py-0.2 rounded font-mono text-clinic-700 border border-clinic-200">
                {item.form}
              </span>
            )}
            {item.active_ingredient && (
              <span className="truncate text-slate-500" title={item.active_ingredient}>
                {item.active_ingredient}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-left">
        {isDoctorFavorite && item.default_dosage ? (
          <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
            {item.default_dosage}
          </span>
        ) : isDoctorFavorite ? (
          <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-full">
            أدويتك
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono">
            دليل مصر
          </span>
        )}
      </div>
    </div>
  );
}
