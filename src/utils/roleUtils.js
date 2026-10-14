/**
 * Normalizes user roles into a clean array of role strings.
 * Handles strings, arrays, or objects returned by backend APIs.
 */
export const getUserRoles = (user) => {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles;
  if (user.roles && typeof user.roles === 'object') return Object.values(user.roles);
  if (user.role) return [user.role];
  return [];
};

/**
 * Checks if a user possesses a specific role string.
 */
export const hasRole = (user, roleName) => {
  const roles = getUserRoles(user);
  return roles.includes(roleName);
};

/**
 * Determines the primary dashboard route for a given user.
 * - Super admin -> '/platform'
 * - Doctor (and not Receptionist) -> '/doctor'
 * - Receptionist or Clinic Owner -> '/dashboard'
 * - Fallback -> '/dashboard'
 */
export const getRoleDefaultRoute = (user, activeBranch = null) => {
  if (!user) return '/login';
  if (user.is_super_admin) {
    return '/platform';
  }
  const roles = getUserRoles(user);
  
  if (roles.includes('doctor') && !roles.includes('receptionist')) {
    return '/doctor';
  }
  if (roles.includes('receptionist') || roles.includes('clinic_owner')) {
    return '/dashboard';
  }
  return '/dashboard';
};