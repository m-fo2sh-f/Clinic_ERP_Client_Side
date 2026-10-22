/**
 * Medication Normalizer Utility
 * Single Source of Truth: drug_name and dosage.
 */

/**
 * Build unified dosage and instruction text from any medication object.
 */
export function getUnifiedDosageText(med) {
  if (!med) return '';

  const explicitDosage = med.dosage || med.default_dosage || '';
  return typeof explicitDosage === 'string' ? explicitDosage.trim() : String(explicitDosage).trim();
}

/**
 * Normalize an incoming medication (e.g. from history re-prescribe or catalog selection)
 * into the standard reactive state shape.
 */
export function normalizeMedication(rawMed, fallbackId = null) {
  if (!rawMed) {
    return {
      id: fallbackId || crypto.randomUUID(),
      name: '',
      drug_name: '',
      dosage: '',
      form: '',
      strength: '',
      active_ingredient: '',
    };
  }

  const tradeName = (rawMed.trade_name || rawMed.name || rawMed.drug_name || '').trim();
  const unifiedDosage = getUnifiedDosageText(rawMed);

  return {
    id: rawMed.id || fallbackId || crypto.randomUUID(),
    name: tradeName,
    drug_name: tradeName,
    drug_id: rawMed.drug_id || null,
    dosage: unifiedDosage,
    form: rawMed.form || '',
    strength: rawMed.strength || '',
    active_ingredient: rawMed.active_ingredient || '',
    is_doctor_favorite: Boolean(rawMed.is_doctor_favorite ?? rawMed.is_favorite),
    default_dosage: rawMed.default_dosage || '',
  };
}

/**
 * Format medications array for submission to encounter completion endpoint.
 */
export function formatMedicationsForSubmit(medications) {
  if (!Array.isArray(medications)) return [];

  return medications
    .map((med, index) => {
      const name = (med.name || med.drug_name || '').trim();
      if (!name) return null;

      const dosageText = getUnifiedDosageText(med);

      return {
        drug_name: name,
        drug_id: med.drug_id || null,
        dosage: dosageText,
        sort_order: index,
      };
    })
    .filter(Boolean);
}
