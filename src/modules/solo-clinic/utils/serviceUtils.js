/**
 * Helper utilities for identifying clinic services and consultation fees.
 */

export const isConsultationService = (service) => {
  if (!service) return false;
  const code = (service.code || '').toUpperCase();
  const name = service.name || '';
  return (
    code.includes('CONSULT') ||
    code.startsWith('GEN-') ||
    code.startsWith('SPEC-') ||
    name.includes('كشف') ||
    name.toLowerCase().includes('consult')
  );
};

export const findConsultationService = (services) => {
  if (!Array.isArray(services) || services.length === 0) return null;
  return services.find(isConsultationService) || services[0] || null;
};
