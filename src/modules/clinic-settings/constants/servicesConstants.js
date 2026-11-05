/**
 * Common medical service categories for clinic operations.
 */
export const SERVICE_CATEGORIES = [
  { id: 'consultation', label: 'كشوفات واستشارات' },
  { id: 'diagnostics', label: 'فحوصات ورسم قلب وأشعة' },
  { id: 'procedures', label: 'إجراءات وعمليات صغرى' },
  { id: 'laboratory', label: 'تحاليل وعينات' },
  { id: 'other', label: 'خدمات طبية أخرى' },
];

/**
 * Service validation bounds.
 */
export const SERVICE_VALIDATION_LIMITS = {
  minPrice: 0,
  maxPrice: 100000,
  maxNameLength: 150,
  maxCodeLength: 50,
};

export default {
  SERVICE_CATEGORIES,
  SERVICE_VALIDATION_LIMITS,
};
