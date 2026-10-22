import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchDrugs } from '../api/medicationsApi';
import { useDoctorDrugsQuery } from './useDoctorDrugsCatalog';
import { useDebounce } from '../../../hooks/useDebounce';

/**
 * Intelligent debounced drug search hook.
 *
 * Performance Architecture:
 * 1. Preloads doctor's favorite/frequent drugs in cache (0ms immediate access on focus).
 * 2. If query < 2 chars, NEVER hits the backend (filters locally from doctor's cached drugs with 0 network calls).
 * 3. When query >= 2 chars, strictly debounces for 350ms of keyboard idle before firing network request.
 * 4. Passes AbortSignal to cancel pending requests when user continues typing.
 */
export function useDrugSearch({ initialValue = '', limit = 15 } = {}) {
  const [searchTerm, setSearchTerm] = useState(initialValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const lastEmittedValueRef = useRef(initialValue);

  // Sync from external prop only when prop actually changed externally (e.g. selection or reset)
  useEffect(() => {
    if (initialValue !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = initialValue || '';
      setSearchTerm(initialValue || '');
    }
  }, [initialValue]);

  // Reusable 350ms keyboard idle debounce
  const debouncedRawTerm = useDebounce(searchTerm, 350);
  const debouncedTerm = (debouncedRawTerm || '').trim().length >= 2 ? (debouncedRawTerm || '').trim() : '';

  // Preloaded doctor frequent/favorite drugs
  const { data: preloadedDoctorDrugs = [] } = useDoctorDrugsQuery();

  // Search is ONLY active against backend when debouncedTerm is >= 2 chars
  const isSearchActive = Boolean(debouncedTerm && debouncedTerm.length >= 2);

  const { data: apiSearchResults = [], isFetching: isSearchLoading } = useQuery({
    queryKey: ['drugSearch', debouncedTerm, limit],
    queryFn: ({ signal }) => searchDrugs(debouncedTerm, limit, { signal }),
    enabled: isSearchActive,
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });

  // Calculate suggestions:
  // If search is NOT active (< 2 chars):
  // Filter locally from preloaded doctor drugs in 0ms without hitting the server!
  const suggestions = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();

    if (!isSearchActive) {
      if (!term) {
        return preloadedDoctorDrugs.slice(0, limit);
      }
      // 1-character local filter on doctor's catalog
      return preloadedDoctorDrugs
        .filter((d) => (d.trade_name || '').toLowerCase().startsWith(term))
        .slice(0, limit);
    }

    return apiSearchResults;
  }, [isSearchActive, searchTerm, preloadedDoctorDrugs, apiSearchResults, limit]);

  return {
    searchTerm,
    setSearchTerm: (val) => {
      lastEmittedValueRef.current = val;
      setSearchTerm(val);
    },
    debouncedTerm,
    isOpen,
    setIsOpen,
    suggestions,
    isLoading: isSearchLoading && isSearchActive,
    isSearchActive,
  };
}
