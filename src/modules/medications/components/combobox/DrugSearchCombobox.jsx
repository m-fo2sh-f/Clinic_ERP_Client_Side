import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Plus, X } from 'lucide-react';
import { useDrugSearch } from '../../hooks/useDrugSearch';
import { useCreateDoctorDrugMutation } from '../../hooks/useDoctorDrugsCatalog';
import DrugSuggestionItem from './DrugSuggestionItem';

/**
 * Intelligent Combobox with live debounced search, 0ms doctor preload, and keyboard navigation.
 */
export default function DrugSearchCombobox({
  value = '',
  onChange,
  onSelectDrug,
  placeholder = 'ابحث باسم الدواء (Augmentin, Panadol...)...',
  dosageInputRef,
  className = '',
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const {
    searchTerm,
    setSearchTerm,
    isOpen,
    setIsOpen,
    suggestions,
    isLoading,
    isSearchActive,
  } = useDrugSearch({ initialValue: value });

  const createDrugMutation = useCreateDoctorDrugMutation();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Handle item selection
  const handleSelectItem = (item) => {
    const tradeName = item.trade_name || item.name || '';
    setSearchTerm(tradeName);
    if (typeof onChange === 'function') {
      onChange(tradeName);
    }
    if (typeof onSelectDrug === 'function') {
      onSelectDrug(item);
    }
    setIsOpen(false);
    setFocusedIndex(-1);

    // Keyboard flow: auto-focus to dosage field
    if (dosageInputRef?.current) {
      setTimeout(() => {
        dosageInputRef.current.focus();
      }, 50);
    }
  };

  // Add custom drug on the fly
  const handleAddCustom = (nameToAdd) => {
    const trimmed = (nameToAdd || searchTerm).trim();
    if (!trimmed) return;

    createDrugMutation.mutate(
      { trade_name: trimmed, is_favorite: true },
      {
        onSuccess: (newDrug) => {
          handleSelectItem(newDrug || { trade_name: trimmed, is_doctor_favorite: true });
        },
      }
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        handleSelectItem(suggestions[focusedIndex]);
      } else if (searchTerm.trim() !== '') {
        handleAddCustom(searchTerm);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-3 py-2 pr-9 pl-8 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-clinic-500 focus:bg-white font-sans font-bold text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (typeof onChange === 'function') {
              onChange(e.target.value);
            }
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          dir="ltr"
        />

        {/* Left icon: Search or Loading */}
        <div className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-clinic-600" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* Clear button if text exists */}
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              if (typeof onChange === 'function') onChange('');
              inputRef.current?.focus();
            }}
            className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 divide-y divide-slate-100"
          dir="rtl"
        >
          {/* Header Tag */}
          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 flex items-center justify-between">
            <span>
              {isSearchActive ? 'نتائج البحث عن الصنف:' : '⭐ أدويتك الأكثر استخداماً (وصول سريع):'}
            </span>
            {suggestions.length > 0 && (
              <span className="font-mono">{suggestions.length} صنف</span>
            )}
          </div>

          {/* List items */}
          {suggestions.length === 0 && !isLoading ? (
            <div className="p-3 text-center text-xs text-slate-400">
              لم يتم العثور على أدوية مطابقة في الدليل.
            </div>
          ) : (
            suggestions.map((item, index) => (
              <DrugSuggestionItem
                key={item.id || `${item.trade_name}-${index}`}
                item={item}
                isFocused={focusedIndex === index}
                onSelect={handleSelectItem}
                searchTerm={searchTerm}
              />
            ))
          )}

          {/* Add as custom drug action */}
          {searchTerm.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => handleAddCustom(searchTerm)}
              disabled={createDrugMutation.isPending}
              className="w-full px-3 py-2 text-xs text-right font-bold text-clinic-700 bg-clinic-50/80 hover:bg-clinic-100 flex items-center justify-between transition-colors cursor-pointer border-t border-clinic-150"
            >
              <div className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة &quot;<strong className="font-sans" dir="ltr">{searchTerm}</strong>&quot; كصنف جديد في جدولك</span>
              </div>
              <span className="text-[10px] bg-white text-clinic-800 px-2 py-0.5 rounded border border-clinic-200">
                حفظ سريع
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
