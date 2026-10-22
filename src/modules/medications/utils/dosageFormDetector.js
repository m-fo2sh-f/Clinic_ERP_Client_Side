/**
 * Dosage Form Detector & Form-Aware Quick Prescribing Chips
 */

export const DOSAGE_FORMS = {
  TABLET: 'tablet',
  SYRUP: 'syrup',
  DROPS: 'drops',
  TOPICAL: 'topical',
  INJECTION: 'injection',
  SACHET: 'sachet',
  GENERAL: 'general',
};

/**
 * Detect the pharmaceutical form from drug name, route, or form metadata.
 */
export function detectDosageForm(drug) {
  if (!drug) return DOSAGE_FORMS.GENERAL;

  const text = `${drug.trade_name || drug.name || ''} ${drug.form || ''} ${drug.route || ''}`.toLowerCase();

  if (/(tab|caps|cap|tablet|pill|قرص|كبسول|أقراص)/i.test(text)) {
    return DOSAGE_FORMS.TABLET;
  }
  if (/(susp|syr|syrup|liquid|solution|elixir|شراب|معلق|نقط فم)/i.test(text)) {
    return DOSAGE_FORMS.SYRUP;
  }
  if (/(drop|eye|ear|nasal|spray|قطرة|بخاخ|نقط)/i.test(text)) {
    return DOSAGE_FORMS.DROPS;
  }
  if (/(cream|ointment|gel|lotion|topical|دهان|مرهم|كريم|جل|لوشن)/i.test(text)) {
    return DOSAGE_FORMS.TOPICAL;
  }
  if (/(amp|vial|inj|injection|حقن|أمبول|فيال|عضل|وريد)/i.test(text)) {
    return DOSAGE_FORMS.INJECTION;
  }
  if (/(sachet|powder|eff|فوار|كيس|أكياس)/i.test(text)) {
    return DOSAGE_FORMS.SACHET;
  }

  return DOSAGE_FORMS.GENERAL;
}

/**
 * Get tailored quick dosage suggestions based on detected dosage form.
 */
export function getFormDosageChips(dosageForm) {
  switch (dosageForm) {
    case DOSAGE_FORMS.TABLET:
      return [
        'قرص كل 12 ساعة بعد الأكل',
        'قرص مرة واحدة يومياً صباحاً',
        'قرص 3 مرات يومياً قبل الأكل',
        'قرص عند اللزوم للألم',
        'كبسولة بعد العشاء',
      ];
    case DOSAGE_FORMS.SYRUP:
      return [
        '5 سم كل 8 ساعات بعد الأكل',
        'ملعقة صغيرة مرتين يومياً',
        'ملعقة كبيرة 3 مرات يومياً',
        '2.5 سم عند اللزوم للحرارة',
      ];
    case DOSAGE_FORMS.DROPS:
      return [
        'نقطتين في كل عين 3 مرات يومياً',
        'نقطة كل 8 ساعات',
        'بختين في كل فتحة أنف مرتين يومياً',
        '5 نقط بالفم مرتين يومياً',
      ];
    case DOSAGE_FORMS.TOPICAL:
      return [
        'دهان موضعي طبقة رقيقة مرتين يومياً',
        'دهان موضعي مساءً قبل النوم',
        'دهان خفيف 3 مرات يومياً',
      ];
    case DOSAGE_FORMS.INJECTION:
      return [
        'حقنة عضل كل 24 ساعة',
        'حقنة وريد ببطء عند اللزوم',
        'حقنة عضل يوم بعد يوم',
      ];
    case DOSAGE_FORMS.SACHET:
      return [
        'كيس على نصف كوب ماء بعد الأكل',
        'كيس فوار مرتين يومياً',
        'كيس قبل النوم',
      ];
    default:
      return [
        'مرتين يومياً بعد الأكل',
        'مرة واحدة يومياً صباحاً',
        '3 مرات يومياً',
        'عند اللزوم',
      ];
  }
}

/**
 * Duration append chips to quickly extend dosage text.
 */
export const DURATION_APPEND_CHIPS = [
  '+ لمدة 3 أيام',
  '+ لمدة 5 أيام',
  '+ لمدة أسبوع',
  '+ لمدة أسبوعين',
  '+ ويكرر عند اللزوم',
];
