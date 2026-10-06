/**
 * Safely format any clinical data field (string, number, array, or object)
 * into a renderable React string, preventing "Objects are not valid as a React child" errors.
 * Returns null if the value is empty, null, undefined, or an empty object/array.
 *
 * @param {unknown} val
 * @returns {string | null}
 */
export const formatClinicalText = (val) => {
  if (val === null || val === undefined) return null;

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '{}' || trimmed === '[]') return null;
    return trimmed;
  }

  if (typeof val === 'number') {
    return String(val);
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    const formatted = val
      .map((item) => {
        if (item === null || item === undefined) return '';
        if (typeof item === 'object') {
          return item.name || item.label || item.title || item.text || item.description || JSON.stringify(item);
        }
        return String(item).trim();
      })
      .filter((s) => s && s !== '{}' && s !== '[]')
      .join(', ');

    return formatted.length > 0 ? formatted : null;
  }

  if (typeof val === 'object') {
    const keys = Object.keys(val);
    if (keys.length === 0) return null;

    if (val.text || val.notes || val.title || val.name || val.description || val.value) {
      const extracted = val.text || val.notes || val.title || val.name || val.description || val.value;
      return typeof extracted === 'string' ? extracted : JSON.stringify(extracted);
    }

    const entries = Object.entries(val)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);

    return entries.length > 0 ? entries.join(', ') : null;
  }

  return null;
};

export default formatClinicalText;
